"use client";
import {
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { DayPicker, type DropdownProps } from "react-day-picker";
import { enUS, tr } from "react-day-picker/locale";
import { cn } from "@/lib/cn";
import { Dropdown } from "@/components/ui/Dropdown";
import { useLang } from "@/hooks/useLang";
import { useDeviceType } from "@/hooks/useDeviceType";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { addMonths } from "@/lib/date-time";
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
      hideChevron
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
// A suppressClick ref prevents double-fire: the browser fires click after
// mousedown+mouseup, but handleMouseDown already dispatched onClick.
const REPEAT_RATE_MS = 300;
function MonthNavButton({
  onClick,
  ...buttonProps
}: ComponentPropsWithoutRef<"button">) {
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const suppressClickRef = useRef(false);

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
      suppressClickRef.current = true;
      onClickRef.current?.(e);

      timerRef.current = setInterval(() => {
        onClickRef.current?.(
          {} as React.MouseEvent<HTMLButtonElement>,
        );
      }, REPEAT_RATE_MS);

      const onWindowMouseUp = () => {
        suppressClickRef.current = false;
        clearTimer();
        window.removeEventListener("mouseup", onWindowMouseUp);
      };
      window.addEventListener("mouseup", onWindowMouseUp);
    },
    [clearTimer],
  );

  return (
    <button
      {...buttonProps}
      onClick={(e) => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
        onClick?.(e);
      }}
      onMouseDown={handleMouseDown}
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
  swipeDisabled,
  ...props
}: CalendarProps) {
  const lang = useLang();
  const deviceType = useDeviceType();
  const isTouch = deviceType === "touch";

  const [currentMonth, setCurrentMonth] = useState(() =>
    props.defaultMonth ?? props.month ?? new Date(),
  );

  const handleSwipeLeft = useCallback(() => {
    if (swipeDisabled) return;
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, [swipeDisabled]);

  const handleSwipeRight = useCallback(() => {
    if (swipeDisabled) return;
    setCurrentMonth((prev) => addMonths(prev, -1));
  }, [swipeDisabled]);

  useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  const handleDayClick = useCallback(
    (day: Date) => {
      onDayClick?.(day);
    },
    [onDayClick],
  );

  const navButtonBase =
    "hover:bg-surface-hover text-muted hover:text-fg flex items-center justify-center rounded-md bg-transparent p-0 transition-colors aria-disabled:pointer-events-none aria-disabled:opacity-30";
  const navButtonClasses = isTouch ? "hidden" : navButtonBase;
  const monthGridCols = isTouch
    ? "minmax(0,1fr)"
    : "grid-cols-[1.5rem_minmax(0,1fr)_1.5rem]";

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
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      navLayout="around"
      showOutsideDays
      classNames={{
        root: "p-4",
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
        month: cn("grid gap-y-3", monthGridCols),
        // Month and year stack vertically (rather than side by side) so each
        // dropdown gets the full caption width — a narrow half-width year
        // select truncates 4-digit years.
        month_caption: "col-span-full row-start-1 flex flex-col items-stretch justify-center gap-1",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: cn("col-start-1 row-start-2", navButtonClasses),
        button_next: cn("col-start-3 row-start-2", navButtonClasses),
        dropdowns: "flex flex-col items-stretch gap-1 w-full",
        // `min-w-0 table-fixed`: without a fixed layout, an auto-layout
        // table sizes its columns from content and ignores a `width` that's
        // narrower than that — which is exactly what was overflowing the
        // card. Fixed layout makes the 7 columns actually split whatever
        // width the grid track gives them.
        month_grid: "col-start-2 row-start-2 w-full min-w-0 table-fixed border-collapse",
        weekdays: "flex gap-0.5",
        weekday:
          "text-muted w-full text-center text-xxs uppercase tracking-wide font-normal",
        weeks: "",
        week: "flex w-full mt-2",
        day: "relative w-full p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button:
          "hover:bg-surface-hover inline-flex w-full aspect-square items-center justify-center rounded-md p-0 text-sm font-normal transition-colors aria-selected:opacity-100",
        selected:
          "bg-brand text-brand-fg hover:bg-brand hover:text-brand-fg focus:bg-brand focus:text-brand-fg",
        today: "bg-brand/10 font-semibold",
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
                className="inline-flex w-full aspect-square items-center justify-center text-sm font-normal"
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
                "hover:bg-surface-hover inline-flex w-full aspect-square items-center justify-center rounded-md p-0 text-sm font-normal transition-colors",
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
