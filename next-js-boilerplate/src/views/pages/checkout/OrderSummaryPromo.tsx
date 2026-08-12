"use client";

import { useState } from "react";
import {
  IconApple,
  IconBrandPaypal,
  IconCreditCard,
  IconShoppingBag,
  IconTag,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

const ORDER_ITEMS: OrderItem[] = [
  {
    nameKey: "checkout5Item1Name",
    qtyKey: "checkout5Item1Qty",
    priceKey: "checkout5Item1Price",
  },
  {
    nameKey: "checkout5Item2Name",
    qtyKey: "checkout5Item2Qty",
    priceKey: "checkout5Item2Price",
  },
  {
    nameKey: "checkout5Item3Name",
    qtyKey: "checkout5Item3Qty",
    priceKey: "checkout5Item3Price",
  },
];

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    value: "card",
    labelKey: "checkout5PaymentCard",
    descKey: "checkout5PaymentCardDesc",
    icon: IconCreditCard,
  },
  {
    value: "paypal",
    labelKey: "checkout5PaymentPaypal",
    descKey: "checkout5PaymentPaypalDesc",
    icon: IconBrandPaypal,
  },
  {
    value: "apple-pay",
    labelKey: "checkout5PaymentApplePay",
    descKey: "checkout5PaymentApplePayDesc",
    icon: IconApple,
  },
];

export function OrderSummaryPromo() {
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
            {co.checkout5Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.checkout5Description}
          </Typography>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border-border bg-surface flex flex-col gap-6 rounded-3xl border p-6">
            <div className="flex items-center gap-2">
              <IconShoppingBag
                size={18}
                className="text-muted"
                aria-hidden="true"
              />
              <Typography variant="h4">
                {co.checkout5OrderSummaryTitle}
              </Typography>
            </div>
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
                <span className="text-muted">{co.checkout5Subtotal}</span>
                <span>{co.checkout5SubtotalValue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{co.checkout5Shipping}</span>
                <span>{co.checkout5ShippingValue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">{co.checkout5Discount}</span>
                <span className="text-brand">{co.checkout5DiscountValue}</span>
              </div>
              <div className="border-border flex items-center justify-between border-t pt-3">
                <span className="font-medium">{co.checkout5Total}</span>
                <span className="text-lg font-semibold">
                  {co.checkout5TotalValue}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={co.checkout5PromoPlaceholder}
                leftIcon={<IconTag size={16} aria-hidden="true" />}
              />
              <Button variant="outline">{co.checkout5PromoApply}</Button>
            </div>
          </div>
          <div className="border-border bg-surface flex flex-col gap-6 rounded-3xl border p-6">
            <div className="flex flex-col gap-1">
              <Typography variant="h4">{co.checkout5PaymentTitle}</Typography>
              <Typography variant="caption">
                {co.checkout5PaymentSubtitle}
              </Typography>
            </div>
            <RadioGroup
              value={method}
              onValueChange={setMethod}
              className="gap-3"
            >
              {PAYMENT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`checkout5-method-${option.value}`}
                  className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`checkout5-method-${option.value}`}
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
            <Button size="lg" className="mt-auto w-full">
              {co.checkout5PlaceOrder}
              <span>{co.checkout5TotalValue}</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
