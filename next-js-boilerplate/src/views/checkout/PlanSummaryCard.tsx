"use client";

import { tierLabel } from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { TIER_FEATURES } from "@/lib/checkout/tier-features";
import type { PlanSummaryCardProps } from "@/types/checkout/PlanSummaryCard-types";

export function PlanSummaryCard({
  targetTier,
  currency,
  priceCents,
}: PlanSummaryCardProps) {
  return (
    <div className="border-border bg-surface rounded-lg border p-4">
      <h2 className="font-medium">{tierLabel(targetTier)}</h2>
      <p className="mt-1 text-2xl font-bold">
        {formatPrice(priceCents, currency as "USD" | "EUR" | "TRY")}
      </p>
      <ul className="text-muted mt-3 space-y-1 text-sm">
        {(TIER_FEATURES[targetTier] ?? []).map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
    </div>
  );
}
