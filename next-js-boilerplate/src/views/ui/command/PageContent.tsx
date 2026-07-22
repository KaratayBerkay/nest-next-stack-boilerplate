"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { QuickSearchTab } from "./QuickSearchTab";
import { CommandPaletteTab } from "./CommandPaletteTab";
import { CommandVariantGallery } from "./CommandVariantGallery";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "command-examples",
    title: "Command Examples",
    description:
      "Searchable command palette with keyboard navigation, filtering, and groups.",
    render: () => <QuickSearchTab />,
  },
  {
    id: "cmd-k-palette",
    title: "⌘K Palette",
    description:
      "A full-featured command palette with navigation, actions, and recent items.",
    render: () => <CommandPaletteTab />,
  },
  {
    id: "gallery",
    title: "Variant Gallery",
    description: "Command component across all theme variants and sizes.",
    render: () => <CommandVariantGallery />,
  },
];

export default function CommandPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Command"
      intro="Searchable command palette with keyboard navigation, filtering, and groups."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
