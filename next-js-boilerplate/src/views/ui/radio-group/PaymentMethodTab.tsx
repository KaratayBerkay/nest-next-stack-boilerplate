"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";

export function PaymentMethodTab() {
  const [plan, setPlan] = useState("pro");

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <RadioGroup value={plan} onValueChange={setPlan}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="a" id="a" />
            <label htmlFor="a">Option A</label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="b" id="b" />
            <label htmlFor="b">Option B</label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="c" id="c" />
            <label htmlFor="c">Option C</label>
          </div>
        </RadioGroup>
        <div className="bg-surface border-border flex items-center justify-between rounded border px-3 py-2">
          <span className="text-sm">
            Selected: <strong>{plan.toUpperCase()}</strong>
          </span>
          <button
            type="button"
            onClick={() => setPlan("a")}
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
