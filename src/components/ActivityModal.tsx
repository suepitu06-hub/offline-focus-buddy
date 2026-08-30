import { useEffect, useState } from "react";
import { toast } from "sonner";
import { reportError } from "@/lib/error-handler";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Activity, Category } from "@/types";
import { APPLICATIONS } from "@/constants/apps";
import { CATEGORIES } from "@/constants/categories";
import { NOTE_PRESETS } from "@/constants/notes";
import { todayISO, currentTime, formatTime12h } from "@/utils/date";
import { formatMinutes } from "@/utils/statistics";
import { db } from "@/database/db";
import { ChipGroup, Stepper } from "@/components/keyboard-free";

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return todayISO(dt);
}

function dateLabel(iso: string): string {
  if (iso === todayISO()) return "Today";
  if (iso === shiftDate(todayISO(), -1)) return "Yesterday";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function shiftTime(time: string, deltaMinutes: number): string {
  const [h, m] = time.split(":").map(Number);
  let total = (h * 60 + m + deltaMinutes) % (24 * 60);
  if (total < 0) total += 24 * 60;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function ActivityModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Activity | null;
}) {
  const [application, setApplication] = useState<string>("YouTube");
  const [category, setCategory] = useState<Category>("Entertainment");
  const [duration, setDuration] = useState(15);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(currentTime());
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setApplication(editing.application);
      setCategory(editing.category);
      setDuration(editing.durationMinutes);
      setDate(editing.date);
      setTime(editing.time);
      setNotes(
        editing.note
          ? editing.note.split(", ").filter((n) => (NOTE_PRESETS as readonly string[]).includes(n))
          : [],
      );
    } else {
      setApplication("YouTube");
      setCategory("Entertainment");
      setDuration(15);
      setDate(todayISO());
      setTime(currentTime());
      setNotes([]);
    }
  }, [open, editing?.id]);

  if (!open) return null;

  function toggleNote(n: string) {
    setNotes((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
  }

  async function handleSave() {
    if (duration <= 0) {
      toast.error("Duration must be greater than 0 minutes.");
      return;
    }
    const payload: Omit<Activity, "id"> = {
      application,
      category,
      durationMinutes: duration,
      date,
      time,
      note: notes.length ? notes.join(", ") : undefined,
      createdAt: editing?.createdAt ?? Date.now(),
    };
    try {
      if (editing?.id != null) {
        await db.activities.update(editing.id, payload);
      } else {
        await db.activities.add(payload as Activity);
      }
      onClose();
    } catch (err) {
      reportError(err, "Could not save activity");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-black/50 sm:items-center">
      <div
        className="flex w-full max-w-md flex-col overflow-y-auto overscroll-contain rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-3xl"
        style={{
          maxHeight: "calc(100dvh - 1rem)",
          paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{editing ? "Edit Activity" : "Add Activity"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Application">
            <ChipGroup options={APPLICATIONS} value={application} onChange={setApplication} columns={3} />
          </Field>

          <Field label="Category">
            <ChipGroup options={CATEGORIES} value={category} onChange={setCategory} columns={2} />
          </Field>

          <Field label={`Duration · ${formatMinutes(duration)}`}>
            <div className="mb-2 grid grid-cols-3 gap-2">
              {DURATION_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDuration(m)}
                  aria-pressed={duration === m}
                  className={`rounded-xl border px-2 py-2 text-xs font-medium ${
                    duration === m
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  {formatMinutes(m)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Stepper
                label="Hours"
                display={String(Math.floor(duration / 60))}
                onDecrement={() => setDuration((d) => Math.max(5, d - 60))}
                onIncrement={() => setDuration((d) => Math.min(23 * 60 + 55, d + 60))}
                disabledDecrement={duration < 60}
              />
              <Stepper
                label="Minutes"
                display={`${duration % 60}`}
                onDecrement={() => setDuration((d) => Math.max(5, d - 5))}
                onIncrement={() => setDuration((d) => Math.min(23 * 60 + 55, d + 5))}
                disabledDecrement={duration <= 5}
              />
            </div>
          </Field>

          <Field label="Date">
            <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-2 py-2">
              <button
                type="button"
                onClick={() => setDate((d) => shiftDate(d, -1))}
                aria-label="Previous day"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold">{dateLabel(date)}</span>
              <button
                type="button"
                onClick={() => setDate((d) => (d >= todayISO() ? d : shiftDate(d, 1)))}
                disabled={date >= todayISO()}
                aria-label="Next day"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[0, -1, -2].map((off) => {
                const iso = shiftDate(todayISO(), off);
                return (
                  <button
                    key={off}
                    type="button"
                    onClick={() => setDate(iso)}
                    aria-pressed={date === iso}
                    className={`rounded-xl border px-2 py-2 text-xs font-medium ${
                      date === iso
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    {dateLabel(iso)}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label={`Time · ${formatTime12h(time)}`}>
            <div className="grid grid-cols-2 gap-2">
              <Stepper
                label="Hour"
                display={time.split(":")[0]}
                onDecrement={() => setTime((t) => shiftTime(t, -60))}
                onIncrement={() => setTime((t) => shiftTime(t, 60))}
              />
              <Stepper
                label="Minute"
                display={time.split(":")[1]}
                onDecrement={() => setTime((t) => shiftTime(t, -5))}
                onIncrement={() => setTime((t) => shiftTime(t, 5))}
              />
            </div>
            <button
              type="button"
              onClick={() => setTime(currentTime())}
              className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent"
            >
              Set to now
            </button>
          </Field>

          <Field label="Note (optional)">
            <div className="flex flex-wrap gap-2">
              {NOTE_PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggleNote(n)}
                  aria-pressed={notes.includes(n)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    notes.includes(n)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {editing ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
