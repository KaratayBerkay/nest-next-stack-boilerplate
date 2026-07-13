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

      <div className="bg-slate-950 p-6 rounded-xl space-y-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-white">Shiny</h3>
          <DatePicker variant="shiny" className="max-w-sm" />
        </section>
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-white">Glass</h3>
          <DatePicker variant="glass" className="max-w-sm" />
        </section>
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-white">Neon</h3>
          <DatePicker variant="neon" className="max-w-sm" />
        </section>
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-white">Gradient</h3>
          <DatePicker variant="gradient" className="max-w-sm" />
        </section>
      </div>
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
        <h3 className="text-lg font-semibold">Form Date Picker (Neon)</h3>
        <p className="text-muted text-sm">Use a neon date picker in a form context.</p>
        <div className="flex flex-col gap-2 max-w-sm">
          <span className="text-sm font-medium">Event Date</span>
          <DatePicker
            variant="neon"
            value={formDate}
            onChange={setFormDate}
            placeholder="Select event date"
          />
        </div>
      </section>

      <div className="bg-slate-950 p-6 rounded-xl space-y-6">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-white">Booking Date Range (Glass)</h3>
          <p className="text-slate-400 text-sm">A check-in / check-out date range picker.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white">Check-in</span>
              <DatePicker
                variant="glass"
                value={checkIn}
                onChange={setCheckIn}
                placeholder="Select check-in"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white">Check-out</span>
              <DatePicker
                variant="glass"
                value={checkOut}
                onChange={setCheckOut}
                placeholder="Select check-out"
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-white">Birth Date Picker (Shiny)</h3>
          <p className="text-slate-400 text-sm">A shiny date picker for selecting a birth date.</p>
          <div className="flex flex-col gap-2 max-w-sm">
            <span className="text-sm font-medium text-white">Date of Birth</span>
            <DatePicker
              variant="shiny"
              value={birthDate}
              onChange={setBirthDate}
              placeholder="Select birth date"
            />
          </div>
        </section>
      </div>
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
