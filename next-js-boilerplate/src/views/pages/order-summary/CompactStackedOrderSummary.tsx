"use client";

import { IconCircleCheckFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithOrderSummaryMessages } from "@/types/pages/order-summary/OrderSummaryMessages-types";

interface OrderSummary2Item {
  id: string;
  nameKey: string;
  qty: number;
  price: number;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const ITEMS: OrderSummary2Item[] = [
  { id: "course", nameKey: "orderSummary2Item1Name", qty: 1, price: 59 },
  { id: "ebook", nameKey: "orderSummary2Item2Name", qty: 1, price: 14 },
];

export function CompactStackedOrderSummary() {
  const t = useMessages("pages") as unknown as PagesWithOrderSummaryMessages;
  const os = t.orderSummary;

  const total = ITEMS.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-sm flex-col items-center px-6 lg:px-8">
        <div className="border-border bg-surface flex w-full flex-col items-center gap-4 rounded-2xl border p-6 text-center">
          <IconCircleCheckFilled
            className="text-success size-9"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <Typography variant="h4">{os.orderSummary2Heading}</Typography>
            <span className="text-muted text-xs">
              {os.orderSummary2OrderNumber}
            </span>
          </div>
          <div className="flex w-full flex-col gap-1.5">
            {ITEMS.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-fg">
                  {os[item.nameKey]}{" "}
                  <span className="text-muted">× {item.qty}</span>
                </span>
                <span className="text-muted">{usd(item.qty * item.price)}</span>
              </div>
            ))}
          </div>
          <div className="border-border flex w-full items-center justify-between border-t pt-3 text-sm font-semibold">
            <span className="text-fg">{os.orderSummary2TotalLabel}</span>
            <span className="text-fg">{usd(total)}</span>
          </div>
          <Button variant="primary" className="w-full">
            {os.orderSummary2CtaLabel}
          </Button>
          <span className="text-muted text-xs">
            {os.orderSummary2EmailNote}
          </span>
        </div>
      </div>
    </section>
  );
}
