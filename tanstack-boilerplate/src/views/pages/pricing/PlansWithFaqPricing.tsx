"use client";

import { IconCheck, IconChevronDown } from "@tabler/icons-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPricingMessages } from "@/types/pages/pricing/PricingMessages-types";

const SIGNUP_URL = "https://example.com/signup";

interface PlanDef {
  id: string;
  nameKey: string;
  priceKey: string;
  ctaKey: string;
  featureKeys: string[];
}

const PLANS: PlanDef[] = [
  {
    id: "solo",
    nameKey: "pricing7SoloName",
    priceKey: "pricing7SoloPrice",
    ctaKey: "pricing7SoloCta",
    featureKeys: ["pricing7SoloFeature1", "pricing7SoloFeature2", "pricing7SoloFeature3"],
  },
  {
    id: "team",
    nameKey: "pricing7TeamName",
    priceKey: "pricing7TeamPrice",
    ctaKey: "pricing7TeamCta",
    featureKeys: [
      "pricing7TeamFeature1",
      "pricing7TeamFeature2",
      "pricing7TeamFeature3",
      "pricing7TeamFeature4",
    ],
  },
  {
    id: "org",
    nameKey: "pricing7OrgName",
    priceKey: "pricing7OrgPrice",
    ctaKey: "pricing7OrgCta",
    featureKeys: [
      "pricing7OrgFeature1",
      "pricing7OrgFeature2",
      "pricing7OrgFeature3",
      "pricing7OrgFeature4",
    ],
  },
];

const FAQ_ITEMS = [
  { qKey: "pricing7Faq1Q", aKey: "pricing7Faq1A" },
  { qKey: "pricing7Faq2Q", aKey: "pricing7Faq2A" },
  { qKey: "pricing7Faq3Q", aKey: "pricing7Faq3A" },
  { qKey: "pricing7Faq4Q", aKey: "pricing7Faq4A" },
] as const;

export function PlansWithFaqPricing() {
  const t = useMessages("pages") as unknown as PagesWithPricingMessages;
  const p = t.pricing;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 lg:px-6">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center">
          <Typography
            variant="h2"
            className="text-4xl font-semibold tracking-tight lg:text-5xl"
          >
            {p.pricing7Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {p.pricing7Description}
          </Typography>
        </div>
        <div className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card key={plan.id} className="h-full">
              <div className="flex h-full flex-col">
                <CardHeader>
                  <Typography variant="h4">{p[plan.nameKey]}</Typography>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-fg text-3xl font-semibold tracking-tight">
                      {p[plan.priceKey]}
                    </span>
                    <span className="text-muted text-sm">
                      {p.pricing7PeriodLabel}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
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
        </div>
        <div className="mx-auto max-w-2xl">
          <Typography
            variant="h3"
            className="mb-8 text-center text-2xl font-semibold tracking-tight"
          >
            {p.pricing7FaqHeading}
          </Typography>
          <Accordion type="single" collapsible>
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.qKey} value={item.qKey}>
                <AccordionTrigger>
                  <span>{p[item.qKey]}</span>
                  <IconChevronDown
                    size={16}
                    className="shrink-0 transition-transform duration-300 data-[state=open]:rotate-180"
                  />
                </AccordionTrigger>
                <AccordionContent>{p[item.aKey]}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
