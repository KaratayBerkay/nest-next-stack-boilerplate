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

function formatDate(date: Date | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function makeDate(dayOffset: number, hour: number = 0, minute: number = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const now = new Date();

const sampleEvents: CalendarEventType[] = [
  { id: "1", title: "Team Standup", date: makeDate(0, 9, 0), time: "09:00", color: "blue" },
  { id: "2", title: "Sprint Review", date: makeDate(0, 14, 0), time: "14:00", color: "purple" },
  { id: "3", title: "Deadline", date: makeDate(2), color: "red" },
  { id: "4", title: "Lunch with Alex", date: makeDate(1, 12, 30), time: "12:30", color: "green" },
  { id: "5", title: "Design Workshop", date: makeDate(3, 10, 0), time: "10:00", color: "orange" },
  { id: "6", title: "Code Review", date: makeDate(4, 16, 0), time: "16:00", color: "cyan" },
  { id: "7", title: "Product Demo", date: makeDate(5, 11, 0), time: "11:00", color: "purple" },
  { id: "8", title: "1:1 with Manager", date: makeDate(7, 15, 30), time: "15:30", color: "blue" },
  { id: "9", title: "Release v2.0", date: makeDate(10), color: "red" },
  { id: "10", title: "Team Happy Hour", date: makeDate(6, 17, 0), time: "17:00", color: "green" },
];

const birthdayEvents: CalendarEventType[] = [
  { id: "b1", title: "Alice", date: makeDate(3), color: "green" },
  { id: "b2", title: "Bob", date: makeDate(12), color: "green" },
  { id: "b3", title: "Charlie", date: makeDate(20), color: "green" },
];

const teamScheduleEvents: CalendarEventType[] = [
  { id: "t1", title: "Alice - Focus", date: makeDate(0), time: "09:00", color: "blue" },
  { id: "t2", title: "Bob - Meeting", date: makeDate(1), time: "10:00", color: "purple" },
  { id: "t3", title: "Carol - Review", date: makeDate(2), time: "14:00", color: "orange" },
  { id: "t4", title: "Dave - Deploy", date: makeDate(3), time: "16:00", color: "red" },
  { id: "t5", title: "Eve - Planning", date: makeDate(4), time: "11:00", color: "cyan" },
];

function ComponentsTab() {
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  const todayEvents = useMemo(() => {
    return sampleEvents.filter((e) => {
      if (!e.date) return false;
      return (
        e.date.getFullYear() === now.getFullYear() &&
        e.date.getMonth() === now.getMonth() &&
        e.date.getDate() === now.getDate()
      );
    });
  }, []);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Calendar />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Events</h3>
        <p className="text-muted text-sm">
          Days with events show colored dots below the date number.
        </p>
        <Calendar
          mode="single"
          events={sampleEvents}
          onDayClick={(date) => setSelected(date)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Selected Date</h3>
        <div className="flex flex-col gap-3 md:flex-row md:items-start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setSelected}
            events={sampleEvents}
          />
          <div className="surface rounded-lg p-4 text-sm min-w-[200px]">
            <p className="text-muted text-xs uppercase tracking-wider">Selected</p>
            <p className="font-medium">{formatDate(selected)}</p>
            {selected && todayEvents.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-muted text-xs uppercase tracking-wider">Events</p>
                {todayEvents.map((e) => (
                  <CalendarEvent key={e.id} event={e} compact />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Date Range (2 Months)</h3>
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={2}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Week Numbers</h3>
        <Calendar showWeekNumber events={sampleEvents} />
      </section>
    </>
  );
}

function ExamplesTab() {
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  const todayEvents = useMemo(() => {
    return sampleEvents.filter((e) => {
      if (!e.date) return false;
      return (
        e.date.getFullYear() === now.getFullYear() &&
        e.date.getMonth() === now.getMonth() &&
        e.date.getDate() === now.getDate()
      );
    });
  }, []);

  const upcomingEvents = useMemo(() => {
    return sampleEvents
      .filter((e) => e.date && e.date > now)
      .sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0))
      .slice(0, 5);
  }, []);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Monthly Planner</h3>
        <div className="surface rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <Calendar
                mode="single"
                selected={selected}
                onSelect={setSelected}
                events={sampleEvents}
                className="w-full"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">Today&apos;s Schedule</p>
                <div className="space-y-1.5">
                  {todayEvents.length === 0 ? (
                    <p className="text-muted text-xs">No events today</p>
                  ) : (
                    todayEvents.map((e) => (
                      <CalendarEvent key={e.id} event={e} />
                    ))
                  )}
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-sm font-semibold mb-2">Upcoming</p>
                <div className="space-y-1.5">
                  {upcomingEvents.map((e) => (
                    <div key={e.id} className="flex items-center gap-2 text-sm">
                      <span className="text-muted text-xs w-12 shrink-0">
                        {e.date?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <CalendarEvent event={e} compact />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Birthdays</h3>
        <div className="surface rounded-xl p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span className="bg-success size-2 rounded-full" /> Birthday
            </span>
          </div>
          <Calendar
            mode="single"
            events={birthdayEvents}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Team Schedule</h3>
        <div className="surface rounded-xl p-6">
          <div className="mb-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span className="bg-info size-2 rounded-full" /> Focus
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span className="bg-brand size-2 rounded-full" /> Meeting
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span className="bg-warning size-2 rounded-full" /> Review
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span className="bg-error size-2 rounded-full" /> Deploy
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs">
              <span className="bg-info size-2 rounded-full" /> Planning
            </span>
          </div>
          <Calendar
            mode="single"
            events={teamScheduleEvents}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
      </section>
    </>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Month with Events",
    description: "Calendar showing event indicators with a daily cap.",
    render: () => <ComponentsTab />,
  },
  {
    id: "variants",
    title: "Availability Window",
    description: "Calendar with min/max dates and disabled weekends.",
    render: () => <ExamplesTab />,
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
