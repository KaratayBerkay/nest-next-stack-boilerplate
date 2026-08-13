"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  IconDeviceLaptop,
  IconKeyboard,
  IconMinus,
  IconPlus,
  IconShoppingBag,
  IconUsb,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/button";
import { Typography } from "@/components/ui/Typography";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithDealsMessages } from "@/types/pages/deals/DealsMessages-types";

interface BundleProduct {
  id: string;
  icon: Icon;
  nameKey: string;
}

const UNIT_PRICES = [29, 39, 59] as const;

const TIER_THRESHOLDS = [1, 2, 4] as const;

const TIER_DISCOUNTS = [0, 10, 20] as const;

const TIER_NAME_KEYS = [
  "deals2Tier0Name",
  "deals2Tier1Name",
  "deals2Tier2Name",
] as const;

const PRODUCTS: BundleProduct[] = [
  {
    id: "keyboard",
    icon: IconKeyboard,
    nameKey: "deals2Product1Name",
  },
  {
    id: "hub",
    icon: IconUsb,
    nameKey: "deals2Product2Name",
  },
  {
    id: "stand",
    icon: IconDeviceLaptop,
    nameKey: "deals2Product3Name",
  },
];

function getTierIndex(total: number): number {
  return TIER_THRESHOLDS.reduce(
    (highest, min, index) => (total >= min ? index : highest),
    0,
  );
}

function getDiscountPct(total: number): number {
  return TIER_DISCOUNTS[getTierIndex(total)];
}

function getNextTierTotal(total: number): number | null {
  return TIER_THRESHOLDS.find((min) => min > total) ?? null;
}

function getNextTierProgress(total: number): number {
  const next = getNextTierTotal(total);
  if (next === null) return 100;
  return Math.min(100, Math.round((total / next) * 100));
}

function getItemTotal(counts: readonly number[]): number {
  return counts.reduce((sum, count) => sum + count, 0);
}

function getSubtotal(counts: readonly number[]): number {
  return counts.reduce(
    (sum, count, index) => sum + count * UNIT_PRICES[index],
    0,
  );
}

function getTotalPrice(counts: readonly number[]): number {
  const subtotal = getSubtotal(counts);
  const discount = Math.round(
    (subtotal * getDiscountPct(getItemTotal(counts))) / 100,
  );
  return subtotal - discount;
}

function handleIncrement(
  index: number,
  setCounts: Dispatch<SetStateAction<number[]>>,
) {
  setCounts((prev) =>
    prev.map((count, i) => (i === index ? count + 1 : count)),
  );
}

function handleDecrement(
  index: number,
  setCounts: Dispatch<SetStateAction<number[]>>,
) {
  setCounts((prev) =>
    prev.map((count, i) => (i === index ? Math.max(0, count - 1) : count)),
  );
}

export function DealsBundleBuilder() {
  const t = useMessages("pages") as unknown as PagesWithDealsMessages;
  const d = t.deals;
  const [counts, setCounts] = useState<number[]>([0, 0, 0]);

  const itemTotal = getItemTotal(counts);
  const subtotal = getSubtotal(counts);
  const total = getTotalPrice(counts);
  const discount = subtotal - total;
  const tierIndex = getTierIndex(itemTotal);
  const nextTierTotal = getNextTierTotal(itemTotal);
  const progress = getNextTierProgress(itemTotal);

  const tierHint =
    nextTierTotal === null
      ? d.deals2MaxTierHint
      : itemTotal === 0
        ? d.deals2EmptyHint
        : d.deals2NextTierHint
            .replace("{n}", String(nextTierTotal - itemTotal))
            .replace("{tier}", d[TIER_NAME_KEYS[getTierIndex(nextTierTotal)]]);

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-3 text-center">
          <Typography
            variant="h2"
            className="text-3xl font-medium tracking-tighter md:text-4xl"
          >
            {d.deals2Heading}
          </Typography>
          <Typography variant="bodyLarge" className="text-muted">
            {d.deals2Description}
          </Typography>
        </div>
        <div className="border-border bg-surface w-full max-w-xl rounded-2xl border p-6 shadow-xs">
          <ul className="flex flex-col">
            {PRODUCTS.map((product, index) => (
              <li
                key={product.id}
                className="border-border flex items-center gap-3 border-b py-4 last:border-b-0"
              >
                <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-full">
                  <product.icon size={20} aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {d[product.nameKey]}
                  </span>
                  <span className="text-muted text-xs tabular-nums">
                    {d.deals2Currency}
                    {UNIT_PRICES[index]}
                  </span>
                </div>
                <div
                  role="group"
                  aria-label={d.deals2CountAria
                    .replace("{count}", String(counts[index]))
                    .replace("{product}", d[product.nameKey])}
                  className="flex items-center gap-1.5"
                >
                  <IconButton
                    variant="outline"
                    size="icon-sm"
                    label={d.deals2RemoveAria.replace(
                      "{product}",
                      d[product.nameKey],
                    )}
                    icon={<IconMinus size={16} aria-hidden="true" />}
                    disabled={counts[index] === 0}
                    onClick={() => handleDecrement(index, setCounts)}
                  />
                  <span className="w-6 text-center text-sm font-medium tabular-nums">
                    {counts[index]}
                  </span>
                  <IconButton
                    variant="outline"
                    size="icon-sm"
                    label={d.deals2AddAria.replace(
                      "{product}",
                      d[product.nameKey],
                    )}
                    icon={<IconPlus size={16} aria-hidden="true" />}
                    onClick={() => handleIncrement(index, setCounts)}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted text-sm">
                {d.deals2TierBadgeLabel}
              </span>
              <Badge variant="soft" pill>
                {d[TIER_NAME_KEYS[tierIndex]]}
              </Badge>
            </div>
            <div className="flex flex-col gap-1.5">
              <div
                role="progressbar"
                aria-label={d.deals2ProgressAria}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="bg-surface-hover h-2 w-full overflow-hidden rounded-full"
              >
                <div
                  className="bg-brand h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-muted text-xs">{tierHint}</p>
            </div>
            <div className="border-border flex flex-col gap-1.5 border-t pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">{d.deals2ItemsLabel}</span>
                <span className="tabular-nums">{itemTotal}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">{d.deals2SubtotalLabel}</span>
                <span className="tabular-nums">
                  {d.deals2Currency}
                  {subtotal}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">{d.deals2DiscountLabel}</span>
                <span className="text-brand tabular-nums">
                  -{d.deals2Currency}
                  {discount}
                </span>
              </div>
              <div className="border-border flex items-center justify-between gap-3 border-t pt-3">
                <span className="font-medium">{d.deals2TotalLabel}</span>
                <span className="text-lg font-semibold tabular-nums">
                  {d.deals2Currency}
                  {total}
                </span>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full"
              leftIcon={<IconShoppingBag size={18} aria-hidden="true" />}
            >
              {d.deals2Cta}
              <span className="tabular-nums">
                {d.deals2Currency}
                {total}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
