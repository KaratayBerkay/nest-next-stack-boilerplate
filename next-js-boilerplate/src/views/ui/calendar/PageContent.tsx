"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { CalendarEvent } from "@/components/ui/calendar/calendar-event";
import type { CalendarEvent as CalendarEventType } from "@/types/ui/CalendarEvent-types";
import type { DateRange } from "react-day-picker";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const Calendar = dynamic(
  () =>
    import("@/components/ui/Calendar").then((m) => ({ default: m.Calendar })),
  { ssr: false },
);

function makeDate(dayOffset: number, hour: number = 0, minute: number = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const meetingEvents: CalendarEventType[] = [
  { id: "m1", title: "Team Standup", date: makeDate(0, 9, 0), time: "09:00", color: "blue" },
  { id: "m2", title: "Sprint Review", date: makeDate(0, 14, 0), time: "14:00", color: "purple" },
  { id: "m3", title: "Lunch with Alex", date: makeDate(0, 12, 30), time: "12:30", color: "green" },
  { id: "m4", title: "Design Review", date: makeDate(1, 10, 0), time: "10:00", color: "orange" },
  { id: "m5", title: "1:1 with Manager", date: makeDate(2, 15, 30), time: "15:30", color: "blue" },
  { id: "m6", title: "Product Demo", date: makeDate(3, 11, 0), time: "11:00", color: "purple" },
  { id: "m7", title: "Team Happy Hour", date: makeDate(4, 17, 0), time: "17:00", color: "green" },
];

const birthdayEvents: CalendarEventType[] = [
  { id: "b1", title: "Alice", date: makeDate(0), color: "green" },
  { id: "b2", title: "Bob", date: makeDate(3), color: "green" },
  { id: "b3", title: "Charlie", date: makeDate(7), color: "green" },
  { id: "b4", title: "Diana", date: makeDate(14), color: "green" },
  { id: "b5", title: "Eve", date: makeDate(21), color: "green" },
];

const noteEntries: { date: Date; text: string }[] = [
  { date: makeDate(0), text: "Finish Q2 report draft" },
  { date: makeDate(0), text: "Review PR #1423" },
  { date: makeDate(1), text: "Prepare slide deck for sprint review" },
  { date: makeDate(2), text: "Update API documentation" },
  { date: makeDate(3), text: "Sync with design team on new mockups" },
];

function formatDate(d: Date | undefined): string {
  if (!d) return "";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function AppointmentRangeTab() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: makeDate(0),
    to: makeDate(4),
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted text-xs">
        Select a check-in and check-out date range.
      </p>
      <div className="surface flex max-w-fit flex-col gap-4 rounded-xl border p-4 shadow-sm">
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
        />
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-muted text-xs uppercase tracking-wider">Check-in</span>
            <p className="font-medium">{range?.from ? formatDate(range.from) : "—"}</p>
          </div>
          <div>
            <span className="text-muted text-xs uppercase tracking-wider">Check-out</span>
            <p className="font-medium">{range?.to ? formatDate(range.to) : "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MeetingsTab() {
  const [selected, setSelected] = useState<Date | undefined>(makeDate(0));

  const dayMeetings = useMemo(() => {
    return meetingEvents.filter((e) => {
      if (!e.date || !selected) return false;
      return (
        e.date.getFullYear() === selected.getFullYear() &&
        e.date.getMonth() === selected.getMonth() &&
        e.date.getDate() === selected.getDate()
      );
    });
  }, [selected]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          events={meetingEvents}
          className="shrink-0"
        />
        <div className="surface flex-1 rounded-xl border p-4 shadow-sm">
          <p className="text-sm font-semibold mb-2">
            {selected ? formatDate(selected) : "Select a day"}
          </p>
          {dayMeetings.length === 0 ? (
            <p className="text-muted text-xs">No meetings scheduled</p>
          ) : (
            <div className="space-y-2">
              {dayMeetings
                .sort((a, b) => {
                  if (!a.date || !b.date) return 0;
                  return a.date.getTime() - b.date.getTime();
                })
                .map((event) => (
                  <CalendarEvent key={event.id} event={event} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BirthdaysTab() {
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  return (
    <div className="flex flex-col gap-4">
      <div className="surface max-w-fit rounded-xl border p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="size-2 rounded-full bg-success" />
          <span className="text-muted text-xs">Birthdays this month</span>
        </div>
        <Calendar
          mode="single"
          events={birthdayEvents}
          selected={selected}
          onSelect={setSelected}
        />
        {selected && (
          <div className="mt-3 space-y-1">
            {birthdayEvents
              .filter((e) => {
                if (!e.date) return false;
                return (
                  e.date.getFullYear() === selected.getFullYear() &&
                  e.date.getMonth() === selected.getMonth() &&
                  e.date.getDate() === selected.getDate()
                );
              })
              .map((e) => (
                <div key={e.id} className="text-sm">
                  <span className="bg-success mr-1.5 inline-block size-1.5 rounded-full" />
                  {e.title}&apos;s Birthday
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DailyNotesTab() {
  const [selected, setSelected] = useState<Date | undefined>(makeDate(0));

  const dayNotes = useMemo(() => {
    return noteEntries.filter((n) => {
      if (!selected) return false;
      return (
        n.date.getFullYear() === selected.getFullYear() &&
        n.date.getMonth() === selected.getMonth() &&
        n.date.getDate() === selected.getDate()
      );
    });
  }, [selected]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          className="shrink-0"
        />
        <div className="surface min-h-[200px] flex-1 rounded-xl border p-4 shadow-sm">
          <p className="text-sm font-semibold mb-3">
            {selected ? formatDate(selected) : "Select a day"}
          </p>
          {dayNotes.length === 0 ? (
            <p className="text-muted text-xs">No notes for this day</p>
          ) : (
            <ul className="space-y-2">
              {dayNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand" />
                  {note.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "appointment-range",
    title: "Appointment Range",
    description: "Date range picker with check-in/out readout.",
    render: () => <AppointmentRangeTab />,
  },
  {
    id: "meetings",
    title: "Meetings",
    description: "Day view with time-based event list.",
    render: () => <MeetingsTab />,
  },
  {
    id: "birthdays",
    title: "Birthdays",
    description: "Recurring birthday markers with month navigation.",
    render: () => <BirthdaysTab />,
  },
  {
    id: "daily-notes",
    title: "Daily Notes",
    description: "Calendar left + notes panel right; click a day to show notes.",
    render: () => <DailyNotesTab />,
  },
];

export default function CalendarPage() {
  return (
    <ExampleTabs
      title="Calendar"
      intro="A full-featured event calendar for displaying events, schedules, and deadlines."
      examples={examples}
    />
  );
}