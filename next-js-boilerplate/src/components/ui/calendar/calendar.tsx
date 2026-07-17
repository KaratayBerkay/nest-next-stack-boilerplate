"use client";
import { type ComponentProps, type ChangeEvent, useCallback } from "react";
import { DayPicker, type DropdownProps } from "react-day-picker";
import { enUS, tr } from "react-day-picker/locale";
import { cn } from "@/lib/cn";
import { Dropdown } from "@/components/ui/Dropdown";
import { useLang } from "@/hooks/useLang";
import type { Lang } from "@/constants/i18n";
import { CalendarEvent } from "./calendar-event";
import type { CalendarProps } from "@/types/ui/Calendar-types";

const LOCALES: Record<Lang, typeof enUS> = { en: enUS, tr };

const CHEVRON_PATHS = {
  left: "M15 18l-6-6 6-6",
  right: "M9 18l6-6-6-6",
  down: "M6 9l6 6 6-6",
  up: "M18 15l-6-6-6 6",
} as const;

// Replaces DayPicker's native <select> caption dropdowns with the themed
// Dropdown so the option list matches the app theme (the OS-drawn native
// option list can't be styled).
function CaptionDropdown({
  widthClass,
  options,
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: DropdownProps & { widthClass: string }) {
  return (
    <Dropdown
      size="sm"
      className={widthClass}
      aria-label={ariaLabel}
      disabled={disabled}
      value={value == null ? undefined : String(value)}
      options={(options ?? []).map((option) => ({
        value: String(option.value),
        label: option.label,
        disabled: option.disabled,
      }))}
      onChange={(v) => {
        onChange?.({
          target: { value: v },
        } as unknown as ChangeEvent<HTMLSelectElement>);
      }}
    />
  );
}

function Chevron({
  orientation = "left",
  className,
}: {
  orientation?: keyof typeof CHEVRON_PATHS;
  className?: string;
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={CHEVRON_PATHS[orientation]} />
    </svg>
  );
}

function getEventsForDate(events: NonNullable<CalendarProps["events"]>, date: Date) {
  return events.filter((e) => {
    if (!e.date) return false;
    return (
      date.getFullYear() === e.date.getFullYear() &&
      date.getMonth() === e.date.getMonth() &&
      date.getDate() === e.date.getDate()
    );
  });
}

export function Calendar({
  className,
  classNames,
  events,
  onDayClick,
  ...props
}: CalendarProps) {
  const lang = useLang();
  const handleDayClick = useCallback(
    (day: Date) => {
      onDayClick?.(day);
    },
    [onDayClick],
  );

  return (
    <DayPicker
      locale={LOCALES[lang]}
      navLayout="around"
      classNames={{
        root: "p-3",
        months: "flex flex-col sm:flex-row gap-2",
        // Header row: prev button / caption / next button. With two months the
        // outer months only carry one button each, so the side columns are fixed.
        month: "grid grid-cols-[2rem_1fr_2rem] items-center gap-y-2",
        // Month and year stack vertically (rather than side by side) so each
        // dropdown gets the full caption width — a narrow half-width year
        // select truncates 4-digit years.
        month_caption: "col-start-2 flex flex-col items-stretch justify-center gap-1",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous:
          "col-start-1 hover:bg-surface-hover text-muted hover:text-fg inline-flex h-8 w-8 items-center justify-center rounded-md bg-transparent p-0 transition-colors",
        button_next:
          "col-start-3 hover:bg-surface-hover text-muted hover:text-fg inline-flex h-8 w-8 items-center justify-center rounded-md bg-transparent p-0 transition-colors",
        dropdowns: "flex flex-col items-stretch gap-1 w-full",
        month_grid: "col-span-full w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted w-full text-center text-xxs uppercase tracking-wide font-normal",
        weeks: "",
        week: "flex w-full mt-2",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button:
          "hover:bg-surface-hover inline-flex size-9 items-center justify-center rounded-md p-0 text-sm font-normal transition-colors aria-selected:opacity-100",
        selected:
          "bg-brand text-brand-fg hover:bg-brand hover:text-brand-fg focus:bg-brand focus:text-brand-fg",
        today: "ring-1 ring-brand/50 font-semibold",
        outside: "text-muted opacity-50",
        disabled: "text-muted opacity-50",
        range_middle:
          "aria-selected:bg-brand/10 aria-selected:text-fg rounded-none",
        range_start: "rounded-l-md",
        range_end: "rounded-r-md",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron,
        MonthsDropdown: (dropdownProps) => (
          <CaptionDropdown {...dropdownProps} widthClass="w-full" />
        ),
        YearsDropdown: (dropdownProps) => (
          <CaptionDropdown {...dropdownProps} widthClass="w-full" />
        ),
        DayButton: (dayButtonProps) => {
          const dayDate = dayButtonProps.day.date;
          const dayEvents = events
            ? getEventsForDate(events, dayDate)
            : [];
          const hasEvents = dayEvents.length > 0;

          return (
            <button
              className={cn(
                "hover:bg-surface-hover inline-flex size-9 items-center justify-center rounded-md p-0 text-sm font-normal transition-colors",
                dayButtonProps.modifiers.selected && "bg-brand text-brand-fg",
                dayButtonProps.modifiers.today && !dayButtonProps.modifiers.selected && "bg-surface text-fg font-semibold",
                "relative",
                hasEvents && !dayButtonProps.modifiers.selected && "font-semibold",
              )}
              data-day-button
              onClick={() => handleDayClick(dayDate)}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span>{dayDate.getDate()}</span>
                {hasEvents && (
                  <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <span
                        key={event.id}
                        className={cn(
                          "size-1 rounded-full",
                          event.color === "green" && "bg-success",
                          event.color === "red" && "bg-error",
                          event.color === "purple" && "bg-brand",
                          event.color === "orange" && "bg-warning",
                          event.color === "cyan" && "bg-info",
                          (!event.color || event.color === "blue") && "bg-brand",
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        },
      }}
      onDayClick={(day) => handleDayClick(day)}
      {...(props as ComponentProps<typeof DayPicker>)}
    />
  );
}

export { CalendarEvent } from "./calendar-event";
