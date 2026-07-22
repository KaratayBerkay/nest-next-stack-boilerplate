"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { ToolbarLabelsDemo } from "@/views/ui/tooltip/ToolbarLabelsDemo";
import { DisabledReasonDemo } from "@/views/ui/tooltip/DisabledReasonDemo";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Toolbar Labels",
    description: "Icon buttons with tooltip labels via describedby.",
    render: () => <ToolbarLabelsDemo />,
  },
  {
    id: "variants",
    title: "Disabled Reason",
    description: "Tooltip on a disabled control explaining why it's disabled.",
    render: () => <DisabledReasonDemo />,
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
