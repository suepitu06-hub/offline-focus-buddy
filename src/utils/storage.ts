import { db } from "@/database/db";
import type { Activity } from "@/types";

export async function exportJSON(): Promise<string> {
  const activities = await db.activities.toArray();
  const settings = await db.settings.toArray();
  return JSON.stringify({ version: 1, activities, settings }, null, 2);
}

export async function exportCSV(): Promise<string> {
  const activities = await db.activities.toArray();
  const header = "id,date,time,application,category,durationMinutes,note";
  const rows = activities.map((a) =>
    [a.id, a.date, a.time, a.application, a.category, a.durationMinutes, JSON.stringify(a.note ?? "")].join(","),
  );
  return [header, ...rows].join("\n");
}

export async function importJSON(text: string): Promise<void> {
  const parsed = JSON.parse(text) as { activities?: Activity[] };
  if (!parsed.activities) throw new Error("Invalid backup file");
  await db.transaction("rw", db.activities, async () => {
    for (const a of parsed.activities!) {
      const { id: _id, ...rest } = a;
      await db.activities.add(rest as Activity);
    }
  });
}

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function resetAllData(): Promise<void> {
  await db.activities.clear();
  await db.statistics_cache.clear();
}

export async function seedSampleData(): Promise<void> {
  const count = await db.activities.count();
  if (count > 0) return;
  const today = new Date().toISOString().slice(0, 10);
  const samples: Omit<Activity, "id">[] = [
    { date: today, time: "08:30", application: "YouTube", category: "Entertainment", durationMinutes: 45, note: "Watched tutorials", createdAt: Date.now() },
    { date: today, time: "10:15", application: "Instagram", category: "Social Media", durationMinutes: 30, createdAt: Date.now() },
    { date: today, time: "12:00", application: "WhatsApp", category: "Communication", durationMinutes: 20, createdAt: Date.now() },
    { date: today, time: "14:30", application: "Chrome", category: "Productivity", durationMinutes: 60, createdAt: Date.now() },
    { date: today, time: "18:00", application: "Spotify", category: "Entertainment", durationMinutes: 40, createdAt: Date.now() },
  ];
  await db.activities.bulkAdd(samples as Activity[]);
}
