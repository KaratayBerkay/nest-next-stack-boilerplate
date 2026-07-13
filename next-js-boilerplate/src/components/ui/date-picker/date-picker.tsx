"use client";
import { useState } from "react";
import { Calendar } from "@/components/ui/Calendar";
import { cn } from "@/lib/cn";
import { formatDateLong } from "@/lib/date-time";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { DatePickerProps, DatePickerVariant } from "@/types/ui/DatePicker-types";

const variants: Record<DatePickerVariant, string> = {
  default: "border-border bg-bg text-fg",
  shiny: "bg-gradient-to-br from-slate-900 to-slate-950 border-slate-700 text-white",
  glass: "bg-white/5 backdrop-blur-md border-white/20 text-white",
  neon: "bg-slate-950/90 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950 border-transparent text-white",
};

function handleToggle(open: boolean, setOpen: (v: boolean) => void) {
  setOpen(!open);
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  variant,
  className,
  fontSize,
  fontWeight,
  fontFamily,
}: DatePickerProps) {
  const effectiveVariant = useComponentVariant(variant);
  const [open, setOpen] = useState(false);
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => handleToggle(open, setOpen)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded border px-3 py-1 text-sm shadow-sm transition-colors",
          variants[effectiveVariant as keyof typeof variants],
        )}
      >
        <span className={cn("truncate", fontSizeClass, fontWeightClass, fontFamilyClass)}>
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
            onSelect={(d) => {
              onChange?.(d);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
