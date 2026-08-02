"use client";

import { SingleStateExample } from "@/views/ui/accordion/SingleStateExample";
import { MultiStateExample } from "@/views/ui/accordion/MultiStateExample";
import { RichItemsExample } from "@/views/ui/accordion/RichItemsExample";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "single-state",
    title: "Single State",
    description: "When a new accordion opens, the other open one closes.",
    render: () => <SingleStateExample />,
  },
  {
    id: "multi-state",
    title: "Multi State",
    description: "When a new accordion opens, the other open ones don't close.",
    render: () => <MultiStateExample />,
  },
  {
    id: "rich-items",
    title: "Rich Items",
    description:
      "AccordionItemComplex with flexible slots for avatars, badges, and rich content.",
    render: () => <RichItemsExample />,
  },
];

export default function AccordionPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Accordion"
      intro="A vertically stacked set of interactive headings that reveal content."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
