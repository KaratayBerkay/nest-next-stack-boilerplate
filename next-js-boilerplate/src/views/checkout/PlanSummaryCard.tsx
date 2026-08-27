"use client";

import { tierLabel } from "@/lib/tier";
import type { Tier } from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { useTierFeatures } from "@/lib/checkout/tier-features";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PlanSummaryCardProps } from "@/types/checkout/PlanSummaryCard-types";

export function PlanSummaryCard({
  targetTier,
  currency,
  priceCents,
}: PlanSummaryCardProps) {
  const t = useMessages("pricing");
  const features = useTierFeatures();
  return (
    <div className="border-border bg-surface rounded-lg border p-4">
      <h2 className="font-medium">{tierLabel(targetTier)}</h2>
      <p className="mt-1 text-2xl font-bold">
        {formatPrice(priceCents, currency as "USD" | "EUR" | "TRY", t.free)}
      </p>
      <ul className="text-muted mt-3 space-y-1 text-sm">
        {(features[targetTier as Tier] ?? []).map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
    </div>
  );
}
