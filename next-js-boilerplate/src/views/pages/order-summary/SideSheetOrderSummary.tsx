"use client";

import { useState } from "react";
import { IconReceipt2, IconTag } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/Sheet";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithOrderSummaryMessages } from "@/types/pages/order-summary/OrderSummaryMessages-types";

interface OrderSummary5Item {
  id: string;
  nameKey: string;
  qty: number;
  price: number;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const ITEMS: OrderSummary5Item[] = [
  { id: "backpack", nameKey: "orderSummary5Item1Name", qty: 1, price: 78 },
  { id: "bottle", nameKey: "orderSummary5Item2Name", qty: 2, price: 18 },
  { id: "cap", nameKey: "orderSummary5Item3Name", qty: 1, price: 24 },
];

const SHIPPING = 5 as const;
const DISCOUNT_RATE = 0.1;

export function SideSheetOrderSummary() {
  const t = useMessages("pages") as unknown as PagesWithOrderSummaryMessages;
  const os = t.orderSummary;
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState(false);

  const subtotal = ITEMS.reduce((sum, item) => sum + item.qty * item.price, 0);
  const discount = applied ? subtotal * DISCOUNT_RATE : 0;
  const total = subtotal + SHIPPING - discount;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-6 lg:px-8">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              leftIcon={<IconReceipt2 size={18} aria-hidden="true" />}
            >
              {os.orderSummary5TriggerLabel}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex flex-col gap-6 overflow-y-auto"
          >
            <SheetHeader className="text-left">
              <SheetTitle>{os.orderSummary5Heading}</SheetTitle>
              <SheetDescription>{os.orderSummary5Description}</SheetDescription>
            </SheetHeader>
            <ul className="flex flex-col">
              {ITEMS.map((item) => (
                <li
                  key={item.id}
                  className="border-border flex items-center justify-between gap-4 border-b py-3 last:border-b-0"
                >
                  <div className="flex flex-col">
                    <span className="text-fg text-sm font-medium">
                      {os[item.nameKey]}
                    </span>
                    <span className="text-muted text-xs">× {item.qty}</span>
                  </div>
                  <span className="text-fg text-sm">
                    {usd(item.qty * item.price)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder={os.orderSummary5PromoPlaceholder}
                leftIcon={<IconTag size={16} aria-hidden="true" />}
              />
              <Button
                variant="outline"
                onClick={() => setApplied(promo.trim().length > 0)}
              >
                {os.orderSummary5PromoApplyLabel}
              </Button>
            </div>
            {applied && (
              <Badge variant="success" className="w-fit">
                {os.orderSummary5PromoAppliedLabel}
              </Badge>
            )}
            <div className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">
                  {os.orderSummary5SubtotalLabel}
                </span>
                <span className="text-fg">{usd(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">
                  {os.orderSummary5ShippingLabel}
                </span>
                <span className="text-fg">{usd(SHIPPING)}</span>
              </div>
              {applied && (
                <div className="flex items-center justify-between">
                  <span className="text-muted">
                    {os.orderSummary5DiscountLabel}
                  </span>
                  <span className="text-brand">-{usd(discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-base font-semibold">
                <span className="text-fg">{os.orderSummary5TotalLabel}</span>
                <span className="text-fg">{usd(total)}</span>
              </div>
            </div>
            <Button variant="primary" className="w-full">
              {os.orderSummary5ConfirmLabel}
            </Button>
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}
