"use client";
import { ToggleExamplesTab } from "./ToggleExamplesTab";
import { NotificationSettingsTab } from "./NotificationSettingsTab";
import { VariantGalleryTab } from "./VariantGalleryTab";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "toggle-examples",
    title: "Toggle Examples",
    description:
      "Basic switch examples across states and a quick-settings panel demo.",
    render: () => <ToggleExamplesTab />,
  },
  {
    id: "notification-settings",
    title: "Notification Settings",
    description:
      "A grouped notification-preferences panel with individual toggle controls.",
    render: () => <NotificationSettingsTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description:
      "All switch variants and sizes in a side-by-side comparison table.",
    render: () => <VariantGalleryTab />,
  },
];

export default function SwitchPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Switch"
      intro="A toggle switch for binary settings with multiple stylish variants."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
