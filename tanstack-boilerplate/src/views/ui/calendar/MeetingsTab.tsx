"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { CalendarEvent } from "@/components/ui/calendar/calendar-event";
import {
  makeDate,
  formatDate,
  meetingEvents,
} from "@/views/ui/calendar/calendar-data";

const Calendar = dynamic(
  () =>
    import("@/components/ui/Calendar").then((m) => ({ default: m.Calendar })),
  { ssr: false },
);

export function MeetingsTab() {
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
          <p className="mb-2 text-sm font-semibold">
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
