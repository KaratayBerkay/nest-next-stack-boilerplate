export type CalendarEventColor =
  | "blue"
  | "green"
  | "red"
  | "purple"
  | "orange"
  | "cyan";

export interface CalendarEvent {
  id: string;
  title: string;
  date?: Date;
  time?: string;
  color?: CalendarEventColor;
}

export interface CalendarEventProps {
  event: CalendarEvent;
  compact?: boolean;
}
