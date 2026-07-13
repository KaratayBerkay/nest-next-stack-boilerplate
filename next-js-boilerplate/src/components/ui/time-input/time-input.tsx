"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { TimeInputProps, TimeInputVariant } from "@/types/ui/TimeInput-types";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

const variantStyles: Record<TimeInputVariant, string> = {
  default: "border border-border bg-bg rounded-lg",
  shiny:
    "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg shadow-lg",
  glass: "bg-white/10 backdrop-blur-md border border-white/10 rounded-lg",
  neon: "bg-slate-950 border border-cyan-500/40 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.15)]",
  gradient:
    "bg-gradient-to-br from-violet-600 to-indigo-600 border border-white/10 rounded-lg",
};

const selectClasses: Record<TimeInputVariant, string> = {
  default:
    "bg-bg border-border focus-visible:ring-brand",
  shiny:
    "bg-slate-900/80 border-slate-600 focus-visible:ring-cyan-500/50 text-white",
  glass:
    "bg-white/5 border-white/10 focus-visible:ring-white/30 text-white",
  neon:
    "bg-slate-900/80 border-cyan-500/30 focus-visible:ring-cyan-500/50 text-cyan-100",
  gradient:
    "bg-white/10 border-white/20 focus-visible:ring-white/40 text-white",
};

function formatHour(h: number, use24Hour: boolean): string {
  if (use24Hour) return pad(h);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${pad(h12)} ${period}`;
}

interface TimeUnitSelectProps {
  value: number;
  max: number;
  onChange: (val: number) => void;
  disabled?: boolean;
  selectClassName?: string;
  variant: TimeInputVariant;
  use24Hour?: boolean;
  isHour?: boolean;
}

function TimeUnitSelect({
  value,
  max,
  onChange,
  disabled,
  selectClassName,
  variant,
  use24Hour: is24,
  isHour,
}: TimeUnitSelectProps) {
  const options = useMemo(() => {
    const arr: { value: number; label: string }[] = [];
    for (let i = 0; i <= max; i++) {
      arr.push({
        value: i,
        label: isHour && !is24 ? formatHour(i, false) : pad(i),
      });
    }
    return arr;
  }, [max, isHour, is24]);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={cn(
          "h-10 w-[72px] appearance-none rounded-md border px-2 pr-7 text-sm font-medium shadow-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          selectClassName,
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute top-0 right-0 mr-2 h-full"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

function TimezoneBadge({ variant }: { variant: TimeInputVariant }) {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzLabel = timezone.split("/").pop()?.replace("_", " ") ?? timezone;

  const badgeVariant =
    variant === "neon"
      ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
      : variant === "gradient"
        ? "bg-white/10 text-white/80 border-white/20"
        : variant === "glass"
          ? "bg-white/10 text-white/70 border-white/10"
          : variant === "shiny"
            ? "bg-slate-700/50 text-slate-300 border-slate-600"
            : "bg-surface text-muted border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        badgeVariant,
      )}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      {tzLabel}
    </span>
  );
}

export function TimeInput({
  value = { hours: 0, minutes: 0, seconds: 0 },
  onChange,
  variant,
  showSeconds = false,
  use24Hour = true,
  className,
  disabled = false,
  label,
}: TimeInputProps) {
  const effectiveVariant = useComponentVariant(variant);
  const update = (field: "hours" | "minutes" | "seconds", val: number) => {
    if (!onChange) return;
    onChange({ ...value, [field]: val });
  };

  const hourMax = use24Hour ? 23 : 11;
  const displayHour = use24Hour
    ? value.hours
    : value.hours > 12
      ? value.hours - 12
      : value.hours === 0
        ? 12
        : value.hours;

  const period = value.hours >= 12 ? "PM" : "AM";

  const togglePeriod = () => {
    if (!onChange || use24Hour) return;
    const newHours = period === "AM" ? value.hours + 12 : value.hours - 12;
    onChange({ ...value, hours: Math.max(0, Math.min(23, newHours)) });
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex items-center gap-3">
        <div className={cn("flex items-center gap-2 p-2", variantStyles[effectiveVariant as keyof typeof variantStyles])}>
          <TimeUnitSelect
            value={displayHour}
            max={hourMax}
            onChange={(val) => {
              if (!onChange) return;
              if (use24Hour) {
                onChange({ ...value, hours: val });
              } else {
                const base = period === "PM" ? 12 : 0;
                onChange({ ...value, hours: base + val });
              }
            }}
            disabled={disabled}
            selectClassName={selectClasses[effectiveVariant as keyof typeof selectClasses]}
            variant={effectiveVariant as TimeInputVariant}
            use24Hour={use24Hour}
            isHour
          />

          <span className="text-muted text-lg font-medium">:</span>

          <TimeUnitSelect
            value={value.minutes}
            max={59}
            onChange={(val) => update("minutes", val)}
            disabled={disabled}
            selectClassName={selectClasses[effectiveVariant as keyof typeof selectClasses]}
            variant={effectiveVariant as TimeInputVariant}
          />

          {showSeconds && (
            <>
              <span className="text-muted text-lg font-medium">:</span>
              <TimeUnitSelect
                value={value.seconds ?? 0}
                max={59}
                onChange={(val) => update("seconds", val)}
                disabled={disabled}
                selectClassName={selectClasses[effectiveVariant as keyof typeof selectClasses]}
                variant={effectiveVariant as TimeInputVariant}
              />
            </>
          )}

          {!use24Hour && (
            <button
              type="button"
              onClick={togglePeriod}
              disabled={disabled}
              className={cn(
                "h-10 rounded-md border px-2.5 text-xs font-bold shadow-sm transition-colors",
                effectiveVariant === "neon"
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                  : effectiveVariant === "gradient"
                    ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                    : effectiveVariant === "glass"
                      ? "border-white/10 bg-white/10 text-white hover:bg-white/20"
                      : effectiveVariant === "shiny"
                        ? "border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                        : "border-border bg-surface text-foreground hover:bg-surface-hover",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {period}
            </button>
          )}
        </div>

        <TimezoneBadge variant={effectiveVariant as TimeInputVariant} />
      </div>
    </div>
  );
}
