"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";

export function CardExpiryTab() {
  const [expiry, setExpiry] = useState<Date | undefined>();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">
        Month/year picker for card expiry dates.
      </p>
      <DatePicker
        value={expiry}
        onChange={setExpiry}
        placeholder="MM/YY"
        picker="month"
        className="max-w-sm"
      />
      {expiry && (
        <p className="text-fg text-sm">
          Selected:{" "}
          {expiry.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
