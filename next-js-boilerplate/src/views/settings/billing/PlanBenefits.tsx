"use client";

import { TIER_FEATURES } from "@/lib/checkout/tier-features";
import { TIERS } from "@/lib/tier";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PlanBenefitsProps } from "@/types/billing/PlanBenefits-types";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-5 w-5 shrink-0 text-green-500", className)}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("text-muted h-5 w-5 shrink-0", className)}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export function PlanBenefits({ currentTier, className }: PlanBenefitsProps) {
  const t = useMessages("settings");
  const currentTierIndex = TIERS.indexOf(currentTier);

  const allBenefits: { feature: string; included: boolean }[] = [];

  for (let i = 1; i <= currentTierIndex; i++) {
    const tier = TIERS[i];
    const features = TIER_FEATURES[tier] ?? [];
    for (const feature of features) {
      if (!allBenefits.some((b) => b.feature === feature)) {
        allBenefits.push({ feature, included: true });
      }
    }
  }

  const nextTierIndex = currentTierIndex + 1;
  if (nextTierIndex < TIERS.length) {
    const nextTier = TIERS[nextTierIndex];
    const nextFeatures = TIER_FEATURES[nextTier] ?? [];
    for (const feature of nextFeatures) {
      if (!allBenefits.some((b) => b.feature === feature)) {
        allBenefits.push({ feature, included: false });
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h3 className="text-sm font-medium">{t.planBenefits}</h3>
      <ul className="flex flex-col gap-2.5">
        {allBenefits.map(({ feature, included }) => (
          <li key={feature} className="flex items-center gap-2.5">
            {included ? <CheckIcon /> : <XIcon />}
            <span
              className={cn("text-sm", !included && "text-muted line-through")}
            >
              {feature}
            </span>
          </li>
        ))}
        {allBenefits.length === 0 && (
          <li className="text-muted text-sm">
            {t.planBenefitsEmpty || "No benefits available for this tier."}
          </li>
        )}
      </ul>
    </div>
  );
}
