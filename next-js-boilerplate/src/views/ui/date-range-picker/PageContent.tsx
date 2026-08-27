"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { DefaultRangeTab } from "@/views/ui/date-range-picker/DefaultRangeTab";
import { ConstrainedRangeTab } from "@/views/ui/date-range-picker/ConstrainedRangeTab";
import { WithMessagesTab } from "@/views/ui/date-range-picker/WithMessagesTab";
import type { DateRangePickerVariant } from "@/types/ui/DateRangePicker-types";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

const examples: UIExample[] = [
  {
    id: "default",
    title: "Default",
    description: "A controlled date range with a clear affordance.",
    render: () => <DefaultRangeTab />,
  },
  {
    id: "constrained",
    title: "Constrained Range",
    description: "Restricts selection to a fixed start/end month window.",
    render: () => <ConstrainedRangeTab />,
  },
  {
    id: "messages",
    title: "With Messages",
    description: "Description and error message states.",
    render: () => <WithMessagesTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants.",
    render: () => (
      <VariantGallery
        variants={["default", "shiny", "glass", "neon", "gradient"]}
        sizes={[]}
        render={(variant, _size) => (
          <DateRangePicker variant={variant as DateRangePickerVariant} />
        )}
      />
    ),
  },
];

export default function DateRangePickerPage({
  initialTab,
}: {
  initialTab?: string;
}) {
  return (
    <ExampleTabs
      title="Date Range Picker"
      intro="A popover calendar for selecting a start and end date together."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
