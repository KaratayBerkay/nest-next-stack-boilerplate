"use client";

import { TimeInput } from "@/components/ui/TimeInput";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { ComponentsTab } from "./ComponentsTab";
import { ExamplesTab } from "./ExamplesTab";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";
import type { TimeInputVariant } from "@/types/ui/TimeInput-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Meeting Time",
    description: "24-hour time input with locale-aware formatting.",
    render: () => <ComponentsTab />,
  },
  {
    id: "variants",
    title: "Alarm",
    description: "12-hour AM/PM time input.",
    render: () => <ExamplesTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "shiny", "glass", "neon", "gradient"]}
        sizes={[]}
        render={(variant) => (
          <TimeInput variant={variant as TimeInputVariant} />
        )}
      />
    ),
  },
];

export default function TimeInputPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Time Input"
      intro="A time picker with dropdown selectors for hours, minutes, and seconds with automatic timezone detection."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
