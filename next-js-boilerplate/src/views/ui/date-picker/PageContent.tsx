"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { DatePicker } from "@/components/ui/DatePicker";

function ComponentsTab() {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <DatePicker className="max-w-sm" />
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

export default function DatePickerPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Date Picker</h2>
        <p className="text-muted text-sm">
          A date picker with popover calendar.
        </p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <ComponentsTab />
        </TabsContent>
        <TabsContent value="examples">
          <ExamplesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
