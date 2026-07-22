"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";
import { FilterPanelDemo } from "./FilterPanelDemo";
import { NavigationDemo } from "./NavigationDemo";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Filter Panel",
    description: "Right-side sheet with form controls.",
    render: () => <FilterPanelDemo />,
  },
  {
    id: "variants",
    title: "Navigation",
    description: "Left-side sheet with menu links.",
    render: () => <NavigationDemo />,
  },
];

export default function SheetPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Sheet"
      intro="A slide-in panel from the edge with configurable side and variant."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
