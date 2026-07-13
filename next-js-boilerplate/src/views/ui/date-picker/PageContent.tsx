"use client";
import { useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function ComponentsTab() {
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <DatePicker
          value={defaultDate}
          onChange={setDefaultDate}
          placeholder="Pick a date"
          className="max-w-sm"
        />
      </section>
    </div>
  );
}

function ExamplesTab() {
  const [formDate, setFormDate] = useState<Date | undefined>();
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [birthDate, setBirthDate] = useState<Date | undefined>();

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Form Date Picker</h3>
        <p className="text-muted text-sm">Use a date picker in a form context.</p>
        <div className="flex flex-col gap-2 max-w-sm">
          <span className="text-sm font-medium">Event Date</span>
          <DatePicker
            value={formDate}
            onChange={setFormDate}
            placeholder="Select event date"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Booking Date Range</h3>
        <p className="text-muted text-sm">A check-in / check-out date range picker.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Check-in</span>
            <DatePicker
              value={checkIn}
              onChange={setCheckIn}
              placeholder="Select check-in"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Check-out</span>
            <DatePicker
              value={checkOut}
              onChange={setCheckOut}
              placeholder="Select check-out"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Birth Date Picker</h3>
        <p className="text-muted text-sm">A date picker for selecting a birth date.</p>
        <div className="flex flex-col gap-2 max-w-sm">
          <span className="text-sm font-medium">Date of Birth</span>
          <DatePicker
            value={birthDate}
            onChange={setBirthDate}
            placeholder="Select birth date"
          />
        </div>
      </section>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "components",
    title: "Event Date",
    description: "Plain labelled date picker form field.",
    render: () => <ComponentsTab />,
  },
  {
    id: "examples",
    title: "Booking Range",
    description: "Check-in and check-out date pickers linked as a booking range.",
    render: () => <ExamplesTab />,
  },
];

export default function DatePickerPage() {
  return (
    <ExampleTabs
      title="Date Picker"
      intro="A date picker with popover calendar."
      examples={examples}
    />
  );
}
