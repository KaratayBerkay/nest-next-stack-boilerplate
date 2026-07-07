"use client";
import { useState } from "react";
import { Calendar } from "@/components/ui/Calendar";
import { cn } from "@/lib/cn";
import { formatDateLong } from "@/lib/date-time";

interface DatePickerProps { value?: Date; onChange?: (date: Date | undefined) => void; placeholder?: string; className?: string; }

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <button onClick={() => setOpen(!open)} className="border-border bg-bg flex h-9 w-full items-center justify-between rounded-md border px-3 py-1 text-sm shadow-sm">
        {value ? formatDateLong(value) : <span className="text-muted">{placeholder}</span>}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2 opacity-50"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
      </button>
      {open && (
        <div className="bg-bg border-border absolute z-50 mt-1 rounded-md border shadow-md">
          <Calendar mode="single" selected={value} onSelect={(d) => { onChange?.(d); setOpen(false); }} />
        </div>
      )}
    </div>
  );
}
