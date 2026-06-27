import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
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
  const last30 = lastNDates(30).map((d) => ({
    day: d.slice(5),
    minutes: totals[d] || 0,
  }));
  const cat = categoryDistribution(activities);

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
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={last7}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
            <Tooltip
              formatter={(v: any) => formatMinutes(Number(v))}
              contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }}
            />
            <Bar dataKey="minutes" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Monthly Trend">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={last30}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={10} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
            <Tooltip
              formatter={(v: any) => formatMinutes(Number(v))}
              contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }}
            />
            <Line type="monotone" dataKey="minutes" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Category Distribution">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={cat} dataKey="value" nameKey="name" outerRadius={80} label>
              {cat.map((c) => (
                <Cell key={c.name} fill={CATEGORY_COLORS[c.name]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: any) => formatMinutes(Number(v))} />
          </PieChart>
        </ResponsiveContainer>
        <ul className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {cat.map((c) => (
            <li key={c.name} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ background: CATEGORY_COLORS[c.name] }} />
              <span className="text-muted-foreground">{c.name}</span>
              <span className="ml-auto font-medium">{formatMinutes(c.value)}</span>
            </li>
          ))}
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
