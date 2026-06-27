import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Activity, Category } from "@/types";
import { APPLICATIONS } from "@/constants/apps";
import { CATEGORIES } from "@/constants/categories";
import { todayISO, currentTime } from "@/utils/date";
import { db } from "@/database/db";

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
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(15);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(currentTime());
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setApplication(editing.application);
      setCategory(editing.category);
      setHours(Math.floor(editing.durationMinutes / 60));
      setMinutes(editing.durationMinutes % 60);
      setDate(editing.date);
      setTime(editing.time);
      setNote(editing.note ?? "");
    } else {
      setApplication("YouTube");
      setCategory("Entertainment");
      setHours(0);
      setMinutes(15);
      setDate(todayISO());
      setTime(currentTime());
      setNote("");
    }
  }, [open, editing]);

  if (!open) return null;

  async function handleSave() {
    const total = hours * 60 + minutes;
    if (total <= 0) return;
    const payload: Omit<Activity, "id"> = {
      application,
      category,
      durationMinutes: total,
      date,
      time,
      note: note.trim() || undefined,
      createdAt: editing?.createdAt ?? Date.now(),
    };
    if (editing?.id != null) {
      await db.activities.update(editing.id, payload);
    } else {
      await db.activities.add(payload as Activity);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-3xl">
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
            <select
              value={application}
              onChange={(e) => setApplication(e.target.value)}
              className="input"
            >
              {APPLICATIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="input"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Hours">
              <input
                type="number"
                min={0}
                max={23}
                value={hours}
                onChange={(e) => setHours(Math.max(0, Number(e.target.value) || 0))}
                className="input"
              />
            </Field>
            <Field label="Minutes">
              <input
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Time">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label="Note (optional)">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note about this activity"
              className="input resize-none"
            />
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
