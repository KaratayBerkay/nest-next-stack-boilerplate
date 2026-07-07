"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/cn";
import { inputBaseClasses, inputErrorClasses } from "@/components/ui/input-styles";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { MONTHS, DAYS_SHORT, getDaysInMonth, getFirstWeekdayOfMonth, isSameDay, formatHoursMinutes } from "@/lib/date-time";

interface DateTimeInputProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const DAYS = DAYS_SHORT;

export function DateTimeInput({
  value,
  onChange,
  error,
  placeholder = "Pick a date & time",
  className,
  disabled,
}: DateTimeInputProps) {
  const [viewDate, setViewDate] = useState<Date | undefined>(value);
  const safeViewDate = viewDate ?? new Date();
  const [hours, setHours] = useState(value ? value.getHours() : 12);
  const [minutes, setMinutes] = useState(value ? value.getMinutes() : 0);

  const year = safeViewDate.getFullYear();
  const month = safeViewDate.getMonth();

  const daysInMonth = useMemo(() => {
    const firstDay = getFirstWeekdayOfMonth(year, month + 1);
    const totalDays = getDaysInMonth(year, month + 1);
    return { firstDay, totalDays };
  }, [year, month]);

  const handlePrev = useCallback(() => {
    setViewDate((d) => {
      const base = d ?? new Date();
      return new Date(base.getFullYear(), base.getMonth() - 1, 1);
    });
  }, []);

  const handleNext = useCallback(() => {
    setViewDate((d) => {
      const base = d ?? new Date();
      return new Date(base.getFullYear(), base.getMonth() + 1, 1);
    });
  }, []);

  const handleSelect = useCallback(
    (day: number) => {
      const selected = new Date(year, month, day, hours, minutes);
      onChange?.(selected);
    },
    [year, month, hours, minutes, onChange],
  );

  const handleTimeChange = useCallback(
    (h: number, m: number) => {
      setHours(h);
      setMinutes(m);
      if (value) {
        const updated = new Date(value);
        updated.setHours(h, m);
        onChange?.(updated);
      }
    },
    [value, onChange],
  );

  const isToday = useCallback(
    (day: number) => isSameDay(new Date(year, month, day), new Date()),
    [year, month],
  );

  const isSelected = useCallback(
    (day: number) => {
      if (!value) return false;
      return isSameDay(value, new Date(year, month, day));
    },
    [value, year, month],
  );

  const displayValue = value
    ? `${MONTHS[value.getMonth()]} ${value.getDate()}, ${value.getFullYear()} ${formatHoursMinutes(value.getHours(), value.getMinutes())}`
    : "";

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          inputBaseClasses,
          "text-left",
          !value && "text-muted",
          error && inputErrorClasses,
          className,
        )}
        aria-invalid={!!error}
      >
        {displayValue || placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handlePrev}
            className="text-muted hover:text-fg p-1"
            aria-label="Previous month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="text-sm font-medium">
            {MONTHS[month]} {year}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="text-muted hover:text-fg p-1"
            aria-label="Next month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-3">
          {DAYS.map((d) => (
            <div key={d} className="text-muted flex h-7 w-7 items-center justify-center text-xs">
              {d}
            </div>
          ))}
          {Array.from({ length: daysInMonth.firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-7 w-7" />
          ))}
          {Array.from({ length: daysInMonth.totalDays }).map((_, i) => {
            const day = i + 1;
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleSelect(day)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded text-sm transition-colors",
                  isSelected(day) && "bg-fg text-bg",
                  !isSelected(day) && isToday(day) && "border-border border",
                  !isSelected(day) && !isToday(day) && "hover:bg-surface-hover text-muted hover:text-fg",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
        <div className="border-border flex items-center gap-2 border-t pt-3">
          <span className="text-muted text-xs">Time</span>
          <select
            value={hours}
            onChange={(e) => handleTimeChange(Number(e.target.value), minutes)}
            className="border-border bg-bg rounded border px-2 py-1 text-xs"
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <option key={i} value={i}>
                {String(i).padStart(2, "0")}
              </option>
            ))}
          </select>
          <span className="text-muted">:</span>
          <select
            value={minutes}
            onChange={(e) => handleTimeChange(hours, Number(e.target.value))}
            className="border-border bg-bg rounded border px-2 py-1 text-xs"
          >
            {[0, 15, 30, 45].map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
