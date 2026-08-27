"use client";

import { useState } from "react";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import type { DateRangeValue } from "@/types/ui/DateRangePicker-types";

function today() {
  return new Date();
}

function ninetyDaysOut() {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return d;
}

export function ConstrainedRangeTab() {
  const [range, setRange] = useState<DateRangeValue | undefined>();

  return (
    <div className="flex flex-col gap-3">
      <DateRangePicker
        value={range}
        onChange={setRange}
        startMonth={today()}
        endMonth={ninetyDaysOut()}
        placeholder="Pick a date within the next 90 days"
        className="max-w-sm"
      />
    </div>
  );
}
