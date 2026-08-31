"use client";

import { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPricingMessages } from "@/types/pages/pricing/PricingMessages-types";

const SIGNUP_URL = "https://example.com/signup";

interface PlanDef {
  id: string;
  nameKey: string;
  descriptionKey: string;
  monthlyPriceKey: string;
  yearlyPriceKey: string;
  yearlyTotalKey: string;
  ctaKey: string;
  featureKeys: string[];
  popular?: boolean;
}

const PLANS: PlanDef[] = [
  {
    id: "basic",
    nameKey: "pricing2BasicName",
    descriptionKey: "pricing2BasicDescription",
    monthlyPriceKey: "pricing2BasicMonthlyPrice",
    yearlyPriceKey: "pricing2BasicYearlyPrice",
    yearlyTotalKey: "pricing2BasicYearlyTotal",
    ctaKey: "pricing2BasicCta",
    featureKeys: [
      "pricing2BasicFeature1",
      "pricing2BasicFeature2",
      "pricing2BasicFeature3",
    ],
  },
  {
    id: "pro",
    nameKey: "pricing2ProName",
    descriptionKey: "pricing2ProDescription",
    monthlyPriceKey: "pricing2ProMonthlyPrice",
    yearlyPriceKey: "pricing2ProYearlyPrice",
    yearlyTotalKey: "pricing2ProYearlyTotal",
    ctaKey: "pricing2ProCta",
    featureKeys: [
      "pricing2ProFeature1",
      "pricing2ProFeature2",
      "pricing2ProFeature3",
      "pricing2ProFeature4",
    ],
    popular: true,
  },
  {
    id: "business",
    nameKey: "pricing2BusinessName",
    descriptionKey: "pricing2BusinessDescription",
    monthlyPriceKey: "pricing2BusinessMonthlyPrice",
    yearlyPriceKey: "pricing2BusinessYearlyPrice",
    yearlyTotalKey: "pricing2BusinessYearlyTotal",
    ctaKey: "pricing2BusinessCta",
    featureKeys: [
      "pricing2BusinessFeature1",
      "pricing2BusinessFeature2",
      "pricing2BusinessFeature3",
      "pricing2BusinessFeature4",
    ],
  },
];

export function BillingToggleSavingsPricing() {
  const t = useMessages("pages") as unknown as PagesWithPricingMessages;
  const p = t.pricing;
  const [isYearly, setIsYearly] = useState<boolean>(false);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-semibold tracking-tight lg:text-5xl"
          >
            {p.pricing2Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {p.pricing2Description}
          </Typography>
        </div>
        <div className="mb-12 flex items-center justify-center gap-4">
          <span
            className={
              isYearly ? "text-muted text-sm font-medium" : "text-fg text-sm font-semibold"
            }
          >
            {p.pricing2MonthlyLabel}
          </span>
          <Switch
            checked={isYearly}
            onChange={(e) => setIsYearly(e.target.checked)}
            aria-label={p.pricing2ToggleAria}
          />
          <span
            className={
              isYearly ? "text-fg text-sm font-semibold" : "text-muted text-sm font-medium"
            }
          >
            {p.pricing2YearlyLabel}
          </span>
          <Badge variant="success" size="sm">
            {p.pricing2SavingsBadge}
          </Badge>
        </div>
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div key={plan.id} className="relative">
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                  <Badge variant="default" pill>
                    {p.pricing2PopularBadge}
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
                    <div className="mb-1 flex items-baseline gap-1">
                      <span className="text-fg text-4xl font-semibold tracking-tight">
                        {isYearly ? p[plan.yearlyPriceKey] : p[plan.monthlyPriceKey]}
                      </span>
                      <span className="text-muted text-sm">
                        {p.pricing2PeriodLabel}
                      </span>
                    </div>
                    <Typography
                      variant="caption"
                      className={
                        isYearly ? "text-muted mb-6 block text-xs" : "mb-6 block text-xs opacity-0"
                      }
                    >
                      {p.pricing2BilledAnnually.replace(
                        "{price}",
                        p[plan.yearlyTotalKey],
                      )}
                    </Typography>
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
