"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { GlobalVariant } from "@/components/ui/global-style-variants";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/ui/PageContent-types";
import { CartTab } from "@/views/ui/counter/CartTab";
import { PassengersTab } from "@/views/ui/counter/PassengersTab";
import { TicketsTab } from "@/views/ui/counter/TicketsTab";
import { Counter } from "@/components/ui/Counter";

const examples: UIExample[] = [
  {
    id: "cart-quantity",
    title: "Cart Quantity",
    description: "Cart line items with stock limits and a live subtotal.",
    render: () => <CartTab />,
  },
  {
    id: "passenger-count",
    title: "Passenger Count",
    description: "Flight booking with cross-field min/max rules.",
    render: () => <PassengersTab />,
  },
  {
    id: "event-tickets",
    title: "Event Tickets",
    description: "Per-order limits and step-based bundles with an order total.",
    render: () => <TicketsTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants.",
    render: () => (
      <VariantGallery
        variants={["default", "shiny", "glass", "neon", "gradient"]}
        sizes={[]}
        render={(variant) => (
          <Counter label="Quantity" variant={variant as GlobalVariant} />
        )}
      />
    ),
  },
];

export default function CounterPage({ initialTab }: InitialTabProps) {
  return (
    <ExampleTabs
      title="Counter"
      intro="A compact stepper for choosing small quantities — cart items, travellers, tickets."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
