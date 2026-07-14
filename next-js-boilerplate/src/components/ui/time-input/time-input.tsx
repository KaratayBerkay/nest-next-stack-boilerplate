"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { useFieldMessages } from "@/components/ui/field-messages";
import type { TimeInputProps, TimeInputVariant } from "@/types/ui/TimeInput-types";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

const variantStyles: Record<TimeInputVariant, string> = {
  ...globalStyleVariants,
  default: "border border-border bg-bg rounded-md",
};

const selectClasses: Record<TimeInputVariant, string> = {
  ...globalStyleVariants,
  default: "bg-bg border-border focus-visible:ring-brand",
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
  use24Hour?: boolean;
  isHour?: boolean;
  describedBy?: string;
}

function TimeUnitSelect({
  value,
  max,
  onChange,
  disabled,
  selectClassName,
  use24Hour: is24,
  isHour,
  describedBy,
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
        aria-describedby={describedBy}
        className={cn(
          "h-9 w-[72px] appearance-none rounded-md border px-2 pr-7 text-sm font-medium shadow-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
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

export function TimeInput({
  value = { hours: 0, minutes: 0, seconds: 0 },
  onChange,
  variant,
  showSeconds = false,
  use24Hour = true,
  className,
  disabled = false,
  label,
  error,
  description,
}: TimeInputProps) {
  const effectiveVariant = useComponentVariant(variant);
  const { describedBy, messages } = useFieldMessages(error, description);
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

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzLabel = timezone.split("/").pop()?.replace("_", " ") ?? timezone;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label className="text-sm font-medium text-fg">{label}</label>
      )}
      <div className="flex items-center gap-3">
        <div className={cn("flex items-center gap-2 p-2", resolveVariant(variantStyles, effectiveVariant))}>
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
            selectClassName={resolveVariant(selectClasses, effectiveVariant)}
            use24Hour={use24Hour}
            isHour
            describedBy={describedBy}
          />

          <span className="text-muted text-lg font-medium">:</span>

          <TimeUnitSelect
            value={value.minutes}
            max={59}
            onChange={(val) => update("minutes", val)}
            disabled={disabled}
            selectClassName={resolveVariant(selectClasses, effectiveVariant)}
            describedBy={describedBy}
          />

          {showSeconds && (
            <>
          <span className="text-muted text-sm font-medium">:</span>
              <TimeUnitSelect
                value={value.seconds ?? 0}
                max={59}
                onChange={(val) => update("seconds", val)}
                disabled={disabled}
                selectClassName={resolveVariant(selectClasses, effectiveVariant)}
                describedBy={describedBy}
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
                "border-border bg-surface text-fg hover:bg-surface-hover",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {period}
            </button>
          )}
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
            "bg-surface text-muted border-border",
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
      </div>
      {messages}
    </div>
  );
}
