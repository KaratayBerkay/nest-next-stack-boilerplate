"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";

export function YearOnlyTab() {
  const [gradYear, setGradYear] = useState<Date | undefined>();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">
        Year-only picker for graduation year selection.
      </p>
      <DatePicker
        value={gradYear}
        onChange={setGradYear}
        placeholder="Select year"
        picker="year"
        className="max-w-sm"
      />
      {gradYear && (
        <p className="text-fg text-sm">Selected: {gradYear.getFullYear()}</p>
      )}
    </div>
  );
}
