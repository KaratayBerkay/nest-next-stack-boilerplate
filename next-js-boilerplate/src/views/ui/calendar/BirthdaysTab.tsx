"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { birthdayEvents } from "@/views/ui/calendar/calendar-data";

const Calendar = dynamic(
  () =>
    import("@/components/ui/Calendar").then((m) => ({ default: m.Calendar })),
  { ssr: false },
);

export function BirthdaysTab() {
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  return (
    <div className="flex flex-col gap-4">
      <div className="surface max-w-fit rounded-xl border p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="bg-success size-2 rounded-full" />
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
