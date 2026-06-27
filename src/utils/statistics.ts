import type { Activity, Category } from "@/types";
import { todayISO } from "./date";

export function formatMinutes(mins: number): string {
  if (mins <= 0) return "0m";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatHours(mins: number): string {
  return (mins / 60).toFixed(1) + "h";
}

export function calculateDailyTotal(activities: Activity[], date: string): number {
  return activities
    .filter((a) => a.date === date)
    .reduce((sum, a) => sum + a.durationMinutes, 0);
}

export function groupActivitiesByDate(activities: Activity[]): Record<string, Activity[]> {
  const map: Record<string, Activity[]> = {};
  for (const a of activities) {
    (map[a.date] ||= []).push(a);
  }
  return map;
}

export function dailyTotalsMap(activities: Activity[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const a of activities) {
    map[a.date] = (map[a.date] || 0) + a.durationMinutes;
  }
  return map;
}

export function calculateWeeklyAverage(activities: Activity[]): number {
  const totals = dailyTotalsMap(activities);
  const today = new Date();
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    sum += totals[todayISO(d)] || 0;
  }
  return Math.round(sum / 7);
}

export function calculateMonthlyAverage(activities: Activity[]): number {
  const totals = dailyTotalsMap(activities);
  const today = new Date();
  let sum = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    sum += totals[todayISO(d)] || 0;
  }
  return Math.round(sum / 30);
}

/** Streak = consecutive days (ending today or yesterday) where user logged & stayed within goal */
export function calculateStreak(activities: Activity[], goalMinutes: number): number {
  const totals = dailyTotalsMap(activities);
  let streak = 0;
  const d = new Date();
  // allow today even if 0 logged? require some log <= goal
  for (let i = 0; i < 3650; i++) {
    const iso = todayISO(d);
    const total = totals[iso];
    if (total === undefined) {
      if (i === 0) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }
    if (total <= goalMinutes) streak++;
    else break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function calculateLongestStreak(activities: Activity[], goalMinutes: number): number {
  const totals = dailyTotalsMap(activities);
  const dates = Object.keys(totals).sort();
  if (dates.length === 0) return 0;
  let longest = 0;
  let current = 0;
  let prev: Date | null = null;
  for (const iso of dates) {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const within = totals[iso] <= goalMinutes;
    if (!within) {
      current = 0;
      prev = dt;
      continue;
    }
    if (prev) {
      const diff = Math.round((dt.getTime() - prev.getTime()) / 86400000);
      current = diff === 1 ? current + 1 : 1;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
    prev = dt;
  }
  return longest;
}

export function calculateGoalProgress(total: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((total / goal) * 100));
}

export function bestAndWorstDay(activities: Activity[]): {
  best?: { date: string; minutes: number };
  worst?: { date: string; minutes: number };
} {
  const totals = dailyTotalsMap(activities);
  const entries = Object.entries(totals);
  if (entries.length === 0) return {};
  entries.sort((a, b) => a[1] - b[1]);
  return {
    worst: { date: entries[entries.length - 1][0], minutes: entries[entries.length - 1][1] },
    best: { date: entries[0][0], minutes: entries[0][1] },
  };
}

export function categoryDistribution(
  activities: Activity[],
): Array<{ name: Category; value: number }> {
  const map: Record<string, number> = {};
  for (const a of activities) {
    map[a.category] = (map[a.category] || 0) + a.durationMinutes;
  }
  return Object.entries(map).map(([name, value]) => ({ name: name as Category, value }));
}

export function goalAchievementPercent(activities: Activity[], goalMinutes: number): number {
  const totals = dailyTotalsMap(activities);
  const dates = Object.keys(totals);
  if (dates.length === 0) return 0;
  const within = dates.filter((d) => totals[d] <= goalMinutes).length;
  return Math.round((within / dates.length) * 100);
}
