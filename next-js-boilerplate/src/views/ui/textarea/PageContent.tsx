"use client";

import { Textarea } from "@/components/ui/Textarea";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { UsageTab } from "./UsageTab";
import { ExamplesTab } from "./ExamplesTab";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";
import type { TextareaVariant } from "@/types/ui/Textarea-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Support Ticket",
    description: "Textarea with error state and helper description.",
    render: () => <UsageTab />,
  },
  {
    id: "variants",
    title: "Auto-resize Reply",
    description: "Textarea that grows with content up to a max height.",
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
          <Textarea
            variant={variant as TextareaVariant}
            placeholder="Textarea..."
          />
        )}
      />
    ),
  },
];

export default function TextareaPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Textarea"
      intro="A multi-line text input field with multiple stylish variants."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
