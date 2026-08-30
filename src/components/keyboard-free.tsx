import { Minus, Plus } from "lucide-react";

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  columns = 3,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`truncate rounded-xl border px-2 py-2 text-xs font-medium ${
            value === o
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Stepper({
  label,
  display,
  onDecrement,
  onIncrement,
  disabledDecrement,
  disabledIncrement,
}: {
  label?: string;
  display: string;
  onDecrement: () => void;
  onIncrement: () => void;
  disabledDecrement?: boolean;
  disabledIncrement?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-2 py-2">
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabledDecrement}
        aria-label={`Decrease ${label ?? ""}`.trim()}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="min-w-0 text-center">
        {label ? <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span> : null}
        <span className="block text-sm font-semibold tabular-nums">{display}</span>
      </div>
      <button
        type="button"
        onClick={onIncrement}
        disabled={disabledIncrement}
        aria-label={`Increase ${label ?? ""}`.trim()}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-secondary"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow transition-all ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}
