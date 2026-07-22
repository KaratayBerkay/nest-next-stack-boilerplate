"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { PaymentMethodTab } from "@/views/ui/radio-group/PaymentMethodTab";
import { PlanTiersTab } from "@/views/ui/radio-group/PlanTiersTab";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Payment Method",
    description: "Card-style radio options with descriptions for each choice.",
    render: () => <PaymentMethodTab />,
  },
  {
    id: "variants",
    title: "Plan Tiers",
    description: "Pricing plan selection with radio buttons.",
    render: () => <PlanTiersTab />,
  },
];

export default function RadioGroupPage({
  initialTab,
}: {
  initialTab?: string;
}) {
  return (
    <ExampleTabs
      title="Radio Group"
      intro="A set of radio buttons."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
