"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";

export function CompactFormatTab() {
  const [compactDate, setCompactDate] = useState<Date | undefined>();
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">
        Compact date display with live DD/MM/YY format and timestamp readout.
      </p>
      <DatePicker
        value={compactDate}
        onChange={setCompactDate}
        placeholder="DD/MM/YY"
        className="max-w-sm"
      />
      {compactDate && (
        <p className="text-fg text-sm">
          <span className="text-muted">DD/MM/YY: </span>
          {compactDate.toLocaleDateString("en-GB")}
          <span className="text-muted ml-3">Time: </span>
          {formatTime(compactDate)}
        </p>
      )}
    </div>
  );
}
