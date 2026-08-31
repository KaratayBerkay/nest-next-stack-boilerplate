"use client";

import { useState } from "react";
import { IconBuilding, IconUser, IconUsers } from "@tabler/icons-react";
import { CheckboxCard } from "@/components/ui/Checkbox";

export function PlanCardsTab() {
  const [selected, setSelected] = useState<string>("standard");

  const plans = [
    {
      value: "basic",
      title: "Basic",
      description: "For individuals",
      Icon: IconUser,
    },
    {
      value: "standard",
      title: "Standard",
      description: "For teams",
      Icon: IconUsers,
    },
    {
      value: "premium",
      title: "Premium",
      description: "For enterprises",
      Icon: IconBuilding,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted text-xs">
        Select a plan (radio-like single select via CheckboxCard).
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-3">
        {plans.map((plan) => (
          <CheckboxCard
            key={plan.value}
            icon={
              <span className="bg-surface-hover flex size-9 items-center justify-center rounded-md">
                <plan.Icon className="size-5" aria-hidden="true" />
              </span>
            }
            title={plan.title}
            description={plan.description}
            checked={selected === plan.value}
            onChange={(checked) => {
              if (checked) setSelected(plan.value);
            }}
          />
        ))}
      </div>
      <p className="text-fg text-sm">Selected: {selected}</p>
    </div>
  );
}
