"use client";

import { IconCircleCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithOrderSummaryMessages } from "@/types/pages/order-summary/OrderSummaryMessages-types";

interface OrderSummary1Item {
  id: string;
  nameKey: string;
  qty: number;
  price: number;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const ITEMS: OrderSummary1Item[] = [
  { id: "chair", nameKey: "orderSummary1Item1Name", qty: 1, price: 189 },
  { id: "lamp", nameKey: "orderSummary1Item2Name", qty: 2, price: 42.5 },
  { id: "rug", nameKey: "orderSummary1Item3Name", qty: 1, price: 96 },
];

const SHIPPING = 12 as const;
const TAX_RATE = 0.08;

export function ItemizedTotalsOrderSummary() {
  const t = useMessages("pages") as unknown as PagesWithOrderSummaryMessages;
  const os = t.orderSummary;

  const subtotal = ITEMS.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + SHIPPING + tax;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-xl flex-col px-6 lg:px-8">
        <div className="border-border bg-surface flex flex-col gap-6 rounded-3xl border p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="bg-success/10 flex size-11 shrink-0 items-center justify-center rounded-full">
              <IconCircleCheck className="text-success size-6" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <Typography variant="h3">{os.orderSummary1Heading}</Typography>
              <span className="text-muted text-sm">
                {os.orderSummary1OrderLabel}{" "}
                <span className="text-fg font-medium">
                  {os.orderSummary1OrderNumber}
                </span>{" "}
                · {os.orderSummary1DateValue}
              </span>
            </div>
          </div>
          <Separator />
          <ul className="flex flex-col gap-3">
            {ITEMS.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <div className="flex flex-col">
                  <span className="text-fg font-medium">
                    {os[item.nameKey]}
                  </span>
                  <span className="text-muted text-xs">
                    {os.orderSummary1QtyLabel} {item.qty} × {usd(item.price)}
                  </span>
                </div>
                <span className="text-fg font-medium">
                  {usd(item.qty * item.price)}
                </span>
              </li>
            ))}
          </ul>
          <Separator />
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">
                {os.orderSummary1SubtotalLabel}
              </span>
              <span className="text-fg">{usd(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted flex items-center gap-2">
                {os.orderSummary1ShippingLabel}
                <Badge variant="outline" size="sm">
                  {os.orderSummary1ShippingMethod}
                </Badge>
              </span>
              <span className="text-fg">{usd(SHIPPING)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">{os.orderSummary1TaxLabel}</span>
              <span className="text-fg">{usd(tax)}</span>
            </div>
            <div className="border-border flex items-center justify-between border-t pt-3 text-base font-semibold">
              <span className="text-fg">{os.orderSummary1TotalLabel}</span>
              <span className="text-fg">{usd(total)}</span>
            </div>
          </div>
          <Button variant="primary" size="lg" className="w-full">
            {os.orderSummary1CtaLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
