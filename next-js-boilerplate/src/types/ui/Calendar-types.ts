import type { ComponentProps } from "react";
import type { DayPicker } from "react-day-picker";
import type { CalendarEvent } from "./CalendarEvent-types";

export type CalendarProps = ComponentProps<typeof DayPicker> & {
  className?: string;
  classNames?: Record<string, string>;
  events?: CalendarEvent[];
  onDayClick?: (date: Date) => void;
  /** Always render the month/year dropdowns as the mobile bottom sheet, regardless of viewport width. */
  forceDropdownBottomSheet?: boolean;
};
