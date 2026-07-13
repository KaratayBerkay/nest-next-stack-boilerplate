"use client";
import { useState } from "react";
import { Calendar } from "@/components/ui/Calendar";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { fontClasses } from "@/lib/font-classes";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { formatDateLong } from "@/lib/date-time";
import type { DatePickerProps } from "@/types/ui/DatePicker-types";

const variants = {
  ...globalStyleVariants,
  default: "border-border bg-bg text-fg hover:bg-surface-hover",
};

function handleToggle(open: boolean, setOpen: (v: boolean) => void) {
  setOpen(!open);
}

function handleClear(onChange?: (date: Date | undefined) => void) {
  onChange?.(undefined);
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  fontSize,
  fontWeight,
  fontFamily,
  variant,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const effectiveVariant = useComponentVariant(variant);
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {value && (
        <div className="flex items-center justify-between rounded border border-border bg-surface px-3 py-2">
          <span className={cn("text-sm", fonts)}>
            {formatDateLong(value)}
          </span>
          <button
            type="button"
            onClick={() => handleClear(onChange)}
            className="text-muted hover:text-fg ml-2 inline-flex shrink-0 items-center justify-center rounded p-0.5 transition-colors"
            aria-label="Clear date"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => handleToggle(open, setOpen)}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded border px-3 py-1 text-sm shadow-sm transition-colors",
            resolveVariant(variants, effectiveVariant),
          )}
        >
          <span className={cn("truncate", fonts)}>
            {value ? (
              formatDateLong(value)
            ) : (
              <span className="text-muted">{placeholder}</span>
            )}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="ml-2 shrink-0 opacity-50"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div className="bg-bg border-border absolute z-50 mt-1 rounded-md border shadow-md">
            <Calendar
              mode="single"
              selected={value}
              onDayClick={(d) => {
                onChange?.(d);
                setOpen(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
