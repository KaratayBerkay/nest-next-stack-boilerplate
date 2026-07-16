"use client";
import { useState } from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { DatePickerVariant } from "@/types/ui/DatePicker-types";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function EventDateTab() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <div className="flex flex-col gap-3">
      <DatePicker
        value={date}
        onChange={setDate}
        placeholder="Pick a date"
        className="max-w-sm"
      />
    </div>
  );
}

function CardExpiryTab() {
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
        <p className="text-sm text-fg">
          Selected: {expiry.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </p>
      )}
    </div>
  );
}

function BirthdateTab() {
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

function YearOnlyTab() {
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
        <p className="text-sm text-fg">
          Selected: {gradYear.getFullYear()}
        </p>
      )}
    </div>
  );
}

function CompactFormatTab() {
  const [compactDate, setCompactDate] = useState<Date | undefined>();
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

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
        <p className="text-sm text-fg">
          <span className="text-muted">DD/MM/YY: </span>
          {compactDate.toLocaleDateString("en-GB")}
          <span className="text-muted ml-3">Time: </span>
          {formatTime(compactDate)}
        </p>
      )}
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "default",
    title: "Event Date",
    description: "Standard date picker with dropdown month/year navigation.",
    render: () => <EventDateTab />,
  },
  {
    id: "card-expiry",
    title: "Card Expiry",
    description: "Month/year picker for credit card expiry dates.",
    render: () => <CardExpiryTab />,
  },
  {
    id: "birthdate",
    title: "Birthdate",
    description: "Date picker with dropdown year navigation from 1900 to present.",
    render: () => <BirthdateTab />,
  },
  {
    id: "year-only",
    title: "Year Only",
    description: "Year-only selection for graduation year or similar.",
    render: () => <YearOnlyTab />,
  },
  {
    id: "compact-format",
    title: "Compact Format",
    description: "Compact DD/MM/YY display with live timestamp readout.",
    render: () => <CompactFormatTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "shiny", "glass", "neon", "gradient"]}
        sizes={[]}
        render={(variant, _size) => (
          <DatePicker variant={variant as DatePickerVariant} />
        )}
      />
    ),
  },
];

export default function DatePickerPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Date Picker"
      intro="A date picker with popover calendar and multiple selection modes."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
