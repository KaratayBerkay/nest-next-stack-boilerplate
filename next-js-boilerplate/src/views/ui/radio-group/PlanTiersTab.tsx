"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";

const PLAN_TIERS = [
  {
    value: "free",
    label: "Free",
    price: "$0/mo",
    desc: "For hobby projects",
  },
  {
    value: "pro",
    label: "Pro",
    price: "$19/mo",
    desc: "For growing teams",
  },
  {
    value: "enterprise",
    label: "Enterprise",
    price: "Custom",
    desc: "For large organizations",
  },
];

export function PlanTiersTab() {
  const [plan, setPlan] = useState("pro");

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Plan Tiers</h3>
        <div className="surface max-w-sm space-y-4 p-4">
          <RadioGroup
            value={plan}
            onValueChange={setPlan}
            className="space-y-3"
          >
            {PLAN_TIERS.map((p) => (
              <label
                key={p.value}
                htmlFor={`plan-${p.value}`}
                className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
              >
                <RadioGroupItem
                  value={p.value}
                  id={`plan-${p.value}`}
                  className="mt-0.5"
                />
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{p.label}</div>
                    <div className="text-muted text-xs">{p.desc}</div>
                  </div>
                  <div className="text-sm font-medium">{p.price}</div>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>
        <div className="bg-surface border-border flex max-w-sm items-center justify-between rounded border px-3 py-2">
          <span className="text-sm">
            Selected plan:{" "}
            <strong>{PLAN_TIERS.find((p) => p.value === plan)?.label}</strong>
          </span>
          <button
            type="button"
            onClick={() => setPlan("pro")}
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
