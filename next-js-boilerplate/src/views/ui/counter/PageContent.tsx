"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Counter } from "@/components/ui/Counter";
import { Button } from "@/components/ui/Button";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { GlobalVariant } from "@/components/ui/global-style-variants";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const usd = (n: number) => `$${n.toFixed(2)}`;

type CartItem = {
  id: string;
  name: string;
  detail: string;
  price: number;
  stock: number;
  qty: number;
};

const FREE_SHIPPING_THRESHOLD = 75;

function setQtyModuleLevel(
  id: string,
  qty: number,
  setItems: Dispatch<SetStateAction<CartItem[]>>,
) {
  setItems((prev) => prev.map((item) => (item.id === id ? { ...item, qty } : item)));
}

function CartTab() {
  const [items, setItems] = useState<CartItem[]>([
    { id: "tee", name: "Organic Cotton Tee", detail: "Size M · Sage", price: 24, stock: 10, qty: 1 },
    { id: "socks", name: "Wool Running Socks", detail: "3-pack", price: 16, stock: 4, qty: 2 },
    { id: "cap", name: "Corduroy Cap", detail: "One size", price: 19, stock: 2, qty: 1 },
  ]);

  const setQty = (id: string, qty: number) => setQtyModuleLevel(id, qty, setItems);

  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="surface divide-border max-w-md divide-y overflow-hidden">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className={item.qty === 0 ? "text-muted text-sm line-through" : "text-fg text-sm font-medium"}>
              {item.name}
            </p>
            <p className="text-muted text-xs">
              {item.detail} · {usd(item.price)}
              {item.stock <= 2 && (
                <span className="text-warning"> · Only {item.stock} left</span>
              )}
            </p>
          </div>
          <Counter
            label={item.name}
            min={0}
            max={item.stock}
            value={item.qty}
            onChange={(qty) => setQty(item.id, qty)}
          />
          <span className="text-fg w-14 text-right text-sm tabular-nums">
            {item.qty === 0 ? "—" : usd(item.qty * item.price)}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-fg text-sm font-medium">
            Subtotal · {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
          <p className="text-muted text-xs">
            {remaining > 0 ? (
              <>Add {usd(remaining)} more for free shipping</>
            ) : (
              <span className="text-success">Qualifies for free shipping</span>
            )}
          </p>
        </div>
        <span className="text-fg text-base font-semibold tabular-nums">{usd(subtotal)}</span>
      </div>
    </div>
  );
}

const MAX_SEATS = 9;

function handleAdultsModuleLevel(
  v: number,
  setAdults: Dispatch<SetStateAction<number>>,
  setInfants: Dispatch<SetStateAction<number>>,
) {
  setAdults(v);
  setInfants((prev) => Math.min(prev, v));
}

function PassengersTab() {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const travellers = adults + children + infants;

  const handleAdults = (v: number) => handleAdultsModuleLevel(v, setAdults, setInfants);

  const rows = [
    {
      id: "adults",
      label: "Adults",
      sublabel: "Age 12+",
      value: adults,
      min: 1,
      max: MAX_SEATS - children,
      onChange: handleAdults,
    },
    {
      id: "children",
      label: "Children",
      sublabel: "Age 2–11",
      value: children,
      min: 0,
      max: MAX_SEATS - adults,
      onChange: setChildren,
    },
    {
      id: "infants",
      label: "Infants",
      sublabel: "Under 2, on lap",
      value: infants,
      min: 0,
      max: adults,
      onChange: setInfants,
    },
  ];

  return (
    <div className="flex max-w-sm flex-col gap-3">
      <div className="surface divide-border divide-y overflow-hidden">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="text-fg text-sm font-medium">{row.label}</p>
              <p className="text-muted text-xs">{row.sublabel}</p>
            </div>
            <Counter
              label={row.label}
              min={row.min}
              max={row.max}
              value={row.value}
              onChange={row.onChange}
            />
          </div>
        ))}
        <div className="px-4 py-3">
          <p className="text-fg text-sm font-medium">
            {travellers} {travellers === 1 ? "traveller" : "travellers"}
          </p>
          <p className="text-muted text-xs">
            {adults} {adults === 1 ? "adult" : "adults"}, {children}{" "}
            {children === 1 ? "child" : "children"}, {infants}{" "}
            {infants === 1 ? "infant" : "infants"}
          </p>
        </div>
      </div>
      <p className="text-muted text-xs">
        Up to {MAX_SEATS} seated travellers per booking. Infants travel on an
        adult&apos;s lap — one per adult.
      </p>
    </div>
  );
}

function TicketsTab() {
  const [general, setGeneral] = useState(0);
  const [vip, setVip] = useState(0);
  const [raffle, setRaffle] = useState(0);

  const total = general * 25 + vip * 75 + raffle * 2;

  const rows = [
    {
      id: "general",
      name: "General Admission",
      note: "$25 each · max 8 per order",
      value: general,
      max: 8,
      step: 1,
      onChange: setGeneral,
      lineTotal: general * 25,
    },
    {
      id: "vip",
      name: "VIP",
      note: "$75 each · only 3 left",
      value: vip,
      max: 3,
      step: 1,
      onChange: setVip,
      lineTotal: vip * 75,
    },
    {
      id: "raffle",
      name: "Raffle Tickets",
      note: "$2 each · sold in packs of 5",
      value: raffle,
      max: 25,
      step: 5,
      onChange: setRaffle,
      lineTotal: raffle * 2,
    },
  ];

  return (
    <div className="surface divide-border max-w-md divide-y overflow-hidden">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-4 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-fg text-sm font-medium">{row.name}</p>
            <p className="text-muted text-xs">{row.note}</p>
          </div>
          <Counter
            label={row.name}
            min={0}
            max={row.max}
            step={row.step}
            value={row.value}
            onChange={row.onChange}
          />
          <span className="text-fg w-14 text-right text-sm tabular-nums">
            {row.lineTotal === 0 ? "—" : usd(row.lineTotal)}
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-fg text-base font-semibold tabular-nums">{usd(total)}</span>
        <Button variant="primary" disabled={total === 0}>
          Checkout
        </Button>
      </div>
    </div>
  );
}

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

export default function CounterPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Counter"
      intro="A compact stepper for choosing small quantities — cart items, travellers, tickets."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
