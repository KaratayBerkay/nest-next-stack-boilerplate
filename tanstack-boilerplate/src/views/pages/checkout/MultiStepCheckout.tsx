"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  IconApple,
  IconBrandPaypal,
  IconCreditCard,
  IconShoppingBag,
  IconTruck,
  IconMapPin,
  IconWallet,
  IconClipboardCheck,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithCheckoutMessages } from "@/types/pages/checkout/CheckoutMessages-types";

interface OrderItem {
  nameKey: string;
  priceKey: string;
  qtyKey: string;
}

interface PaymentOption {
  value: string;
  labelKey: string;
  icon: Icon;
}

interface AddressField {
  id: string;
  labelKey: string;
  placeholderKey: string;
}

interface CheckoutStep {
  labelKey: string;
  icon: Icon;
}

const ORDER_ITEMS: OrderItem[] = [
  {
    nameKey: "checkout12Item1Name",
    qtyKey: "checkout12Item1Qty",
    priceKey: "checkout12Item1Price",
  },
  {
    nameKey: "checkout12Item2Name",
    qtyKey: "checkout12Item2Qty",
    priceKey: "checkout12Item2Price",
  },
  {
    nameKey: "checkout12Item3Name",
    qtyKey: "checkout12Item3Qty",
    priceKey: "checkout12Item3Price",
  },
];

const PAYMENT_OPTIONS: PaymentOption[] = [
  { value: "card", labelKey: "checkout12PaymentCard", icon: IconCreditCard },
  {
    value: "paypal",
    labelKey: "checkout12PaymentPaypal",
    icon: IconBrandPaypal,
  },
  {
    value: "apple-pay",
    labelKey: "checkout12PaymentApplePay",
    icon: IconApple,
  },
];

const ADDRESS_FIELDS: AddressField[] = [
  {
    id: "checkout12-full-name",
    labelKey: "checkout12FormNameLabel",
    placeholderKey: "checkout12FormNamePlaceholder",
  },
  {
    id: "checkout12-email",
    labelKey: "checkout12FormEmailLabel",
    placeholderKey: "checkout12FormEmailPlaceholder",
  },
  {
    id: "checkout12-address",
    labelKey: "checkout12FormAddressLabel",
    placeholderKey: "checkout12FormAddressPlaceholder",
  },
  {
    id: "checkout12-city",
    labelKey: "checkout12FormCityLabel",
    placeholderKey: "checkout12FormCityPlaceholder",
  },
  {
    id: "checkout12-zip",
    labelKey: "checkout12FormZipLabel",
    placeholderKey: "checkout12FormZipPlaceholder",
  },
];

const STEPS: CheckoutStep[] = [
  { labelKey: "checkout12Step1Label", icon: IconShoppingBag },
  { labelKey: "checkout12Step2Label", icon: IconMapPin },
  { labelKey: "checkout12Step3Label", icon: IconWallet },
  { labelKey: "checkout12Step4Label", icon: IconClipboardCheck },
];

function goToStep(setStep: Dispatch<SetStateAction<number>>, next: number) {
  setStep(next);
}

export function MultiStepCheckout() {
  const t = useMessages("pages") as unknown as PagesWithCheckoutMessages;
  const co = t.checkout;
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState("card");

  const isLastStep = step === STEPS.length - 1;
  const selectedMethod = PAYMENT_OPTIONS.find(
    (option) => option.value === method,
  );

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {co.checkout12Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {co.checkout12Description}
          </Typography>
        </div>
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((checkoutStep, index) => {
            const isActive = index === step;
            const isDone = index < step;
            return (
              <button
                key={checkoutStep.labelKey}
                type="button"
                onClick={goToStep.bind(null, setStep, index)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-brand bg-brand/10 text-brand"
                    : isDone
                      ? "text-fg border-border bg-surface"
                      : "text-muted border-border bg-transparent",
                )}
              >
                <checkoutStep.icon size={16} aria-hidden="true" />
                <span className="hidden sm:inline">
                  {index + 1} {co[checkoutStep.labelKey]}
                </span>
                <span className="sm:hidden">{index + 1}</span>
              </button>
            );
          })}
        </div>
        <div className="border-border bg-surface flex flex-col gap-6 rounded-3xl border p-6">
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <Typography variant="h4">{co.checkout12CartTitle}</Typography>
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{co.checkout12Subtotal}</span>
                <span>{co.checkout12SubtotalValue}</span>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <IconTruck
                  size={18}
                  className="text-muted"
                  aria-hidden="true"
                />
                <Typography variant="h4">
                  {co.checkout12ShippingTitle}
                </Typography>
              </div>
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
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <Typography variant="h4">{co.checkout12PaymentTitle}</Typography>
              <RadioGroup
                value={method}
                onValueChange={setMethod}
                className="gap-3"
              >
                {PAYMENT_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`checkout12-method-${option.value}`}
                    className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 border-border flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`checkout12-method-${option.value}`}
                    />
                    <option.icon
                      size={20}
                      className="text-muted"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium">
                      {co[option.labelKey]}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <Typography variant="h4">{co.checkout12ReviewTitle}</Typography>
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
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-muted">
                  {co.checkout12ReviewPayment}:{" "}
                  <span className="text-fg font-medium">
                    {
                      co[
                        selectedMethod?.labelKey ?? PAYMENT_OPTIONS[0].labelKey
                      ]
                    }
                  </span>
                </span>
                <span className="text-muted">
                  {co.checkout12ReviewShipping}:{" "}
                  <span className="text-fg font-medium">
                    {co.checkout12ShippingValue}
                  </span>
                </span>
              </div>
              <div className="border-border flex items-center justify-between border-t pt-3">
                <span className="font-medium">{co.checkout12Total}</span>
                <span className="text-lg font-semibold">
                  {co.checkout12TotalValue}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            disabled={step === 0}
            onClick={goToStep.bind(null, setStep, step - 1)}
          >
            {co.checkout12Back}
          </Button>
          <Button
            variant="primary"
            onClick={goToStep.bind(null, setStep, isLastStep ? step : step + 1)}
          >
            {isLastStep ? co.checkout12PlaceOrder : co.checkout12Next}
          </Button>
        </div>
      </div>
    </section>
  );
}
