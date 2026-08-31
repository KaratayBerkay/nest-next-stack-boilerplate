import type { CalendarEvent } from "@/types/ui/CalendarEvent-types";

export function makeDate(
  dayOffset: number,
  hour: number = 0,
  minute: number = 0,
): Date {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function formatDate(d: Date | undefined): string {
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export const meetingEvents: CalendarEvent[] = [
  {
    id: "m1",
    title: "Team Standup",
    date: makeDate(0, 9, 0),
    time: "09:00",
    color: "blue",
  },
  {
    id: "m2",
    title: "Sprint Review",
    date: makeDate(0, 14, 0),
    time: "14:00",
    color: "purple",
  },
  {
    id: "m3",
    title: "Lunch with Alex",
    date: makeDate(0, 12, 30),
    time: "12:30",
    color: "green",
  },
  {
    id: "m4",
    title: "Design Review",
    date: makeDate(1, 10, 0),
    time: "10:00",
    color: "orange",
  },
  {
    id: "m5",
    title: "1:1 with Manager",
    date: makeDate(2, 15, 30),
    time: "15:30",
    color: "blue",
  },
  {
    id: "m6",
    title: "Product Demo",
    date: makeDate(3, 11, 0),
    time: "11:00",
    color: "purple",
  },
  {
    id: "m7",
    title: "Team Happy Hour",
    date: makeDate(4, 17, 0),
    time: "17:00",
    color: "green",
  },
];

export const birthdayEvents: CalendarEvent[] = [
  { id: "b1", title: "Alice", date: makeDate(0), color: "green" },
  { id: "b2", title: "Bob", date: makeDate(3), color: "green" },
  { id: "b3", title: "Charlie", date: makeDate(7), color: "green" },
  { id: "b4", title: "Diana", date: makeDate(14), color: "green" },
  { id: "b5", title: "Eve", date: makeDate(21), color: "green" },
];

export const noteEntries: { date: Date; text: string }[] = [
  { date: makeDate(0), text: "Finish Q2 report draft" },
  { date: makeDate(0), text: "Review PR #1423" },
  { date: makeDate(1), text: "Prepare slide deck for sprint review" },
  { date: makeDate(2), text: "Update API documentation" },
  { date: makeDate(3), text: "Sync with design team on new mockups" },
];
