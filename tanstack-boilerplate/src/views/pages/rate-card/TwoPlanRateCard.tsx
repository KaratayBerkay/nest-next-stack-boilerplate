"use client";

import { IconCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithRateCardMessages } from "@/types/pages/rate-card/RateCardMessages-types";

interface RatePlan {
  id: "standard" | "priority";
  highlighted: boolean;
  badgeKey?: string;
  nameKey: string;
  descriptionKey: string;
  priceKey: string;
  unitKey: string;
  featureKeys: string[];
  ctaKey: string;
}

const PLANS: RatePlan[] = [
  {
    id: "standard",
    highlighted: false,
    nameKey: "rateCard2PlanStandardName",
    descriptionKey: "rateCard2PlanStandardDescription",
    priceKey: "rateCard2PlanStandardPrice",
    unitKey: "rateCard2PlanStandardUnit",
    featureKeys: [
      "rateCard2PlanStandardFeature1",
      "rateCard2PlanStandardFeature2",
      "rateCard2PlanStandardFeature3",
      "rateCard2PlanStandardFeature4",
    ],
    ctaKey: "rateCard2PlanStandardCta",
  },
  {
    id: "priority",
    highlighted: true,
    badgeKey: "rateCard2PlanPriorityBadge",
    nameKey: "rateCard2PlanPriorityName",
    descriptionKey: "rateCard2PlanPriorityDescription",
    priceKey: "rateCard2PlanPriorityPrice",
    unitKey: "rateCard2PlanPriorityUnit",
    featureKeys: [
      "rateCard2PlanPriorityFeature1",
      "rateCard2PlanPriorityFeature2",
      "rateCard2PlanPriorityFeature3",
      "rateCard2PlanPriorityFeature4",
    ],
    ctaKey: "rateCard2PlanPriorityCta",
  },
];

export function TwoPlanRateCard() {
  const t = useMessages("pages") as unknown as PagesWithRateCardMessages;
  const r = t.rateCard;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wider uppercase">
            {r.rateCard2Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight md:text-4xl">
            {r.rateCard2Heading}
          </h2>
          <p className="text-muted text-base leading-relaxed">
            {r.rateCard2Subheading}
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "border-border bg-surface flex flex-col gap-6 rounded-3xl border p-6 lg:p-8",
                plan.highlighted && "border-brand ring-brand/20 ring-2",
              )}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-fg text-lg font-semibold tracking-tight">
                    {r[plan.nameKey]}
                  </h3>
                  {plan.badgeKey && (
                    <Badge variant="soft" size="sm">
                      {r[plan.badgeKey]}
                    </Badge>
                  )}
                </div>
                <p className="text-muted text-sm leading-relaxed">
                  {r[plan.descriptionKey]}
                </p>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-fg text-4xl font-semibold tracking-tight">
                  {r[plan.priceKey]}
                </span>
                <span className="text-muted text-base">
                  {r[plan.unitKey]}
                </span>
              </div>

              <ul className="flex flex-col gap-2.5">
                {plan.featureKeys.map((key) => (
                  <li key={key} className="flex items-start gap-2.5">
                    <IconCheck
                      size={16}
                      className="text-brand mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-fg text-sm">{r[key]}</span>
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                variant={plan.highlighted ? "primary" : "outline"}
                size="lg"
                className="mt-auto w-full"
              >
                {r[plan.ctaKey]}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3">
          <p className="text-muted text-sm">{r.rateCard2FootnoteText}</p>
          <Button type="button" variant="link" size="sm">
            {r.rateCard2FootnoteCta}
          </Button>
        </div>
      </div>
    </section>
  );
}
