"use client";

import { useState } from "react";
import {
  IconApple,
  IconBrandPaypal,
  IconCreditCard,
  IconShoppingBag,
  IconTruck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCheckoutMessages } from "@/types/pages/checkout/CheckoutMessages-types";

interface OrderItem {
  nameKey: string;
  qtyKey: string;
  priceKey: string;
}

interface PaymentOption {
  value: string;
  labelKey: string;
  descKey: string;
  icon: Icon;
}

interface AddressField {
  id: string;
  labelKey: string;
  placeholderKey: string;
}

const ORDER_ITEMS: OrderItem[] = [
  {
    nameKey: "checkout8Item1Name",
    qtyKey: "checkout8Item1Qty",
    priceKey: "checkout8Item1Price",
  },
  {
    nameKey: "checkout8Item2Name",
    qtyKey: "checkout8Item2Qty",
    priceKey: "checkout8Item2Price",
  },
  {
    nameKey: "checkout8Item3Name",
    qtyKey: "checkout8Item3Qty",
    priceKey: "checkout8Item3Price",
  },
];

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    value: "card",
    labelKey: "checkout8PaymentCard",
    descKey: "checkout8PaymentCardDesc",
    icon: IconCreditCard,
  },
  {
    value: "paypal",
    labelKey: "checkout8PaymentPaypal",
    descKey: "checkout8PaymentPaypalDesc",
    icon: IconBrandPaypal,
  },
  {
    value: "apple-pay",
    labelKey: "checkout8PaymentApplePay",
    descKey: "checkout8PaymentApplePayDesc",
    icon: IconApple,
  },
];

const ADDRESS_FIELDS: AddressField[] = [
  {
    id: "checkout8-full-name",
    labelKey: "checkout8FormNameLabel",
    placeholderKey: "checkout8FormNamePlaceholder",
  },
  {
    id: "checkout8-email",
    labelKey: "checkout8FormEmailLabel",
    placeholderKey: "checkout8FormEmailPlaceholder",
  },
  {
    id: "checkout8-address",
    labelKey: "checkout8FormAddressLabel",
    placeholderKey: "checkout8FormAddressPlaceholder",
  },
  {
    id: "checkout8-city",
    labelKey: "checkout8FormCityLabel",
    placeholderKey: "checkout8FormCityPlaceholder",
  },
  {
    id: "checkout8-zip",
    labelKey: "checkout8FormZipLabel",
    placeholderKey: "checkout8FormZipPlaceholder",
  },
];

export function AccordionFullCheckout() {
  const t = useMessages("pages") as unknown as PagesWithCheckoutMessages;
  const co = t.checkout;
  const [method, setMethod] = useState("card");

  const selectedMethod = PAYMENT_OPTIONS.find(
    (option) => option.value === method,
  );

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {co.checkout8Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.checkout8Description}
          </Typography>
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <Accordion
            type="single"
            collapsible
            defaultValue="cart"
            className="flex w-full flex-col gap-4 lg:col-span-3"
          >
            <AccordionItem value="cart" className="rounded-2xl">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <IconShoppingBag size={16} aria-hidden="true" />
                  {co.checkout8StepCart}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-col">
                  {ORDER_ITEMS.map((item) => (
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
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping" className="rounded-2xl">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <IconTruck size={16} aria-hidden="true" />
                  {co.checkout8StepShipping}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {ADDRESS_FIELDS.map((field) => (
                    <div key={field.id} className="flex flex-col gap-1.5">
                      <Label htmlFor={field.id}>{co[field.labelKey]}</Label>
                      <Input
                        id={field.id}
                        placeholder={co[field.placeholderKey]}
                      />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="payment" className="rounded-2xl">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <IconCreditCard size={16} aria-hidden="true" />
                  {co.checkout8StepPayment}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <RadioGroup
                  value={method}
                  onValueChange={setMethod}
                  className="gap-3"
                >
                  {PAYMENT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      htmlFor={`checkout8-method-${option.value}`}
                      className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`checkout8-method-${option.value}`}
                      />
                      <option.icon
                        size={20}
                        className="text-muted"
                        aria-hidden="true"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {co[option.labelKey]}
                        </span>
                        <span className="text-muted text-xs">
                          {co[option.descKey]}
                        </span>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="review" className="rounded-2xl">
              <AccordionTrigger>{co.checkout8StepReview}</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4">
                  <ul className="flex flex-col">
                    {ORDER_ITEMS.map((item) => (
                      <li
                        key={item.nameKey}
                        className="border-border flex items-center justify-between gap-4 border-b py-3"
                      >
                        <span className="text-sm font-medium">
                          {co[item.nameKey]}
                        </span>
                        <span className="text-sm">{co[item.priceKey]}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="text-muted">
                      {co.checkout8ReviewPayment}:{" "}
                      <span className="text-fg font-medium">
                        {
                          co[
                            selectedMethod?.labelKey ??
                              PAYMENT_OPTIONS[0].labelKey
                          ]
                        }
                      </span>
                    </span>
                    <span className="text-muted">
                      {co.checkout8ReviewShipping}:{" "}
                      <span className="text-fg font-medium">
                        {co.checkout8ShippingValue}
                      </span>
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <aside className="border-border bg-surface flex h-fit flex-col gap-5 rounded-3xl border p-6 lg:sticky lg:top-6 lg:col-span-2">
            <Typography variant="h4">
              {co.checkout8OrderSummaryTitle}
            </Typography>
            <ul className="flex flex-col">
              {ORDER_ITEMS.map((item) => (
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
                <span className="text-muted">{co.checkout8Subtotal}</span>
                <span>{co.checkout8SubtotalValue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{co.checkout8Shipping}</span>
                <span>{co.checkout8ShippingValue}</span>
              </div>
              <div className="border-border flex items-center justify-between border-t pt-3">
                <span className="font-medium">{co.checkout8Total}</span>
                <span className="text-lg font-semibold">
                  {co.checkout8TotalValue}
                </span>
              </div>
            </div>
            <Button variant="primary" size="lg" className="w-full">
              {co.checkout8PlaceOrder}
            </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}
