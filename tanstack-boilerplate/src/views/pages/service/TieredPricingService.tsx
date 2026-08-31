"use client";

import { IconCheck, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithServiceMessages } from "@/types/pages/service/ServiceMessages-types";

interface PricingTier {
  id: string;
  nameKey: string;
  priceKey: string;
  periodKey: string;
  descriptionKey: string;
  featureKeys: readonly [string, string, string];
  ctaKey: string;
  badgeKey?: string;
  featured?: boolean;
}

const TIERS: PricingTier[] = [
  {
    id: "starter",
    nameKey: "service4Tier1Name",
    priceKey: "service4Tier1Price",
    periodKey: "service4Tier1Period",
    descriptionKey: "service4Tier1Description",
    featureKeys: ["service4Tier1Feature1", "service4Tier1Feature2", "service4Tier1Feature3"],
    ctaKey: "service4Tier1Cta",
  },
  {
    id: "growth",
    nameKey: "service4Tier2Name",
    priceKey: "service4Tier2Price",
    periodKey: "service4Tier2Period",
    descriptionKey: "service4Tier2Description",
    featureKeys: ["service4Tier2Feature1", "service4Tier2Feature2", "service4Tier2Feature3"],
    ctaKey: "service4Tier2Cta",
    badgeKey: "service4Tier2Badge",
    featured: true,
  },
  {
    id: "enterprise",
    nameKey: "service4Tier3Name",
    priceKey: "service4Tier3Price",
    periodKey: "service4Tier3Period",
    descriptionKey: "service4Tier3Description",
    featureKeys: ["service4Tier3Feature1", "service4Tier3Feature2", "service4Tier3Feature3"],
    ctaKey: "service4Tier3Cta",
  },
];

export function TieredPricingService() {
  const t = useMessages("pages") as unknown as PagesWithServiceMessages;
  const s = t.service;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="soft" size="sm" className="w-fit">
            <IconTrendingUp size={14} className="mr-1.5" aria-hidden="true" />
            {s.service4Eyebrow}
          </Badge>
          <h2 className="text-fg max-w-2xl text-3xl font-semibold tracking-tight lg:text-4xl">
            {s.service4Heading}
          </h2>
          <p className="text-muted max-w-xl">{s.service4Intro}</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <Card
              key={tier.id}
              variant={tier.featured ? "elevated" : "default"}
              className={tier.featured ? "ring-brand relative ring-2" : "relative"}
            >
              {tier.badgeKey && (
                <Badge
                  variant="default"
                  size="sm"
                  className="absolute -top-3 left-1/2 w-fit -translate-x-1/2"
                >
                  {s[tier.badgeKey]}
                </Badge>
              )}
              <CardHeader>
                <span className="text-fg text-base font-semibold">{s[tier.nameKey]}</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-fg text-3xl font-semibold tracking-tight tabular-nums">
                    {s[tier.priceKey]}
                  </span>
                  <span className="text-muted text-sm">{s[tier.periodKey]}</span>
                </div>
                <p className="text-muted text-sm leading-relaxed">
                  {s[tier.descriptionKey]}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2.5">
                  {tier.featureKeys.map((featureKey) => (
                    <li key={featureKey} className="flex items-start gap-2.5">
                      <span className="bg-brand/10 text-brand mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                        <IconCheck size={12} aria-hidden="true" />
                      </span>
                      <span className="text-fg text-sm">{s[featureKey]}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={tier.featured ? "primary" : "outline"}
                  className="w-full justify-center"
                >
                  {s[tier.ctaKey]}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
