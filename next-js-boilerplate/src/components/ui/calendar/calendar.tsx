"use client";
import { type ComponentProps, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/cn";
import { CalendarEvent } from "./calendar-event";
import type { CalendarProps } from "@/types/ui/Calendar-types";

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
  const handleDayClick = useCallback(
    (day: Date) => {
      onDayClick?.(day);
    },
    [onDayClick],
  );

  return (
    <DayPicker
      classNames={{
        root: "p-3",
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-2",
        month_caption: "flex justify-center pt-1 relative items-center h-8",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous:
          "hover:bg-surface-hover text-muted inline-flex h-7 w-7 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium transition-colors absolute left-1",
        button_next:
          "hover:bg-surface-hover text-muted inline-flex h-7 w-7 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium transition-colors absolute right-1",
        dropdowns: "flex items-center gap-2 w-full",
        dropdown: "bg-surface border-border h-9 rounded-md border px-2.5 text-sm cursor-pointer",
        month_grid: "w-full border-collapse",
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
              tabIndex={0}
              role="gridcell"
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
