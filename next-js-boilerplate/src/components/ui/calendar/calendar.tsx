"use client";
import {
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
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
  forceBottomSheet,
  options,
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: DropdownProps & { widthClass: string; forceBottomSheet?: boolean }) {
  return (
    <Dropdown
      size="sm"
      className={widthClass}
      aria-label={ariaLabel}
      disabled={disabled}
      forceBottomSheet={forceBottomSheet}
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

// Hold-to-scroll: pressing and holding the nav button continuously
// navigates months (fires onClick every 300 ms). Declared at module scope,
// not inline inside `components={}`: that object is a fresh literal on
// every render, so an inline arrow function is a *new* component type each
// time — React would unmount and remount this button on every month change.
// The interval is ref-based so it survives re-renders; a window mouseup
// listener ensures cleanup even when mouseup lands outside the button or
// after the button's DOM node has been replaced.
const REPEAT_RATE_MS = 300;
function MonthNavButton({
  onClick,
  ...buttonProps
}: ComponentPropsWithoutRef<"button">) {
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => clearTimer, [clearTimer]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      clearTimer();
      onClickRef.current?.(e);

      timerRef.current = setInterval(() => {
        onClickRef.current?.(
          {} as React.MouseEvent<HTMLButtonElement>,
        );
      }, REPEAT_RATE_MS);

      const onWindowMouseUp = () => {
        clearTimer();
        window.removeEventListener("mouseup", onWindowMouseUp);
      };
      window.addEventListener("mouseup", onWindowMouseUp);
    },
    [clearTimer],
  );

  const handleMouseUp = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  return (
    <button
      {...buttonProps}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    />
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
  forceDropdownBottomSheet,
  ...props
}: CalendarProps) {
  const lang = useLang();
  const handleDayClick = useCallback(
    (day: Date) => {
      onDayClick?.(day);
    },
    [onDayClick],
  );

  // Stable across renders (only changes if forceDropdownBottomSheet itself
  // does — a constant in every current caller). Same reasoning as
  // MonthNavButton above: `components={}` is a fresh object every render, so
  // an inline arrow function here is a *new* component type each time,
  // which unmounts and remounts the whole Select subtree underneath it —
  // silently resetting SelectContent's scroll-chevron state (and its
  // ResizeObserver) on every unrelated Calendar re-render while the list is
  // open, not just on month/year navigation.
  const renderCaptionDropdown = useCallback(
    (dropdownProps: DropdownProps) => (
      <CaptionDropdown
        {...dropdownProps}
        widthClass="w-full"
        forceBottomSheet={forceDropdownBottomSheet}
      />
    ),
    [forceDropdownBottomSheet],
  );

  return (
    <DayPicker
      locale={LOCALES[lang]}
      navLayout="around"
      showOutsideDays
      classNames={{
        root: "p-3",
        months: "flex flex-col sm:flex-row gap-2",
        // Row 1: caption (month + year dropdowns), full width. Row 2: a
        // prev/next hover strip flanking each side of the day grid — not
        // small buttons next to the dropdowns. Default `align-items: stretch`
        // (no `items-center` override) makes the strips fill row 2's full
        // height, matching the day grid's height exactly.
        // `minmax(0,1fr)`, not plain `1fr`: a bare `1fr` track still has an
        // implicit min-size of its content's natural width, and the 7-column
        // day table's natural width is wider than the space actually left
        // over once the two side columns are reserved — so the track (and
        // the button_next strip after it) got pushed past the card's edge.
        // `minmax(0, …)` lets the track — and month_grid's `table-fixed`
        // below — actually shrink to fit.
        month: "grid grid-cols-[1.5rem_minmax(0,1fr)_1.5rem] gap-y-2",
        // Month and year stack vertically (rather than side by side) so each
        // dropdown gets the full caption width — a narrow half-width year
        // select truncates 4-digit years.
        month_caption: "col-span-full row-start-1 flex flex-col items-stretch justify-center gap-1",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        // Full-height hover strips beside the day grid (row 2), not buttons
        // beside the caption. `onMouseEnter` is wired to the same handler as
        // `onClick` below, so hovering changes the month without a click;
        // `aria-disabled:pointer-events-none` stops that at the date-range
        // boundary instead of firing into a no-op.
        button_previous:
          "col-start-1 row-start-2 hover:bg-surface-hover text-muted hover:text-fg flex items-center justify-center rounded-md bg-transparent p-0 transition-colors aria-disabled:pointer-events-none aria-disabled:opacity-30",
        button_next:
          "col-start-3 row-start-2 hover:bg-surface-hover text-muted hover:text-fg flex items-center justify-center rounded-md bg-transparent p-0 transition-colors aria-disabled:pointer-events-none aria-disabled:opacity-30",
        dropdowns: "flex flex-col items-stretch gap-1 w-full",
        // `min-w-0 table-fixed`: without a fixed layout, an auto-layout
        // table sizes its columns from content and ignores a `width` that's
        // narrower than that — which is exactly what was overflowing the
        // card. Fixed layout makes the 7 columns actually split whatever
        // width the grid track gives them.
        month_grid: "col-start-2 row-start-2 w-full min-w-0 table-fixed border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted w-full text-center text-xxs uppercase tracking-wide font-normal",
        weeks: "",
        week: "flex w-full mt-2",
        // `w-full`: `.week` is a flex row, and an empty (`hidden`) cell has no
        // content to size itself by. Without a width, it collapses to 0 and
        // every real day after it shifts left under the wrong weekday column
        // — the same reason `weekday` below carries `w-full` too.
        day: "relative w-full p-0 text-center text-sm focus-within:relative focus-within:z-20",
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
        PreviousMonthButton: MonthNavButton,
        NextMonthButton: MonthNavButton,
        MonthsDropdown: renderCaptionDropdown,
        YearsDropdown: renderCaptionDropdown,
        DayButton: (dayButtonProps) => {
          const dayDate = dayButtonProps.day.date;

          // Outside days (previous/next month's overflow, shown for grid
          // continuity via showOutsideDays) are a plain label, not a button —
          // they fill the leading/trailing cells but stay unselectable.
          // `classNames.outside` on the parent <td> already dims them.
          if (dayButtonProps.modifiers.outside) {
            return (
              <span
                className="inline-flex w-full max-w-9 aspect-square items-center justify-center text-sm font-normal"
                aria-hidden="true"
              >
                {dayDate.getDate()}
              </span>
            );
          }

          const dayEvents = events
            ? getEventsForDate(events, dayDate)
            : [];
          const hasEvents = dayEvents.length > 0;

          return (
            <button
              className={cn(
                // `w-full max-w-9`, not a fixed `size-9`: the day grid's
                // column width now depends on how much room the side nav
                // strips leave (see `month_grid`'s `table-fixed`), which can
                // be less than 36px. A fixed size would refuse to shrink and
                // overflow its cell; capping instead of fixing still caps it
                // at the original 36px when there's room to spare.
                "hover:bg-surface-hover inline-flex w-full max-w-9 aspect-square items-center justify-center rounded-md p-0 text-sm font-normal transition-colors",
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
