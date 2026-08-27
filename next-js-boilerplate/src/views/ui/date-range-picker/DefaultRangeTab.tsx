"use client";

import { useState } from "react";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import type { DateRangeValue } from "@/types/ui/DateRangePicker-types";

export function DefaultRangeTab() {
  const [range, setRange] = useState<DateRangeValue | undefined>();

  return (
    <div className="flex flex-col gap-3">
      <DateRangePicker value={range} onChange={setRange} className="max-w-sm" />
    </div>
  );
}
