"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { DateRange } from "react-day-picker";
import { makeDate, formatDate } from "@/views/ui/calendar/calendar-data";

const Calendar = dynamic(
  () =>
    import("@/components/ui/Calendar").then((m) => ({ default: m.Calendar })),
  { ssr: false },
);

export function AppointmentRangeTab() {
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
            <span className="text-muted text-xs tracking-wider uppercase">
              Check-in
            </span>
            <p className="font-medium">
              {range?.from ? formatDate(range.from) : "—"}
            </p>
          </div>
          <div>
            <span className="text-muted text-xs tracking-wider uppercase">
              Check-out
            </span>
            <p className="font-medium">
              {range?.to ? formatDate(range.to) : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
