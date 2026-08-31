"use client";

import { useState } from "react";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import type { DateRangeValue } from "@/types/ui/DateRangePicker-types";

export function WithMessagesTab() {
  const [range, setRange] = useState<DateRangeValue | undefined>();

  return (
    <div className="flex flex-col gap-6">
      <DateRangePicker
        value={range}
        onChange={setRange}
        description="Filter results to activity within this range."
        className="max-w-sm"
      />
      <DateRangePicker
        error="A start and end date are both required."
        className="max-w-sm"
      />
    </div>
  );
}
