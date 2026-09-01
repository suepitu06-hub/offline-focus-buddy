import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db, ensureSettings } from "@/database/db";
import { todayISO, lastNDates, shortDayLabel } from "@/utils/date";
import {
  calculateDailyTotal,
  calculateMonthlyAverage,
  calculateStreak,
  calculateLongestStreak,
  calculateWeeklyAverage,
  bestAndWorstDay,
  categoryDistribution,
  goalAchievementPercent,
  formatMinutes,
  dailyTotalsMap,
} from "@/utils/statistics";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { CATEGORY_COLORS } from "@/constants/categories";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [{ title: "Statistics — Screen Time Management" }],
  }),
  component: Stats,
});


function Stats() {
  const settings = useLiveQuery(() => ensureSettings(), []);
  const activities = useLiveQuery(() => db.activities.toArray(), []) ?? [];
  const goal = settings?.dailyGoalMinutes ?? 240;

  if (activities.length === 0) {
    return (
      <div className="p-5">
        <h1 className="mb-5 text-2xl font-bold">Statistics</h1>
        <EmptyState emoji="📊" title="No statistics available" />
      </div>
    );
  }

  const todayTotal = calculateDailyTotal(activities, todayISO());
  const weeklyAvg = calculateWeeklyAverage(activities);
  const monthlyAvg = calculateMonthlyAverage(activities);
  const { best, worst } = bestAndWorstDay(activities);
  const streak = calculateStreak(activities, goal);
  const longest = calculateLongestStreak(activities, goal);
  const achievement = goalAchievementPercent(activities, goal);

  const totals = dailyTotalsMap(activities);
  const last7 = lastNDates(7).map((d) => ({
    day: shortDayLabel(d),
    minutes: totals[d] || 0,
  }));
  const monthMap: Record<string, number> = {};
  for (const d of lastNDates(180)) {
    const key = d.slice(0, 7);
    monthMap[key] = (monthMap[key] || 0) + (totals[d] || 0);
  }
  const months = Object.keys(monthMap)
    .sort()
    .map((key) => ({ month: key, minutes: monthMap[key] }));
  const cat = categoryDistribution(activities);

  const max7 = Math.max(1, ...last7.map((d) => d.minutes));
  const maxMonth = Math.max(1, ...months.map((m) => m.minutes));
  const catTotal = cat.reduce((s, c) => s + c.value, 0) || 1;

  return (
    <div className="space-y-5 p-5">
      <header>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="text-sm text-muted-foreground">Insights from your screen time history</p>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Today" value={formatMinutes(todayTotal)} />
        <StatCard label="Weekly Avg" value={formatMinutes(weeklyAvg)} />
        <StatCard label="Monthly Avg" value={formatMinutes(monthlyAvg)} />
        <StatCard label="Goal Achievement" value={`${achievement}%`} />
        <StatCard label="Best Day" value={best ? formatMinutes(best.minutes) : "—"} hint={best?.date} />
        <StatCard label="Worst Day" value={worst ? formatMinutes(worst.minutes) : "—"} hint={worst?.date} />
        <StatCard label="Current Streak" value={`${streak}d`} />
        <StatCard label="Longest Streak" value={`${longest}d`} />
      </section>

      <ChartCard title="Last 7 Days">
        <ul className="space-y-2">
          {last7.map((d) => (
            <li key={d.day} className="flex items-center gap-3 text-xs">
              <span className="w-10 shrink-0 text-muted-foreground">{d.day}</span>
              <span className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${Math.round((d.minutes / max7) * 100)}%` }}
                />
              </span>
              <span className="w-14 shrink-0 text-right font-medium">{formatMinutes(d.minutes)}</span>
            </li>
          ))}
        </ul>
      </ChartCard>

      <ChartCard title="Monthly Trend">
        <ul className="space-y-2">
          {months.map((m) => (
            <li key={m.month} className="flex items-center gap-3 text-xs">
              <span className="w-14 shrink-0 text-muted-foreground">{m.month}</span>
              <span className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${Math.round((m.minutes / maxMonth) * 100)}%` }}
                />
              </span>
              <span className="w-14 shrink-0 text-right font-medium">{formatMinutes(m.minutes)}</span>
            </li>
          ))}
        </ul>
      </ChartCard>

      <ChartCard title="Category Distribution">
        <ul className="space-y-3">
          {cat.map((c) => {
            const pct = Math.round((c.value / catTotal) * 100);
            return (
              <li key={c.name} className="text-xs">
                <div className="mb-1 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: CATEGORY_COLORS[c.name] }} />
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="ml-auto font-medium">
                    {formatMinutes(c.value)} · {pct}%
                  </span>
                </div>
                <span className="block h-3 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${pct}%`, background: CATEGORY_COLORS[c.name] }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
      </ChartCard>

    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}
