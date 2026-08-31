"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithOrderSummaryMessages } from "@/types/pages/order-summary/OrderSummaryMessages-types";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";

interface OrderSummary3Item {
  id: string;
  nameKey: string;
  qty: number;
  price: number;
  imageSeed: string;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const ITEMS: OrderSummary3Item[] = [
  {
    id: "mug",
    nameKey: "orderSummary3Item1Name",
    qty: 2,
    price: 14,
    imageSeed: "order-summary3-mug",
  },
  {
    id: "candle",
    nameKey: "orderSummary3Item2Name",
    qty: 1,
    price: 22,
    imageSeed: "order-summary3-candle",
  },
  {
    id: "notebook",
    nameKey: "orderSummary3Item3Name",
    qty: 3,
    price: 9,
    imageSeed: "order-summary3-notebook",
  },
];

const SHIPPING = 6.5 as const;
const TAX_RATE = 0.08;

export function ProductGridOrderSummary() {
  const t = useMessages("pages") as unknown as PagesWithOrderSummaryMessages;
  const os = t.orderSummary;

  const subtotal = ITEMS.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + SHIPPING + tax;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-2xl flex-col px-6 lg:px-8">
        <div className="border-border bg-surface flex flex-col gap-6 rounded-3xl border p-6 sm:p-8">
          <Typography variant="h3">{os.orderSummary3Heading}</Typography>
          <div className="grid grid-cols-3 gap-4">
            {ITEMS.map((item) => (
              <div key={item.id} className="flex flex-col gap-2">
                <div className="bg-surface-hover border-border relative aspect-square overflow-hidden rounded-xl border">
                  <Image
                    src={placeholderImage(item.imageSeed, "1x1")}
                    alt={os[item.nameKey]}
                    fill
                    sizes="(min-width: 640px) 200px, 33vw"
                    className="object-cover"
                  />
                  <Badge
                    variant="default"
                    size="sm"
                    className="absolute top-1.5 right-1.5"
                  >
                    ×{item.qty}
                  </Badge>
                </div>
                <div className="flex flex-col">
                  <span className="text-fg truncate text-xs font-medium">
                    {os[item.nameKey]}
                  </span>
                  <span className="text-muted text-xs">
                    {usd(item.qty * item.price)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">
                {os.orderSummary3SubtotalLabel}
              </span>
              <span className="text-fg">{usd(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">
                {os.orderSummary3ShippingLabel}
              </span>
              <span className="text-fg">{usd(SHIPPING)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">{os.orderSummary3TaxLabel}</span>
              <span className="text-fg">{usd(tax)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span className="text-fg">{os.orderSummary3TotalLabel}</span>
              <span className="text-fg">{usd(total)}</span>
            </div>
          </div>
          <Button variant="primary" size="lg" className="w-full">
            {os.orderSummary3CtaLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
