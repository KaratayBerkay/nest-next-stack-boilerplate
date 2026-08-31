"use client";

import { useTierFeatures } from "@/lib/checkout/tier-features";
import { TIERS } from "@/lib/tier";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PlanBenefitsProps } from "@/types/billing/PlanBenefits-types";
import type { ClassNameProps } from "@/types/ui/ClassName-types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

function CheckIcon({ className }: ClassNameProps) {
  return (
    <svg
      className={cn("text-success h-5 w-5 shrink-0", className)}
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

function XIcon({ className }: ClassNameProps) {
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
  const tierFeatures = useTierFeatures();
  const currentTierIndex = TIERS.indexOf(currentTier);

  const allBenefits: { feature: string; included: boolean }[] = [];

  for (let i = 1; i <= currentTierIndex; i++) {
    const tier = TIERS[i];
    const features = tierFeatures[tier] ?? [];
    for (const feature of features) {
      if (!allBenefits.some((b) => b.feature === feature)) {
        allBenefits.push({ feature, included: true });
      }
    }
  }

  const nextTierIndex = currentTierIndex + 1;
  if (nextTierIndex < TIERS.length) {
    const nextTier = TIERS[nextTierIndex];
    // Every tier above FREE starts its feature list with a self-referential
    // "Everything in {current tier}" line (see pricing/messages.json) —
    // showing that as a crossed-out, "not included" item is nonsensical
    // (the user already has everything in their own tier by definition), so
    // skip the next tier's own first entry.
    const nextFeatures = (tierFeatures[nextTier] ?? []).slice(1);
    for (const feature of nextFeatures) {
      if (!allBenefits.some((b) => b.feature === feature)) {
        allBenefits.push({ feature, included: false });
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Collapsed by default: no defaultValue passed to the Accordion. */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="plan-benefits">
          <AccordionTrigger value="plan-benefits">
            <span className="text-sm font-medium">{t.planBenefits}</span>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex flex-col gap-2.5">
              {allBenefits.map(({ feature, included }) => (
                <li key={feature} className="flex items-center gap-2.5">
                  {included ? <CheckIcon /> : <XIcon />}
                  <span
                    className={cn(
                      "text-sm",
                      !included && "text-muted line-through",
                    )}
                  >
                    {feature}
                  </span>
                </li>
              ))}
              {allBenefits.length === 0 && (
                <li className="text-muted text-sm">
                  {t.planBenefitsEmpty ||
                    "No benefits available for this tier."}
                </li>
              )}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
