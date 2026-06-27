import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Plus } from "lucide-react";
import { db } from "@/database/db";
import { todayISO } from "@/utils/date";
import { ActivityCard } from "@/components/ActivityCard";
import { ActivityModal } from "@/components/ActivityModal";
import { EmptyState } from "@/components/EmptyState";
import { formatMinutes } from "@/utils/statistics";
import type { Activity } from "@/types";

export const Route = createFileRoute("/log")({
  head: () => ({
    meta: [{ title: "Today's Log — Screen Time Management" }],
  }),
  component: TodayLog,
});

function TodayLog() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const today = todayISO();
  const activities =
    useLiveQuery(
      () => db.activities.where("date").equals(today).reverse().sortBy("time"),
      [today],
    ) ?? [];

  const total = activities.reduce((s, a) => s + a.durationMinutes, 0);

  async function handleDelete(a: Activity) {
    if (a.id != null) await db.activities.delete(a.id);
  }
  function handleEdit(a: Activity) {
    setEditing(a);
    setModalOpen(true);
  }

  return (
    <div className="p-5">
      <header className="mb-5">
        <h1 className="text-2xl font-bold">Today's Log</h1>
        <p className="text-sm text-muted-foreground">
          {activities.length} {activities.length === 1 ? "activity" : "activities"} · {formatMinutes(total)}
        </p>
      </header>

      {activities.length === 0 ? (
        <EmptyState
          emoji="📝"
          title="Start logging your screen time"
          action={
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
              className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Add Activity
            </button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {activities.map((a) => (
            <li key={a.id}>
              <ActivityCard activity={a} onDelete={handleDelete} onEdit={handleEdit} />
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => {
          setEditing(null);
          setModalOpen(true);
        }}
        aria-label="Add activity"
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
      >
        <Plus className="h-6 w-6" />
      </button>

      <ActivityModal
        open={modalOpen}
        editing={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      />
    </div>
  );
}
