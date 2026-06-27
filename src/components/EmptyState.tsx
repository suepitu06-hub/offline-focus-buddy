import type { ReactNode } from "react";

export function EmptyState({
  emoji,
  title,
  action,
}: {
  emoji: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <div className="text-6xl" aria-hidden>
        {emoji}
      </div>
      <p className="text-sm text-muted-foreground">{title}</p>
      {action}
    </div>
  );
}
