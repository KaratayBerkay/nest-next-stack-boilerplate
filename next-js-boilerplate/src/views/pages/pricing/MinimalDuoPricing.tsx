"use client";

import { IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPricingMessages } from "@/types/pages/pricing/PricingMessages-types";

const SIGNUP_URL = "https://example.com/signup";

interface PlanDef {
  id: string;
  nameKey: string;
  taglineKey: string;
  priceKey: string;
  noteKey: string;
  ctaKey: string;
  featureKeys: string[];
  emphasized?: boolean;
}

const PLANS: PlanDef[] = [
  {
    id: "free",
    nameKey: "pricing6FreeName",
    taglineKey: "pricing6FreeTagline",
    priceKey: "pricing6FreePrice",
    noteKey: "pricing6FreeNote",
    ctaKey: "pricing6FreeCta",
    featureKeys: [
      "pricing6FreeFeature1",
      "pricing6FreeFeature2",
      "pricing6FreeFeature3",
    ],
  },
  {
    id: "pro",
    nameKey: "pricing6ProName",
    taglineKey: "pricing6ProTagline",
    priceKey: "pricing6ProPrice",
    noteKey: "pricing6ProNote",
    ctaKey: "pricing6ProCta",
    featureKeys: [
      "pricing6ProFeature1",
      "pricing6ProFeature2",
      "pricing6ProFeature3",
      "pricing6ProFeature4",
    ],
    emphasized: true,
  },
];

export function MinimalDuoPricing() {
  const t = useMessages("pages") as unknown as PagesWithPricingMessages;
  const p = t.pricing;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 lg:px-6">
        <div className="mx-auto mb-14 flex max-w-xl flex-col items-center gap-3 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-semibold tracking-tight lg:text-5xl"
          >
            {p.pricing6Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {p.pricing6Description}
          </Typography>
        </div>
        <div className="divide-border grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col items-center gap-6 px-6 py-8 text-center sm:px-10"
            >
              <div className="flex flex-col items-center gap-1.5">
                <Typography variant="h4">{p[plan.nameKey]}</Typography>
                <Typography variant="bodySmall" className="text-muted">
                  {p[plan.taglineKey]}
                </Typography>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-fg text-5xl font-semibold tracking-tight">
                  {p[plan.priceKey]}
                </span>
                <span className="text-muted text-xs">{p[plan.noteKey]}</span>
              </div>
              <ul className="flex w-full max-w-[220px] flex-col gap-2.5 text-left">
                {plan.featureKeys.map((featureKey) => (
                  <li
                    key={featureKey}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <IconCheck
                      size={16}
                      className="text-brand mt-0.5 shrink-0"
                    />
                    <span className="text-fg">{p[featureKey]}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={plan.emphasized ? "primary" : "outline"}
                className="w-full max-w-[220px]"
              >
                <a href={SIGNUP_URL}>{p[plan.ctaKey]}</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
