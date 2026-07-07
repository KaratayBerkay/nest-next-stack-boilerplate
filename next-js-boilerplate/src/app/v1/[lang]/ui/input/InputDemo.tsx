"use client";

import { useState } from "react";
import { Input, DateInput, DateTimeInput, InputWithIcon, FileInput } from "@/components/ui/Input";

export default function InputDemo() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [dateTime, setDateTime] = useState<Date | undefined>(undefined);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Input</h2>
      <p className="text-muted text-sm">
        A text input field for user data entry.
      </p>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Input data-testid="input-default" className="max-w-sm" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Placeholder</h3>
        <Input
          placeholder="Enter your email"
          data-testid="input-placeholder"
          className="max-w-sm"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Disabled</h3>
        <Input
          disabled
          placeholder="Disabled input"
          data-testid="input-disabled"
          className="max-w-sm"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Error State</h3>
        <Input
          error="This field is required"
          defaultValue="Invalid value"
          data-testid="input-error"
          className="max-w-sm"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">With Icon</h3>
        <InputWithIcon
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          }
          placeholder="Search..."
          className="max-w-sm"
          data-testid="input-with-icon"
        />
        <InputWithIcon
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
          }
          side="right"
          placeholder="Download path"
          className="max-w-sm"
          data-testid="input-with-icon-right"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Date Input</h3>
        <div className="flex flex-col gap-2 max-w-sm">
          <DateInput
            value={date}
            onChange={setDate}
            data-testid="date-input"
          />
          {date && (
            <p className="text-muted text-xs">
              Selected: {date.toLocaleDateString()}
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Date & Time Input</h3>
        <div className="flex flex-col gap-2 max-w-sm">
          <DateTimeInput
            value={dateTime}
            onChange={setDateTime}
            data-testid="date-time-input"
          />
          {dateTime && (
            <p className="text-muted text-xs">
              Selected: {dateTime.toLocaleString()}
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">File Input</h3>
        <FileInput data-testid="file-input" />
      </section>
    </div>
  );
}
