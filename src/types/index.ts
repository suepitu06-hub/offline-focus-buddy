export type Category =
  | "Entertainment"
  | "Communication"
  | "Education"
  | "Productivity"
  | "Gaming"
  | "Social Media"
  | "Other";

export interface Activity {
  id?: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  application: string;
  category: Category;
  durationMinutes: number;
  note?: string;
  createdAt: number;
}

export interface Settings {
  id: number;
  dailyGoalMinutes: number;
  theme: "light" | "dark" | "system";
  reminderEnabled: boolean;
  reminderInterval: number;
}

export interface StatisticsCache {
  date: string;
  totalMinutes: number;
  goalMinutes: number;
  achievementPercent: number;
}
