import { useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Activity } from "@/types";
import { CATEGORY_COLORS } from "@/constants/categories";
import { formatMinutes } from "@/utils/statistics";
import { formatTime12h } from "@/utils/date";

const THRESHOLD = 70;
const MAX = 140;

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
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const locked = useRef<"h" | "v" | null>(null);
  const color = CATEGORY_COLORS[activity.category];

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    startY.current = e.clientY;
    locked.current = null;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (startX.current == null || startY.current == null) return;
    const dxRaw = e.clientX - startX.current;
    const dyRaw = e.clientY - startY.current;
    if (locked.current == null) {
      if (Math.abs(dxRaw) < 8 && Math.abs(dyRaw) < 8) return;
      locked.current = Math.abs(dxRaw) > Math.abs(dyRaw) ? "h" : "v";
    }
    if (locked.current !== "h") return;
    e.preventDefault();
    setDx(Math.max(-MAX, Math.min(MAX, dxRaw)));
  }

  function finish() {
    if (dx <= -THRESHOLD) onDelete(activity);
    else if (dx >= THRESHOLD) onEdit(activity);
    setDx(0);
    setDragging(false);
    startX.current = null;
    startY.current = null;
    locked.current = null;
  }

  const editActive = dx >= THRESHOLD;
  const deleteActive = dx <= -THRESHOLD;

  return (
    <div className="relative overflow-hidden rounded-2xl select-none">
      <div className="absolute inset-0 flex items-center justify-between px-5 text-sm font-semibold">
        <span
          className={`flex items-center gap-2 transition-colors ${
            editActive ? "text-primary" : "text-primary/50"
          }`}
        >
          <Pencil className="h-4 w-4" /> Edit
        </span>
        <span
          className={`flex items-center gap-2 transition-colors ${
            deleteActive ? "text-destructive" : "text-destructive/50"
          }`}
        >
          Delete <Trash2 className="h-4 w-4" />
        </span>
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging ? "none" : "transform 200ms ease",
          touchAction: "pan-y",
        }}
        className="relative flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
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
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(activity);
            }}
            className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Edit activity"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(activity);
            }}
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
