"use client";

import { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithPricingMessages } from "@/types/pages/pricing/PricingMessages-types";

const SIGNUP_URL = "https://example.com/signup";

const BASE_FEE = 29;
const INCLUDED_UNITS = 100;
const OVERAGE_RATE_PER_UNIT = 0.15;
const SLIDER_MIN = 0;
const SLIDER_MAX = 1000;
const SLIDER_STEP = 10;
const DEFAULT_USAGE_UNITS = 200;

const INCLUDED_FEATURE_KEYS = [
  "pricing5Feature1",
  "pricing5Feature2",
  "pricing5Feature3",
  "pricing5Feature4",
] as const;

function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function UsageCalculatorPricing() {
  const t = useMessages("pages") as unknown as PagesWithPricingMessages;
  const p = t.pricing;
  const [usageUnits, setUsageUnits] = useState<number>(DEFAULT_USAGE_UNITS);

  const overageUnits = Math.max(0, usageUnits - INCLUDED_UNITS);
  const overageFee = overageUnits * OVERAGE_RATE_PER_UNIT;
  const totalFee = BASE_FEE + overageFee;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 lg:px-6">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="soft">{p.pricing5Badge}</Badge>
          <Typography
            variant="h2"
            className="text-4xl font-semibold tracking-tight lg:text-5xl"
          >
            {p.pricing5Title}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {p.pricing5Description}
          </Typography>
        </div>
        <Card variant="elevated">
          <CardContent className="flex flex-col gap-8 pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <Typography variant="body" className="text-sm font-medium">
                  {p.pricing5SliderLabel}
                </Typography>
                <span className="text-fg text-sm font-semibold tabular-nums">
                  {usageUnits.toLocaleString("en-US")}
                  {p.pricing5UnitSuffix}
                </span>
              </div>
              <Slider
                value={[usageUnits]}
                onValueChange={([value]) => setUsageUnits(value)}
                min={SLIDER_MIN}
                max={SLIDER_MAX}
                step={SLIDER_STEP}
                aria-label={p.pricing5SliderLabel}
              />
              <div className="text-muted flex items-center justify-between text-xs">
                <span>{SLIDER_MIN.toLocaleString("en-US")}k</span>
                <span>{SLIDER_MAX.toLocaleString("en-US")}k</span>
              </div>
            </div>
            <div className="border-border bg-surface/50 flex flex-col gap-2 rounded-xl border p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{p.pricing5BaseFeeLabel}</span>
                <span className="text-fg font-medium">
                  {formatMoney(BASE_FEE)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">
                  {p.pricing5IncludedLabel.replace(
                    "{units}",
                    INCLUDED_UNITS.toLocaleString("en-US"),
                  )}
                </span>
                <span className="text-fg font-medium">
                  {p.pricing5IncludedValue}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">
                  {p.pricing5OverageLabel.replace(
                    "{units}",
                    overageUnits.toLocaleString("en-US"),
                  )}
                </span>
                <span className="text-fg font-medium">
                  {formatMoney(overageFee)}
                </span>
              </div>
              <div className="border-border mt-2 flex items-center justify-between border-t pt-3">
                <Typography variant="body" className="font-semibold">
                  {p.pricing5TotalLabel}
                </Typography>
                <span className="text-fg text-2xl font-semibold tracking-tight">
                  {formatMoney(totalFee)}
                  <span className="text-muted ml-1 text-sm font-normal">
                    {p.pricing5PerMonthSuffix}
                  </span>
                </span>
              </div>
            </div>
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {INCLUDED_FEATURE_KEYS.map((featureKey) => (
                <li
                  key={featureKey}
                  className="flex items-start gap-2.5 text-sm"
                >
                  <IconCheck size={18} className="text-brand mt-0.5 shrink-0" />
                  <span className="text-fg">{p[featureKey]}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild variant="primary" className="w-full">
              <a href={SIGNUP_URL}>{p.pricing5Cta}</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
