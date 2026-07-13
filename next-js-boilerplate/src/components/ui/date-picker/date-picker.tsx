"use client";
import { useState } from "react";
import { Calendar } from "@/components/ui/Calendar";
import { cn } from "@/lib/cn";
import { formatDateLong } from "@/lib/date-time";
import type { DatePickerProps, DatePickerVariant } from "@/types/ui/DatePicker-types";

const variants: Record<DatePickerVariant, string> = {
  default: "border-border bg-bg text-fg",
  shiny: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg shadow-blue-500/20",
  glass: "bg-white/20 backdrop-blur-md text-white border-white/20 shadow-md",
  neon: "bg-slate-950 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
  gradient: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text border-transparent",
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  fontSize,
  fontWeight,
  fontFamily,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded border px-3 py-1 text-sm shadow-sm",
          variants.default,
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
          className="ml-2 opacity-50"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
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
