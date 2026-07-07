"use client";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/cn";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: cn("p-3", className),
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-2",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: cn("border-border hover:bg-surface-hover inline-flex h-7 w-7 items-center justify-center rounded-md border bg-transparent p-0 text-sm font-medium transition-colors absolute left-1"),
        button_next: cn("border-border hover:bg-surface-hover inline-flex h-7 w-7 items-center justify-center rounded-md border bg-transparent p-0 text-sm font-medium transition-colors absolute right-1"),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted w-8 rounded-md text-[0.8rem] font-normal",
        week: "flex w-full mt-2",
        day: cn("relative p-0 text-center text-sm focus-within:relative focus-within:z-20", "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"),
        day_button: cn("hover:bg-surface-hover inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-sm font-normal transition-colors aria-selected:opacity-100"),
        selected: "bg-brand text-brand-fg hover:bg-brand hover:text-brand-fg focus:bg-brand focus:text-brand-fg",
        today: "bg-surface text-fg",
        outside: "text-muted opacity-50",
        disabled: "text-muted opacity-50",
        range_middle: "aria-selected:bg-surface aria-selected:text-fg",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
