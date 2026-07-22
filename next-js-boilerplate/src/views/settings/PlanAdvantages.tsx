"use client";

import type { PlanAdvantagesProps } from "@/types/settings/PlanAdvantages-types";

export default function PlanAdvantages({ tier, features }: PlanAdvantagesProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">Plan Advantages</h3>
      <ul className="flex flex-col gap-2">
        {features[tier].map((f) => (
          <li
            key={f}
            className="border-border bg-surface flex items-center gap-2 rounded-lg border p-3 text-sm"
          >
            <span className="text-brand flex size-5 items-center justify-center rounded-full bg-green-100 text-xs font-bold">
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
