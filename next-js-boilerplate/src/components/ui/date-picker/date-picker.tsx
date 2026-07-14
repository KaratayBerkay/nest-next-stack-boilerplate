"use client";
import { useState, useCallback } from "react";
import { Calendar } from "@/components/ui/Calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { usePopover } from "@/components/ui/popover/popover";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { fontClasses } from "@/lib/font-classes";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { useFieldMessages } from "@/components/ui/field-messages";
import { formatDateLong, MONTHS } from "@/lib/date-time";
import type { DatePickerProps } from "@/types/ui/DatePicker-types";

const variants = {
  ...globalStyleVariants,
  default: "border-border bg-bg text-fg hover:bg-surface-hover",
};

type PickerView = "days" | "months" | "years";

const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

function defaultEndMonth() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 10);
  return d;
}

function handleClear(onChange?: (date: Date | undefined) => void) {
  onChange?.(undefined);
}

function formatPickerValue(
  value: Date | undefined,
  picker: "day" | "month" | "year",
): string {
  if (!value) return "";
  if (picker === "year") return value.getFullYear().toString();
  if (picker === "month")
    return value.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  return formatDateLong(value);
}

function MonthGrid({
  year,
  selectedMonth,
  onSelect,
}: {
  year: number;
  selectedMonth?: number;
  onSelect: (month: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-1 p-2">
      {MONTHS_SHORT.map((name, i) => (
        <button
          key={name}
          type="button"
          onClick={() => onSelect(i)}
          className={cn(
            "rounded-md px-2 py-1.5 text-sm transition-colors",
            selectedMonth === i
              ? "bg-brand text-brand-fg"
              : "hover:bg-surface-hover text-fg",
          )}
          aria-pressed={selectedMonth === i}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

function YearGrid({
  decadeStart,
  selectedYear,
  onSelect,
}: {
  decadeStart: number;
  selectedYear?: number;
  onSelect: (year: number) => void;
}) {
  const years = Array.from({ length: 12 }, (_, i) => decadeStart + i);
  return (
    <div className="grid grid-cols-3 gap-1 p-2">
      {years.map((y) => (
        <button
          key={y}
          type="button"
          onClick={() => onSelect(y)}
          className={cn(
            "rounded-md px-2 py-1.5 text-sm transition-colors",
            selectedYear === y
              ? "bg-brand text-brand-fg"
              : "hover:bg-surface-hover text-fg",
          )}
          aria-pressed={selectedYear === y}
        >
          {y}
        </button>
      ))}
    </div>
  );
}

function DatePickerCalendar({
  value,
  onChange,
  picker,
  captionLayout,
  startMonth,
  endMonth,
}: {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  picker: "day" | "month" | "year";
  captionLayout?: "dropdown" | "label" | "dropdown-months" | "dropdown-years";
  startMonth?: Date;
  endMonth?: Date;
}) {
  const { close } = usePopover();
  const today = new Date();
  const selectedYear = value?.getFullYear();
  const selectedMonth = value?.getMonth();

  const [view, setView] = useState<PickerView>(
    picker === "month" ? "months" : picker === "year" ? "years" : "days",
  );
  const [yearOffset, setYearOffset] = useState(0);
  const displayYear = today.getFullYear() + yearOffset;

  const handleSelectMonth = useCallback(
    (month: number) => {
      const d = new Date(displayYear, month, 1);
      onChange?.(d);
      close();
    },
    [displayYear, onChange, close],
  );

  const handleSelectYear = useCallback(
    (year: number) => {
      const d = new Date(year, 0, 1);
      onChange?.(d);
      close();
    },
    [onChange, close],
  );

  if (view === "months") {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <button
            type="button"
            onClick={() => setYearOffset((o) => o - 1)}
            className="text-muted hover:text-fg rounded-md p-1 transition-colors"
            aria-label="Previous year"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span className="text-sm font-medium">{displayYear}</span>
          <button
            type="button"
            onClick={() => setYearOffset((o) => o + 1)}
            className="text-muted hover:text-fg rounded-md p-1 transition-colors"
            aria-label="Next year"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
        <MonthGrid
          year={displayYear}
          selectedMonth={picker === "month" ? selectedMonth : undefined}
          onSelect={handleSelectMonth}
        />
        <div className="border-t border-border p-1">
          <button
            type="button"
            onClick={() => setView("years")}
            className="text-muted hover:text-fg w-full rounded-md px-2 py-1 text-xs transition-colors"
          >
            {picker === "month" ? "Pick year" : "More years"}
          </button>
        </div>
      </div>
    );
  }

  if (view === "years") {
    const decadeStart = Math.floor(displayYear / 12) * 12;
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <button
            type="button"
            onClick={() => setYearOffset((o) => o - 12)}
            className="text-muted hover:text-fg rounded-md p-1 transition-colors"
            aria-label="Previous page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span className="text-sm font-medium">{decadeStart}–{decadeStart + 11}</span>
          <button
            type="button"
            onClick={() => setYearOffset((o) => o + 12)}
            className="text-muted hover:text-fg rounded-md p-1 transition-colors"
            aria-label="Next page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
        <YearGrid
          decadeStart={decadeStart}
          selectedYear={selectedYear}
          onSelect={handleSelectYear}
        />
        <div className="border-t border-border p-1">
          <button
            type="button"
            onClick={() => setView(picker === "year" ? "months" : "months")}
            className="text-muted hover:text-fg w-full rounded-md px-2 py-1 text-xs transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <Calendar
      mode="single"
      selected={value}
      captionLayout={captionLayout ?? "dropdown"}
      startMonth={startMonth ?? new Date(1900, 0, 1)}
      endMonth={endMonth ?? defaultEndMonth()}
      onDayClick={(d) => {
        onChange?.(d);
        close();
      }}
    />
  );
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
  error,
  description,
  picker = "day",
  captionLayout = "dropdown",
  startMonth,
  endMonth,
}: DatePickerProps) {
  const effectiveVariant = useComponentVariant(variant);
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });
  const { describedBy, messages } = useFieldMessages(error, description);
  const displayValue = formatPickerValue(value, picker);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-9 w-full items-center justify-between rounded border px-3 py-1 text-sm shadow-sm transition-colors",
              resolveVariant(variants, effectiveVariant),
              fonts,
            )}
            aria-describedby={describedBy}
          >
            <span className="truncate">
              {value ? (
                displayValue
              ) : (
                <span className="text-muted">{placeholder}</span>
              )}
            </span>
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear(onChange);
                }}
                className="text-muted hover:text-fg mx-1 inline-flex shrink-0 items-center justify-center rounded p-0.5 transition-colors"
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
            )}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0 opacity-50"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </PopoverTrigger>
        <PopoverContent title="Pick a date">
          <DatePickerCalendar
            value={value}
            onChange={onChange}
            picker={picker}
            captionLayout={picker === "day" ? captionLayout : undefined}
            startMonth={startMonth}
            endMonth={endMonth}
          />
        </PopoverContent>
      </Popover>
      {messages}
    </div>
  );
}
