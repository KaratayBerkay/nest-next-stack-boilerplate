"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";

export function EventDateTab() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div className="flex flex-col gap-3">
      <DatePicker value={date} onChange={setDate} className="max-w-sm" />
    </div>
  );
}
