"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";

const PAYMENT_METHODS = [
  {
    value: "card",
    label: "Credit / Debit Card",
    desc: "Visa, Mastercard, and American Express",
  },
  {
    value: "paypal",
    label: "PayPal",
    desc: "Pay securely using your PayPal balance",
  },
  {
    value: "bank",
    label: "Bank Transfer",
    desc: "Funds typically arrive in 1-2 business days",
  },
];

export function PaymentMethodTab() {
  const [method, setMethod] = useState("card");

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Payment Method</h3>
        <div className="surface max-w-sm space-y-4 p-4">
          <RadioGroup
            value={method}
            onValueChange={setMethod}
            className="space-y-3"
          >
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.value}
                htmlFor={`method-${m.value}`}
                className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
              >
                <RadioGroupItem
                  value={m.value}
                  id={`method-${m.value}`}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium">{m.label}</div>
                  <div className="text-muted text-xs">{m.desc}</div>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>
        <div className="bg-surface border-border flex max-w-sm items-center justify-between rounded border px-3 py-2">
          <span className="text-sm">
            Selected:{" "}
            <strong>
              {PAYMENT_METHODS.find((m) => m.value === method)?.label}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => setMethod("card")}
            className="text-muted hover:text-fg p-0.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}
