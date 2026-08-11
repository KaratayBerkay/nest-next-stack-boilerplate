"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { ToolbarLabelsDemo } from "@/views/ui/tooltip/ToolbarLabelsDemo";
import { DisabledReasonDemo } from "@/views/ui/tooltip/DisabledReasonDemo";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Toolbar Labels",
    description: "Icon buttons with tooltip labels via describedby.",
    render: () => <DisabledReasonDemo />,
  },
  {
    id: "variants",
    title: "Side Placement",
    description:
      "Buttons demonstrating each tooltip side: top, bottom, left, and right.",
    render: () => <ToolbarLabelsDemo />,
  },
];

export default function TooltipPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Tooltip"
      intro="A tooltip that appears on hover with configurable side and variant."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
