import { useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Activity } from "@/types";
import { CATEGORY_COLORS } from "@/constants/categories";
import { formatMinutes } from "@/utils/statistics";
import { formatTime12h } from "@/utils/date";

export function ActivityCard({
  activity,
  onDelete,
  onEdit,
}: {
  activity: Activity;
  onDelete: (a: Activity) => void;
  onEdit: (a: Activity) => void;
}) {
  const [dx, setDx] = useState(0);
  const startX = useRef<number | null>(null);
  const color = CATEGORY_COLORS[activity.category];

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (startX.current == null) return;
    const delta = e.touches[0].clientX - startX.current;
    setDx(Math.max(-120, Math.min(120, delta)));
  }
  function onTouchEnd() {
    if (dx < -60) onDelete(activity);
    else if (dx > 60) onEdit(activity);
    setDx(0);
    startX.current = null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 flex items-center justify-between px-5 text-sm font-medium">
        <span className="flex items-center gap-2 text-primary">
          <Pencil className="h-4 w-4" /> Edit
        </span>
        <span className="flex items-center gap-2 text-destructive">
          Delete <Trash2 className="h-4 w-4" />
        </span>
      </div>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: `translateX(${dx}px)` }}
        className="relative flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-transform"
      >
        <div
          className="mt-1 h-10 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-semibold text-foreground">{activity.application}</p>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatTime12h(activity.time)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{activity.category}</p>
          <p className="mt-1 text-sm font-medium text-primary">
            {formatMinutes(activity.durationMinutes)}
          </p>
          {activity.note ? (
            <p className="mt-1 text-xs text-muted-foreground">{activity.note}</p>
          ) : null}
        </div>
        <div className="hidden gap-1 sm:flex">
          <button
            type="button"
            onClick={() => onEdit(activity)}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Edit activity"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(activity)}
            className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Delete activity"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
