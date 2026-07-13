import type React from "react";
import type { ComponentProps } from "react";
import type { DayPicker } from "react-day-picker";

export type CalendarProps = ComponentProps<typeof DayPicker> & {
  className?: string;
  classNames?: Record<string, string>;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
};
