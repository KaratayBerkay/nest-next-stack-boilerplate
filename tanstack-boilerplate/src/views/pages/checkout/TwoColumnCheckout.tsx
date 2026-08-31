"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCheckoutMessages } from "@/types/pages/checkout/CheckoutMessages-types";

interface Checkout2LineItem {
  id: string;
  nameKey: string;
  price: number;
  qty: number;
}

interface Checkout2AddressField {
  id: string;
  labelKey: string;
  placeholderKey: string;
  type?: string;
}

interface Checkout2PaymentMethod {
  value: string;
  labelKey: string;
  descriptionKey: string;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const INITIAL_ITEMS: Checkout2LineItem[] = [
  { id: "keyboard", nameKey: "checkout2Item1Name", price: 49, qty: 1 },
  { id: "hub", nameKey: "checkout2Item2Name", price: 24.5, qty: 2 },
  { id: "stand", nameKey: "checkout2Item3Name", price: 32, qty: 1 },
];

const SHIPPING = 4.99 as const;

const ADDRESS_FIELDS: Checkout2AddressField[] = [
  {
    id: "checkout2-full-name",
    labelKey: "checkout2FullNameLabel",
    placeholderKey: "checkout2FullNamePlaceholder",
  },
  {
    id: "checkout2-email",
    labelKey: "checkout2EmailLabel",
    placeholderKey: "checkout2EmailPlaceholder",
    type: "email",
  },
  {
    id: "checkout2-street",
    labelKey: "checkout2StreetLabel",
    placeholderKey: "checkout2StreetPlaceholder",
  },
  {
    id: "checkout2-city",
    labelKey: "checkout2CityLabel",
    placeholderKey: "checkout2CityPlaceholder",
  },
  {
    id: "checkout2-zip",
    labelKey: "checkout2ZipLabel",
    placeholderKey: "checkout2ZipPlaceholder",
  },
];

const PAYMENT_METHODS: Checkout2PaymentMethod[] = [
  {
    value: "card",
    labelKey: "checkout2PaymentCardLabel",
    descriptionKey: "checkout2PaymentCardDescription",
  },
  {
    value: "paypal",
    labelKey: "checkout2PaymentPaypalLabel",
    descriptionKey: "checkout2PaymentPaypalDescription",
  },
  {
    value: "apple-pay",
    labelKey: "checkout2PaymentApplePayLabel",
    descriptionKey: "checkout2PaymentApplePayDescription",
  },
];

function updateQty(
  id: string,
  qty: number,
  setItems: Dispatch<SetStateAction<Checkout2LineItem[]>>,
) {
  setItems((prev) =>
    prev.map((item) => (item.id === id ? { ...item, qty } : item)),
  );
}

export function TwoColumnCheckout() {
  const t = useMessages("pages") as unknown as PagesWithCheckoutMessages;
  const co = t.checkout;

  const [items, setItems] = useState<Checkout2LineItem[]>(INITIAL_ITEMS);
  const [method, setMethod] = useState("card");

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const total = subtotal + SHIPPING;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {co.checkout2Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.checkout2Description}
          </Typography>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="bg-surface border-border flex flex-col gap-5 rounded-3xl border p-6">
              <Typography variant="h3">{co.checkout2AddressTitle}</Typography>
              <div className="grid gap-4 sm:grid-cols-2">
                {ADDRESS_FIELDS.map((field) => (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <Label htmlFor={field.id}>{co[field.labelKey]}</Label>
                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={co[field.placeholderKey]}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-surface border-border flex flex-col gap-5 rounded-3xl border p-6">
              <Typography variant="h3">{co.checkout2PaymentTitle}</Typography>
              <RadioGroup
                value={method}
                onValueChange={setMethod}
                className="space-y-3"
              >
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.value}
                    htmlFor={`checkout2-method-${m.value}`}
                    className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors"
                  >
                    <RadioGroupItem
                      value={m.value}
                      id={`checkout2-method-${m.value}`}
                      className="mt-0.5"
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
            </div>
          </div>
          <div className="bg-surface border-border flex h-fit flex-col gap-5 rounded-3xl border p-6">
            <Typography variant="h3">{co.checkout2SummaryTitle}</Typography>
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="text-fg text-sm font-medium">
                      {co[item.nameKey]}
                    </span>
                    <span className="text-muted text-xs">
                      {usd(item.price)}
                    </span>
                  </div>
                  <Counter
                    label={co[item.nameKey]}
                    value={item.qty}
                    min={1}
                    onChange={(qty) => updateQty(item.id, qty, setItems)}
                  />
                </div>
              ))}
            </div>
            <div className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">{co.checkout2SubtotalLabel}</span>
                <span className="text-fg">{usd(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{co.checkout2ShippingLabel}</span>
                <span className="text-fg">{usd(SHIPPING)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span className="text-fg">{co.checkout2TotalLabel}</span>
                <span className="text-fg">{usd(total)}</span>
              </div>
            </div>
            <Button variant="primary" className="w-full">
              {co.checkout2PlaceOrderLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
