"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/Collapsible";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Typography } from "@/components/ui/Typography";
import { IconChevronDown, IconShoppingBag } from "@tabler/icons-react";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCheckoutMessages } from "@/types/pages/checkout/CheckoutMessages-types";

interface Checkout3LineItem {
  id: string;
  nameKey: string;
  price: number;
  qty: number;
}

interface Checkout3AddressField {
  id: string;
  labelKey: string;
  placeholderKey: string;
  type?: string;
}

interface Checkout3Option {
  value: string;
  labelKey: string;
  descriptionKey: string;
}

const usd = (n: number) => `$${n.toFixed(2)}`;

const CART_ITEMS: Checkout3LineItem[] = [
  { id: "keyboard", nameKey: "checkout3Item1Name", price: 49, qty: 1 },
  { id: "hub", nameKey: "checkout3Item2Name", price: 24.5, qty: 2 },
  { id: "stand", nameKey: "checkout3Item3Name", price: 32, qty: 1 },
];

const SHIPPING = 4.99 as const;

const ADDRESS_FIELDS: Checkout3AddressField[] = [
  {
    id: "checkout3-full-name",
    labelKey: "checkout3FullNameLabel",
    placeholderKey: "checkout3FullNamePlaceholder",
  },
  {
    id: "checkout3-email",
    labelKey: "checkout3EmailLabel",
    placeholderKey: "checkout3EmailPlaceholder",
    type: "email",
  },
  {
    id: "checkout3-street",
    labelKey: "checkout3StreetLabel",
    placeholderKey: "checkout3StreetPlaceholder",
  },
  {
    id: "checkout3-city",
    labelKey: "checkout3CityLabel",
    placeholderKey: "checkout3CityPlaceholder",
  },
  {
    id: "checkout3-zip",
    labelKey: "checkout3ZipLabel",
    placeholderKey: "checkout3ZipPlaceholder",
  },
];

const SHIPPING_METHODS: Checkout3Option[] = [
  {
    value: "standard",
    labelKey: "checkout3StandardDeliveryLabel",
    descriptionKey: "checkout3StandardDeliveryDescription",
  },
  {
    value: "express",
    labelKey: "checkout3ExpressDeliveryLabel",
    descriptionKey: "checkout3ExpressDeliveryDescription",
  },
];

const PAYMENT_METHODS: Checkout3Option[] = [
  {
    value: "card",
    labelKey: "checkout3PaymentCardLabel",
    descriptionKey: "checkout3PaymentCardDescription",
  },
  {
    value: "paypal",
    labelKey: "checkout3PaymentPaypalLabel",
    descriptionKey: "checkout3PaymentPaypalDescription",
  },
  {
    value: "bank",
    labelKey: "checkout3PaymentBankLabel",
    descriptionKey: "checkout3PaymentBankDescription",
  },
];

const subtotal = CART_ITEMS.reduce(
  (sum, item) => sum + item.qty * item.price,
  0,
);
const total = subtotal + SHIPPING;

export function CollapsibleCartCheckout() {
  const t = useMessages("pages") as unknown as PagesWithCheckoutMessages;
  const co = t.checkout;

  const [cartOpen, setCartOpen] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {co.checkout3Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.checkout3Description}
          </Typography>
        </div>
        <div className="flex flex-col gap-6">
          <Collapsible
            open={cartOpen}
            onOpenChange={setCartOpen}
            className="bg-surface border-border overflow-hidden rounded-3xl border"
          >
            <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 px-6 py-5">
              <span className="text-fg flex items-center gap-2 text-sm font-medium">
                <IconShoppingBag className="size-4" aria-hidden="true" />
                {co.checkout3OrderSummaryTitle}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-muted hidden text-sm sm:inline">
                  {cartOpen
                    ? co.checkout3HideCartLabel
                    : co.checkout3ShowCartLabel}
                </span>
                <span className="text-fg text-sm font-semibold">
                  {usd(total)}
                </span>
                <IconChevronDown
                  className="text-muted size-4 transition-transform group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-border flex flex-col gap-4 border-t px-6 py-5">
                <div className="flex flex-col gap-3">
                  {CART_ITEMS.map((item) => (
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
                    <span className="text-muted">
                      {co.checkout3SubtotalLabel}
                    </span>
                    <span className="text-fg">{usd(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">
                      {co.checkout3ShippingLabel}
                    </span>
                    <span className="text-fg">{usd(SHIPPING)}</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold">
                    <span className="text-fg">{co.checkout3TotalLabel}</span>
                    <span className="text-fg">{usd(total)}</span>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          <Accordion
            type="single"
            collapsible
            defaultValue="address"
            className="w-full"
          >
            <AccordionItem value="address">
              <AccordionTrigger>
                {co.checkout3AddressStepTitle}
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
            <AccordionItem value="shipping">
              <AccordionTrigger>
                {co.checkout3ShippingStepTitle}
              </AccordionTrigger>
              <AccordionContent>
                <RadioGroup
                  value={shippingMethod}
                  onValueChange={setShippingMethod}
                  className="space-y-3"
                >
                  {SHIPPING_METHODS.map((m) => (
                    <label
                      key={m.value}
                      htmlFor={`checkout3-shipping-${m.value}`}
                      className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors"
                    >
                      <RadioGroupItem
                        value={m.value}
                        id={`checkout3-shipping-${m.value}`}
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
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="payment">
              <AccordionTrigger>
                {co.checkout3PaymentStepTitle}
              </AccordionTrigger>
              <AccordionContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.value}
                      htmlFor={`checkout3-payment-${m.value}`}
                      className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors"
                    >
                      <RadioGroupItem
                        value={m.value}
                        id={`checkout3-payment-${m.value}`}
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="flex justify-end">
            <Button className="w-full sm:w-auto">
              {co.checkout3PlaceOrderLabel}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
