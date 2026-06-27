import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useRef, useState } from "react";
import { Download, FileJson, Upload, RotateCcw, Sparkles } from "lucide-react";
import { db, ensureSettings } from "@/database/db";
import { downloadFile, exportCSV, exportJSON, importJSON, resetAllData, seedSampleData } from "@/utils/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [{ title: "Settings — Screen Time Management" }],
  }),
  component: SettingsPage,
});

const GOAL_PRESETS = [60, 120, 180, 240, 300];
const INTERVALS = [30, 60, 90, 120];

function SettingsPage() {
  const settings = useLiveQuery(() => ensureSettings(), []);
  const [customGoal, setCustomGoal] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!settings) return <div className="p-5">Loading…</div>;

  async function update(patch: Record<string, unknown>) {
    await db.settings.update(1, patch);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      await importJSON(text);
      alert("Import successful");
    } catch (err) {
      alert("Import failed: " + (err as Error).message);
    }
    e.target.value = "";
  }

  return (
    <div className="space-y-6 p-5">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>

      <Section title="Daily Goal">
        <div className="grid grid-cols-3 gap-2">
          {GOAL_PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => update({ dailyGoalMinutes: m })}
              className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                settings.dailyGoalMinutes === m
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground"
              }`}
            >
              {m / 60}h
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            min={15}
            placeholder="Custom (minutes)"
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            className="input"
          />
          <button
            type="button"
            onClick={() => {
              const n = Number(customGoal);
              if (n > 0) update({ dailyGoalMinutes: n });
              setCustomGoal("");
            }}
            className="rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Set
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Current goal: {settings.dailyGoalMinutes} minutes
        </p>
      </Section>

      <Section title="Reminders">
        <Row
          label="Enable Reminders"
          hint="Prepared for native notifications on mobile."
        >
          <input
            type="checkbox"
            checked={settings.reminderEnabled}
            onChange={(e) => update({ reminderEnabled: e.target.checked })}
            className="h-5 w-9 cursor-pointer"
          />
        </Row>
        {settings.reminderEnabled ? (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {INTERVALS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => update({ reminderInterval: m })}
                className={`rounded-xl border px-2 py-2 text-xs font-medium ${
                  settings.reminderInterval === m
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        ) : null}
      </Section>

      <Section title="Theme">
        <div className="grid grid-cols-3 gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update({ theme: t })}
              className={`rounded-xl border px-3 py-2 text-sm font-medium capitalize ${
                settings.theme === t
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Data">
        <div className="space-y-2">
          <SettingButton
            icon={<Download className="h-4 w-4" />}
            label="Export CSV"
            onClick={async () => downloadFile("screen-time.csv", await exportCSV(), "text/csv")}
          />
          <SettingButton
            icon={<FileJson className="h-4 w-4" />}
            label="Export JSON"
            onClick={async () =>
              downloadFile("screen-time.json", await exportJSON(), "application/json")
            }
          />
          <SettingButton
            icon={<Upload className="h-4 w-4" />}
            label="Import JSON Backup"
            onClick={() => fileRef.current?.click()}
          />
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />
          <SettingButton
            icon={<Sparkles className="h-4 w-4" />}
            label="Load Sample Data"
            onClick={async () => {
              await seedSampleData();
              alert("Sample data added");
            }}
          />
          <SettingButton
            icon={<RotateCcw className="h-4 w-4" />}
            label="Reset All Data"
            destructive
            onClick={() => setConfirmReset(true)}
          />
        </div>
      </Section>

      <Section title="About">
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between"><span className="text-muted-foreground">Version</span><span>1.0.0</span></li>
          <li className="flex justify-between"><span className="text-muted-foreground">Developer</span><span>Screen Time Team</span></li>
          <li className="text-xs text-muted-foreground">
            This app is 100% offline. No data ever leaves your device.
          </li>
        </ul>
      </Section>

      {confirmReset ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-card p-5">
            <h3 className="text-lg font-semibold">Reset all data?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This will permanently delete all logged activities. This cannot be undone.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="flex-1 rounded-2xl border border-border px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await resetAllData();
                  setConfirmReset(false);
                }}
                className="flex-1 rounded-2xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{title}</h2>
      <div className="rounded-2xl border border-border bg-card p-4">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

function SettingButton({
  label,
  icon,
  onClick,
  destructive,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium hover:bg-accent ${
        destructive ? "text-destructive" : "text-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
