"use client";

import { IconCheck, IconMail } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPricingMessages } from "@/types/pages/pricing/PricingMessages-types";

const SIGNUP_URL = "https://example.com/signup";
const CONTACT_URL = "https://example.com/contact-sales";

interface SelfServePlan {
  id: string;
  nameKey: string;
  descriptionKey: string;
  priceKey: string;
  ctaKey: string;
  featureKeys: string[];
}

const SELF_SERVE_PLANS: SelfServePlan[] = [
  {
    id: "starter",
    nameKey: "pricing9StarterName",
    descriptionKey: "pricing9StarterDescription",
    priceKey: "pricing9StarterPrice",
    ctaKey: "pricing9StarterCta",
    featureKeys: [
      "pricing9StarterFeature1",
      "pricing9StarterFeature2",
      "pricing9StarterFeature3",
    ],
  },
  {
    id: "growth",
    nameKey: "pricing9GrowthName",
    descriptionKey: "pricing9GrowthDescription",
    priceKey: "pricing9GrowthPrice",
    ctaKey: "pricing9GrowthCta",
    featureKeys: [
      "pricing9GrowthFeature1",
      "pricing9GrowthFeature2",
      "pricing9GrowthFeature3",
      "pricing9GrowthFeature4",
    ],
  },
];

const ENTERPRISE_FEATURE_KEYS = [
  "pricing9EnterpriseFeature1",
  "pricing9EnterpriseFeature2",
  "pricing9EnterpriseFeature3",
  "pricing9EnterpriseFeature4",
] as const;

export function EnterpriseContactPricing() {
  const t = useMessages("pages") as unknown as PagesWithPricingMessages;
  const p = t.pricing;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="outline">{p.pricing9Badge}</Badge>
          <Typography
            variant="h2"
            className="text-4xl font-semibold tracking-tight lg:text-5xl"
          >
            {p.pricing9Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {p.pricing9Description}
          </Typography>
        </div>
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {SELF_SERVE_PLANS.map((plan) => (
            <Card key={plan.id} className="h-full">
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
                      {p.pricing9PeriodLabel}
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
                  <Button asChild variant="outline" className="w-full">
                    <a href={SIGNUP_URL}>{p[plan.ctaKey]}</a>
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))}
          <Card className="bg-fg text-bg border-fg h-full">
            <div className="flex h-full flex-col">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <IconMail size={18} className="text-bg/70" />
                  <Typography variant="h4" className="text-bg">
                    {p.pricing9EnterpriseName}
                  </Typography>
                </div>
                <Typography variant="bodySmall" className="text-bg/70">
                  {p.pricing9EnterpriseDescription}
                </Typography>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-bg text-4xl font-semibold tracking-tight">
                    {p.pricing9EnterprisePrice}
                  </span>
                </div>
                <ul className="flex flex-col gap-3">
                  {ENTERPRISE_FEATURE_KEYS.map((featureKey) => (
                    <li
                      key={featureKey}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <IconCheck size={18} className="text-bg mt-0.5 shrink-0" />
                      <span className="text-bg/90">{p[featureKey]}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  variant="shadow"
                  className="bg-bg text-fg hover:bg-bg/90 w-full"
                >
                  <a href={CONTACT_URL}>{p.pricing9EnterpriseCta}</a>
                </Button>
              </CardFooter>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
