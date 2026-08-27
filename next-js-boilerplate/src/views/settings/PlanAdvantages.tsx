"use client";

import { Card } from "@/components/ui/card";
import type { PlanAdvantagesProps } from "@/types/settings/PlanAdvantages-types";

export default function PlanAdvantages({
  tier,
  features,
}: PlanAdvantagesProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">Plan Advantages</h3>
      <ul className="flex flex-col gap-2">
        {features[tier].map((f) => (
          <li key={f}>
            <Card
              variant="surface"
              className="flex items-center gap-2 p-3 text-sm"
            >
              <span className="text-success bg-success/15 flex size-5 items-center justify-center rounded-full text-xs font-bold">
                ✓
              </span>
              {f}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
