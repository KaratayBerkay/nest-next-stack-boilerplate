"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { makeDate, formatDate, noteEntries } from "@/views/ui/calendar/calendar-data";

const Calendar = dynamic(
  () =>
    import("@/components/ui/Calendar").then((m) => ({ default: m.Calendar })),
  { ssr: false },
);

export function DailyNotesTab() {
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
          <p className="mb-3 text-sm font-semibold">
            {selected ? formatDate(selected) : "Select a day"}
          </p>
          {dayNotes.length === 0 ? (
            <p className="text-muted text-xs">No notes for this day</p>
          ) : (
            <ul className="space-y-2">
              {dayNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="bg-brand mt-1 size-1.5 shrink-0 rounded-full" />
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
