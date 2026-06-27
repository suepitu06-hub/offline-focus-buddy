import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Clock, Target, Flame, TimerReset, Plus, ListChecks, BarChart3 } from "lucide-react";
import { db, ensureSettings } from "@/database/db";
import {
  calculateDailyTotal,
  calculateStreak,
  formatMinutes,
} from "@/utils/statistics";
import { todayISO } from "@/utils/date";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import { ActivityModal } from "@/components/ActivityModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Dashboard — Screen Time Management" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const settings = useLiveQuery(() => ensureSettings(), []);
  const activities = useLiveQuery(() => db.activities.toArray(), []) ?? [];

  const goal = settings?.dailyGoalMinutes ?? 240;
  const today = todayISO();
  const total = calculateDailyTotal(activities, today);
  const remaining = goal - total;
  const exceeded = total > goal;
  const streak = calculateStreak(activities, goal);
  const progress = Math.min(100, goal > 0 ? (total / goal) * 100 : 0);
  const hasToday = activities.some((a) => a.date === today);

  return (
    <div className="p-5">
      <header className="mb-5">
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Screen Time</h1>
      </header>

      <section className="rounded-3xl bg-primary p-5 text-primary-foreground shadow-lg">
        <p className="text-xs font-medium uppercase tracking-wide opacity-80">Today's screen time</p>
        <p className="mt-2 text-4xl font-bold">{formatMinutes(total)}</p>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              backgroundColor: exceeded ? "#ef4444" : "white",
            }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs opacity-90">
          <span>Goal: {formatMinutes(goal)}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <StatCard label="Daily Goal" value={formatMinutes(goal)} icon={<Target className="h-4 w-4" />} />
        <StatCard
          label="Remaining"
          value={exceeded ? "Goal Exceeded" : formatMinutes(remaining)}
          icon={<TimerReset className="h-4 w-4" />}
          className={exceeded ? "border-destructive/40" : ""}
        />
        <StatCard label="Logged Today" value={formatMinutes(total)} icon={<Clock className="h-4 w-4" />} />
        <StatCard label="Current Streak" value={`${streak} ${streak === 1 ? "Day" : "Days"}`} icon={<Flame className="h-4 w-4" />} />
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex flex-col items-center gap-2 rounded-2xl bg-primary/10 p-4 text-primary hover:bg-primary/15"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-semibold">Add</span>
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/log" })}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 hover:bg-accent"
          >
            <ListChecks className="h-5 w-5" />
            <span className="text-xs font-semibold">Log</span>
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/stats" })}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 hover:bg-accent"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs font-semibold">Stats</span>
          </button>
        </div>
      </section>

      {!hasToday ? (
        <section className="mt-5">
          <EmptyState
            emoji="📱"
            title="No screen time logged today."
            action={
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Add First Activity
              </button>
            }
          />
        </section>
      ) : null}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Need more detail? <Link to="/stats" className="text-primary">View statistics →</Link>
      </p>

      <ActivityModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
