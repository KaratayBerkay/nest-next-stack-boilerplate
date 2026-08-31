"use client";

import { useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";

export function BirthdateTab() {
  const [birthdate, setBirthdate] = useState<Date | undefined>();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">
        Date of birth with dropdown year navigation (1900–present).
      </p>
      <DatePicker
        value={birthdate}
        onChange={setBirthdate}
        placeholder="Select birth date"
        startMonth={new Date(1900, 0, 1)}
        endMonth={new Date()}
        className="max-w-sm"
      />
    </div>
  );
}
