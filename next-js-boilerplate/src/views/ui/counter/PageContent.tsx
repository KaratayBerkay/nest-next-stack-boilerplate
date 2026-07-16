"use client";

import { Counter } from "@/components/ui/Counter";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "cart-quantity",
    title: "Cart Quantity",
    description: "Increment counter for cart item quantity.",
    render: () => (
      <div className="flex gap-6">
        <Counter label="Shoes" />
        <Counter label="Hats" />
      </div>
    ),
  },
  {
    id: "passenger-count",
    title: "Passenger Count",
    description: "Multiple counters for a booking form.",
    render: () => (
      <div className="flex gap-6">
        <Counter label="Adults" />
        <Counter label="Children" />
        <Counter label="Infants" />
      </div>
    ),
  },
];

export default function CounterPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Counter"
      intro="A simple click counter button."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
