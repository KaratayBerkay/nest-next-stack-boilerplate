"use client";

import { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Counter } from "@/components/ui/Counter";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPricingMessages } from "@/types/pages/pricing/PricingMessages-types";

const SIGNUP_URL = "https://example.com/signup";

const PRICE_PER_SEAT = 15;
const MIN_SEATS = 1;
const MAX_SEATS = 200;
const DEFAULT_SEATS = 5;

interface DiscountTier {
  min: number;
  max: number | null;
  rate: number;
  labelKey: string;
}

const DISCOUNT_TIERS: DiscountTier[] = [
  { min: 1, max: 10, rate: 0, labelKey: "pricing8Tier1Label" },
  { min: 11, max: 50, rate: 0.1, labelKey: "pricing8Tier2Label" },
  { min: 51, max: null, rate: 0.2, labelKey: "pricing8Tier3Label" },
];

const INCLUDED_FEATURE_KEYS = [
  "pricing8Feature1",
  "pricing8Feature2",
  "pricing8Feature3",
] as const;

function getDiscountRate(seats: number): number {
  const tier = DISCOUNT_TIERS.find(
    (t) => seats >= t.min && (t.max === null || seats <= t.max),
  );
  return tier?.rate ?? 0;
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function PerSeatCalculatorPricing() {
  const t = useMessages("pages") as unknown as PagesWithPricingMessages;
  const p = t.pricing;
  const [seats, setSeats] = useState<number>(DEFAULT_SEATS);

  const discountRate = getDiscountRate(seats);
  const subtotal = seats * PRICE_PER_SEAT;
  const discountAmount = subtotal * discountRate;
  const total = subtotal - discountAmount;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 lg:px-6">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="soft">{p.pricing8Badge}</Badge>
          <Typography
            variant="h2"
            className="text-4xl font-semibold tracking-tight lg:text-5xl"
          >
            {p.pricing8Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {p.pricing8Description}
          </Typography>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardContent className="flex flex-col gap-6 pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Typography variant="body" className="text-sm font-medium">
                    {p.pricing8SeatsLabel}
                  </Typography>
                  <Typography variant="caption" className="text-muted text-xs">
                    {p.pricing8PricePerSeatLabel.replace(
                      "{price}",
                      formatMoney(PRICE_PER_SEAT),
                    )}
                  </Typography>
                </div>
                <Counter
                  label={p.pricing8SeatsLabel}
                  value={seats}
                  onChange={setSeats}
                  min={MIN_SEATS}
                  max={MAX_SEATS}
                />
              </div>
              <div className="flex flex-col gap-2">
                {DISCOUNT_TIERS.map((tier) => {
                  const isActive = tier.rate === discountRate;
                  return (
                    <div
                      key={tier.labelKey}
                      className={
                        isActive
                          ? "border-brand bg-brand/5 flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                          : "border-border text-muted flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                      }
                    >
                      <span>{p[tier.labelKey]}</span>
                      <span className="tabular-nums">
                        {tier.rate === 0
                          ? p.pricing8NoDiscount
                          : `-${Math.round(tier.rate * 100)}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
              <ul className="flex flex-col gap-2.5">
                {INCLUDED_FEATURE_KEYS.map((featureKey) => (
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
          </Card>
          <Card variant="surface" className="lg:col-span-2">
            <div className="flex h-full flex-col">
              <CardContent className="flex-1 pt-6">
                <Typography variant="body" className="text-muted mb-4 text-sm">
                  {p.pricing8SummaryHeading}
                </Typography>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">
                      {p.pricing8SubtotalLabel}
                    </span>
                    <span className="text-fg font-medium">
                      {formatMoney(subtotal)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted">
                        {p.pricing8DiscountLabel}
                      </span>
                      <span className="text-success font-medium">
                        -{formatMoney(discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="border-border mt-2 flex items-center justify-between border-t pt-3">
                    <Typography variant="body" className="font-semibold">
                      {p.pricing8TotalLabel}
                    </Typography>
                    <span className="text-fg text-2xl font-semibold tracking-tight">
                      {formatMoney(total)}
                      <span className="text-muted ml-1 text-sm font-normal">
                        {p.pricing8PerMonthSuffix}
                      </span>
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="primary" className="w-full">
                  <a href={SIGNUP_URL}>{p.pricing8Cta}</a>
                </Button>
              </CardFooter>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
