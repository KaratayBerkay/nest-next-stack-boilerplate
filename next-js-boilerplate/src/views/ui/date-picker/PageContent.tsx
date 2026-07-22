"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { EventDateTab } from "@/views/ui/date-picker/EventDateTab";
import { CardExpiryTab } from "@/views/ui/date-picker/CardExpiryTab";
import { BirthdateTab } from "@/views/ui/date-picker/BirthdateTab";
import { YearOnlyTab } from "@/views/ui/date-picker/YearOnlyTab";
import { CompactFormatTab } from "@/views/ui/date-picker/CompactFormatTab";
import type { DatePickerVariant } from "@/types/ui/DatePicker-types";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import { DatePicker } from "@/components/ui/DatePicker";

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
    description:
      "Date picker with dropdown year navigation from 1900 to present.",
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

export default function DatePickerPage({
  initialTab,
}: {
  initialTab?: string;
}) {
  return (
    <ExampleTabs
      title="Date Picker"
      intro="A date picker with popover calendar and multiple selection modes."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
