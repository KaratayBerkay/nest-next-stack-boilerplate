"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconBrandPaypal,
  IconBuildingBank,
  IconCreditCard,
  IconX,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCheckoutMessages } from "@/types/pages/checkout/CheckoutMessages-types";

interface Checkout4LineItem {
  id: string;
  nameKey: string;
  price: number;
  qty: number;
  imageSeed: string;
}

interface Checkout4PaymentMethod {
  value: string;
  labelKey: string;
  descriptionKey: string;
  icon: Icon;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const CART_ITEMS: Checkout4LineItem[] = [
  {
    id: "keyboard",
    nameKey: "checkout4Item1Name",
    price: 49,
    qty: 1,
    imageSeed: "checkout4-keyboard",
  },
  {
    id: "hub",
    nameKey: "checkout4Item2Name",
    price: 24.5,
    qty: 2,
    imageSeed: "checkout4-hub",
  },
  {
    id: "stand",
    nameKey: "checkout4Item3Name",
    price: 32,
    qty: 1,
    imageSeed: "checkout4-stand",
  },
];

const SHIPPING = 4.99 as const;

const PAYMENT_METHODS: Checkout4PaymentMethod[] = [
  {
    value: "card",
    labelKey: "checkout4PaymentCardLabel",
    descriptionKey: "checkout4PaymentCardDescription",
    icon: IconCreditCard,
  },
  {
    value: "paypal",
    labelKey: "checkout4PaymentPaypalLabel",
    descriptionKey: "checkout4PaymentPaypalDescription",
    icon: IconBrandPaypal,
  },
  {
    value: "bank",
    labelKey: "checkout4PaymentBankLabel",
    descriptionKey: "checkout4PaymentBankDescription",
    icon: IconBuildingBank,
  },
];

const subtotal = CART_ITEMS.reduce(
  (sum, item) => sum + item.qty * item.price,
  0,
);
const total = subtotal + SHIPPING;

export function CartReviewPayment() {
  const t = useMessages("pages") as unknown as PagesWithCheckoutMessages;
  const co = t.checkout;

  const [method, setMethod] = useState("card");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {co.checkout4Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.checkout4Description}
          </Typography>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="bg-surface border-border flex flex-col gap-5 rounded-3xl border p-6">
            <Typography variant="h3">{co.checkout4CartTitle}</Typography>
            <div className="flex flex-col gap-4">
              {CART_ITEMS.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="bg-surface-hover relative size-16 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={`https://picsum.photos/seed/${item.imageSeed}/96/96`}
                      alt={co[item.nameKey]}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-fg text-sm font-medium">
                      {co[item.nameKey]}
                    </span>
                    <span className="text-muted text-xs">
                      {co.checkout4QtyLabel} {item.qty}
                    </span>
                  </div>
                  <span className="text-fg text-sm font-medium">
                    {usd(item.qty * item.price)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={co.checkout4RemoveLabel}
                  >
                    <IconX size={16} aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">{co.checkout4SubtotalLabel}</span>
                <span className="text-fg">{usd(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{co.checkout4ShippingLabel}</span>
                <span className="text-fg">{usd(SHIPPING)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span className="text-fg">{co.checkout4TotalLabel}</span>
                <span className="text-fg">{usd(total)}</span>
              </div>
            </div>
          </div>
          <div className="bg-surface border-border flex h-fit flex-col gap-5 rounded-3xl border p-6">
            <Typography variant="h3">{co.checkout4PaymentTitle}</Typography>
            <RadioGroup
              value={method}
              onValueChange={setMethod}
              className="space-y-3"
            >
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  htmlFor={`checkout4-method-${m.value}`}
                  className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors"
                >
                  <RadioGroupItem
                    value={m.value}
                    id={`checkout4-method-${m.value}`}
                    className="mt-0.5"
                  />
                  <m.icon
                    className="text-muted mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {co[m.labelKey]}
                    </span>
                    <span className="text-muted text-xs">
                      {co[m.descriptionKey]}
                    </span>
                  </div>
                </label>
              ))}
            </RadioGroup>
            <Button className="w-full">
              {co.checkout4PayNowLabel} · {usd(total)}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
