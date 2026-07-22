"use client";
import { FormattingToolbarTab } from "./FormattingToolbarTab";
import { NotificationMuteTab } from "./NotificationMuteTab";
import { Toggle } from "@/components/ui/Toggle";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";
import type { ToggleVariant, ToggleSize } from "@/types/ui/Toggle-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Formatting Toolbar",
    description:
      "Bold, italic, and underline toggle buttons in an editor toolbar.",
    render: () => <FormattingToolbarTab />,
  },
  {
    id: "variants",
    title: "Notification Mute",
    description: "A single stateful toggle with a label and status readout.",
    render: () => <NotificationMuteTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "outline", "shiny", "glass", "neon", "gradient"]}
        sizes={["sm", "md", "lg"]}
        render={(variant, size) => (
          <Toggle variant={variant as ToggleVariant} size={size as ToggleSize}>
            Toggle
          </Toggle>
        )}
      />
    ),
  },
];

export default function TogglePage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Toggle"
      intro="A toggle button."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
