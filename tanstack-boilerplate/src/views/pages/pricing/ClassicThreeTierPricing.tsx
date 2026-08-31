"use client";

import { IconCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPricingMessages } from "@/types/pages/pricing/PricingMessages-types";

const SIGNUP_URL = "https://example.com/signup";

interface PlanDef {
  id: string;
  nameKey: string;
  descriptionKey: string;
  priceKey: string;
  ctaKey: string;
  featureKeys: string[];
  popular?: boolean;
}

const PLANS: PlanDef[] = [
  {
    id: "starter",
    nameKey: "pricing1StarterName",
    descriptionKey: "pricing1StarterDescription",
    priceKey: "pricing1StarterPrice",
    ctaKey: "pricing1StarterCta",
    featureKeys: [
      "pricing1StarterFeature1",
      "pricing1StarterFeature2",
      "pricing1StarterFeature3",
      "pricing1StarterFeature4",
    ],
  },
  {
    id: "growth",
    nameKey: "pricing1GrowthName",
    descriptionKey: "pricing1GrowthDescription",
    priceKey: "pricing1GrowthPrice",
    ctaKey: "pricing1GrowthCta",
    featureKeys: [
      "pricing1GrowthFeature1",
      "pricing1GrowthFeature2",
      "pricing1GrowthFeature3",
      "pricing1GrowthFeature4",
      "pricing1GrowthFeature5",
    ],
    popular: true,
  },
  {
    id: "scale",
    nameKey: "pricing1ScaleName",
    descriptionKey: "pricing1ScaleDescription",
    priceKey: "pricing1ScalePrice",
    ctaKey: "pricing1ScaleCta",
    featureKeys: [
      "pricing1ScaleFeature1",
      "pricing1ScaleFeature2",
      "pricing1ScaleFeature3",
      "pricing1ScaleFeature4",
      "pricing1ScaleFeature5",
    ],
  },
];

export function ClassicThreeTierPricing() {
  const t = useMessages("pages") as unknown as PagesWithPricingMessages;
  const p = t.pricing;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="soft">{p.pricing1Badge}</Badge>
          <Typography
            variant="h2"
            className="text-4xl font-semibold tracking-tight lg:text-5xl"
          >
            {p.pricing1Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {p.pricing1Description}
          </Typography>
        </div>
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={
                plan.popular
                  ? "relative lg:-mt-4 lg:scale-105"
                  : "relative"
              }
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                  <Badge variant="default" pill>
                    {p.pricing1PopularBadge}
                  </Badge>
                </div>
              )}
              <Card
                variant={plan.popular ? "elevated" : "default"}
                className={
                  plan.popular ? "border-brand h-full border-2" : "h-full"
                }
              >
                <div className="flex h-full flex-col">
                  <CardHeader>
                    <Typography variant="h4">{p[plan.nameKey]}</Typography>
                    <Typography variant="bodySmall" className="text-muted">
                      {p[plan.descriptionKey]}
                    </Typography>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-6 flex items-baseline gap-1">
                      <span className="text-fg text-4xl font-semibold tracking-tight">
                        {p[plan.priceKey]}
                      </span>
                      <span className="text-muted text-sm">
                        {p.pricing1PeriodLabel}
                      </span>
                    </div>
                    <ul className="flex flex-col gap-3">
                      {plan.featureKeys.map((featureKey) => (
                        <li
                          key={featureKey}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <IconCheck
                            size={18}
                            className="text-brand mt-0.5 shrink-0"
                          />
                          <span className="text-fg">{p[featureKey]}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      asChild
                      variant={plan.popular ? "primary" : "outline"}
                      className="w-full"
                    >
                      <a href={SIGNUP_URL}>{p[plan.ctaKey]}</a>
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
