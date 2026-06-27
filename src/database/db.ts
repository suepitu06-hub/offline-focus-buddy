import Dexie, { type Table } from "dexie";
import type { Activity, Settings, StatisticsCache } from "@/types";

export class ScreenTimeDB extends Dexie {
  activities!: Table<Activity, number>;
  settings!: Table<Settings, number>;
  statistics_cache!: Table<StatisticsCache, string>;

  constructor() {
    super("screen_time_db");
    this.version(1).stores({
      activities: "++id, date, category, application, createdAt",
      settings: "id",
      statistics_cache: "date",
    });
  }
}

export const db = new ScreenTimeDB();

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  dailyGoalMinutes: 240,
  theme: "system",
  reminderEnabled: false,
  reminderInterval: 60,
};

export async function ensureSettings(): Promise<Settings> {
  const existing = await db.settings.get(1);
  if (existing) return existing;
  await db.settings.put(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}
