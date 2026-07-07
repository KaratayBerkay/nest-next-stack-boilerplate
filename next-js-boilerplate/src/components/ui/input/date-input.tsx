"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/cn";
import { inputBaseClasses, inputErrorClasses } from "@/components/ui/input-styles";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface DateInputProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DateInput({
  value,
  onChange,
  error,
  placeholder = "Pick a date",
  className,
  disabled,
}: DateInputProps) {
  const [viewDate, setViewDate] = useState<Date | undefined>(value);
  const safeViewDate = viewDate ?? new Date();

  const year = safeViewDate.getFullYear();
  const month = safeViewDate.getMonth();

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
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
      const selected = new Date(year, month, day);
      onChange?.(selected);
    },
    [year, month, onChange],
  );

  const isToday = useCallback(
    (day: number) => {
      const now = new Date();
      return (
        now.getFullYear() === year &&
        now.getMonth() === month &&
        now.getDate() === day
      );
    },
    [year, month],
  );

  const isSelected = useCallback(
    (day: number) => {
      if (!value) return false;
      return (
        value.getFullYear() === year &&
        value.getMonth() === month &&
        value.getDate() === day
      );
    },
    [value, year, month],
  );

  const displayValue = value
    ? `${MONTHS[value.getMonth()]} ${value.getDate()}, ${value.getFullYear()}`
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
        <div className="grid grid-cols-7 gap-1">
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
      </PopoverContent>
    </Popover>
  );
}
