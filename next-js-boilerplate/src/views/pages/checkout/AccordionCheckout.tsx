"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCheckoutMessages } from "@/types/pages/checkout/CheckoutMessages-types";

interface Checkout1LineItem {
  id: string;
  nameKey: string;
  price: number;
  qty: number;
}

interface Checkout1AddressField {
  id: string;
  labelKey: string;
  placeholderKey: string;
  type?: string;
}

interface Checkout1PaymentMethod {
  value: string;
  labelKey: string;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const INITIAL_ITEMS: Checkout1LineItem[] = [
  { id: "keyboard", nameKey: "checkout1Item1Name", price: 49, qty: 1 },
  { id: "hub", nameKey: "checkout1Item2Name", price: 24.5, qty: 2 },
  { id: "stand", nameKey: "checkout1Item3Name", price: 32, qty: 1 },
];

const SHIPPING = 4.99 as const;

const ADDRESS_FIELDS: Checkout1AddressField[] = [
  {
    id: "checkout1-full-name",
    labelKey: "checkout1FullNameLabel",
    placeholderKey: "checkout1FullNamePlaceholder",
  },
  {
    id: "checkout1-email",
    labelKey: "checkout1EmailLabel",
    placeholderKey: "checkout1EmailPlaceholder",
    type: "email",
  },
  {
    id: "checkout1-street",
    labelKey: "checkout1StreetLabel",
    placeholderKey: "checkout1StreetPlaceholder",
  },
  {
    id: "checkout1-city",
    labelKey: "checkout1CityLabel",
    placeholderKey: "checkout1CityPlaceholder",
  },
  {
    id: "checkout1-zip",
    labelKey: "checkout1ZipLabel",
    placeholderKey: "checkout1ZipPlaceholder",
  },
];

const PAYMENT_METHODS: Checkout1PaymentMethod[] = [
  { value: "card", labelKey: "checkout1PaymentCardLabel" },
  { value: "paypal", labelKey: "checkout1PaymentPaypalLabel" },
  { value: "apple-pay", labelKey: "checkout1PaymentApplePayLabel" },
];

function updateQty(
  id: string,
  qty: number,
  setItems: Dispatch<SetStateAction<Checkout1LineItem[]>>,
) {
  setItems((prev) =>
    prev.map((item) => (item.id === id ? { ...item, qty } : item)),
  );
}

export function AccordionCheckout() {
  const t = useMessages("pages") as unknown as PagesWithCheckoutMessages;
  const co = t.checkout;

  const [items, setItems] = useState<Checkout1LineItem[]>(INITIAL_ITEMS);
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
            {co.checkout1Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.checkout1Description}
          </Typography>
        </div>
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-3">
            <Accordion
              type="single"
              collapsible
              defaultValue="cart"
              className="w-full"
            >
              <AccordionItem value="cart">
                <AccordionTrigger>{co.checkout1CartStepTitle}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="flex flex-col">
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
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="address">
                <AccordionTrigger>
                  {co.checkout1AddressStepTitle}
                </AccordionTrigger>
                <AccordionContent>
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
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="payment">
                <AccordionTrigger>
                  {co.checkout1PaymentStepTitle}
                </AccordionTrigger>
                <AccordionContent>
                  <RadioGroup
                    value={method}
                    onValueChange={setMethod}
                    className="space-y-3"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <label
                        key={m.value}
                        htmlFor={`checkout1-method-${m.value}`}
                        className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors"
                      >
                        <RadioGroupItem
                          value={m.value}
                          id={`checkout1-method-${m.value}`}
                        />
                        <span className="text-sm font-medium">
                          {co[m.labelKey]}
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div className="bg-surface border-border flex h-fit flex-col gap-5 rounded-3xl border p-6 lg:col-span-2">
            <Typography variant="h3">{co.checkout1SummaryTitle}</Typography>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-fg">
                    {co[item.nameKey]}
                    <span className="text-muted"> × {item.qty}</span>
                  </span>
                  <span className="text-muted">
                    {usd(item.qty * item.price)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-border flex flex-col gap-2 border-t pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">{co.checkout1SubtotalLabel}</span>
                <span className="text-fg">{usd(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{co.checkout1ShippingLabel}</span>
                <span className="text-fg">{usd(SHIPPING)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span className="text-fg">{co.checkout1TotalLabel}</span>
                <span className="text-fg">{usd(total)}</span>
              </div>
            </div>
            <Button className="w-full">{co.checkout1PlaceOrderLabel}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
