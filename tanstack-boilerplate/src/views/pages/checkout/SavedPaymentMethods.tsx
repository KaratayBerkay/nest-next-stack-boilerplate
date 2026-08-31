"use client";

import { useState } from "react";
import {
  IconBrandMastercard,
  IconBrandVisa,
  IconCreditCard,
  IconPlus,
  IconShoppingBag,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCheckoutMessages } from "@/types/pages/checkout/CheckoutMessages-types";

interface CartItem {
  nameKey: string;
  qtyKey: string;
  priceKey: string;
}

interface SavedCard {
  value: string;
  icon: Icon;
  labelKey: string;
  expiryKey: string;
}

const CART_ITEMS: CartItem[] = [
  {
    nameKey: "checkout10Item1Name",
    qtyKey: "checkout10Item1Qty",
    priceKey: "checkout10Item1Price",
  },
  {
    nameKey: "checkout10Item2Name",
    qtyKey: "checkout10Item2Qty",
    priceKey: "checkout10Item2Price",
  },
  {
    nameKey: "checkout10Item3Name",
    qtyKey: "checkout10Item3Qty",
    priceKey: "checkout10Item3Price",
  },
];

const SAVED_CARDS: SavedCard[] = [
  {
    value: "visa-4242",
    icon: IconBrandVisa,
    labelKey: "checkout10Card1Label",
    expiryKey: "checkout10Card1Expiry",
  },
  {
    value: "mastercard-1234",
    icon: IconBrandMastercard,
    labelKey: "checkout10Card2Label",
    expiryKey: "checkout10Card2Expiry",
  },
];

export function SavedPaymentMethods() {
  const t = useMessages("pages") as unknown as PagesWithCheckoutMessages;
  const co = t.checkout;
  const [card, setCard] = useState("visa-4242");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {co.checkout10Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.checkout10Description}
          </Typography>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border-border bg-surface flex flex-col gap-5 rounded-3xl border p-6">
            <div className="flex items-center gap-2">
              <IconShoppingBag
                size={18}
                className="text-muted"
                aria-hidden="true"
              />
              <Typography variant="h4">{co.checkout10CartTitle}</Typography>
            </div>
            <ul className="flex flex-col">
              {CART_ITEMS.map((item) => (
                <li
                  key={item.nameKey}
                  className="border-border flex items-center justify-between gap-4 border-b py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">
                      {co[item.nameKey]}
                    </span>
                    <span className="text-muted text-xs">
                      {co[item.qtyKey]}
                    </span>
                  </div>
                  <span className="text-sm">{co[item.priceKey]}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">{co.checkout10Subtotal}</span>
                <span>{co.checkout10SubtotalValue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{co.checkout10Shipping}</span>
                <span>{co.checkout10ShippingValue}</span>
              </div>
              <div className="border-border flex items-center justify-between border-t pt-3">
                <span className="font-medium">{co.checkout10Total}</span>
                <span className="text-lg font-semibold">
                  {co.checkout10TotalValue}
                </span>
              </div>
            </div>
          </div>
          <div className="border-border bg-surface flex flex-col gap-5 rounded-3xl border p-6">
            <div className="flex items-center gap-2">
              <IconCreditCard
                size={18}
                className="text-muted"
                aria-hidden="true"
              />
              <Typography variant="h4">{co.checkout10PaymentTitle}</Typography>
            </div>
            <RadioGroup value={card} onValueChange={setCard} className="gap-3">
              {SAVED_CARDS.map((savedCard) => (
                <label
                  key={savedCard.value}
                  htmlFor={`checkout10-card-${savedCard.value}`}
                  className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                >
                  <RadioGroupItem
                    value={savedCard.value}
                    id={`checkout10-card-${savedCard.value}`}
                  />
                  <savedCard.icon
                    size={20}
                    className="text-muted"
                    aria-hidden="true"
                  />
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {co[savedCard.labelKey]}
                    </span>
                    <span className="text-muted text-xs">
                      {co[savedCard.expiryKey]}
                    </span>
                  </div>
                </label>
              ))}
            </RadioGroup>
            <Button variant="outline" className="w-full">
              <IconPlus size={16} aria-hidden="true" />
              {co.checkout10AddNew}
            </Button>
          </div>
        </div>
        <Button variant="primary" size="lg" className="w-full">
          {co.checkout10PlaceOrder}
        </Button>
      </div>
    </section>
  );
}
