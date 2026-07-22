"use client";

import Link from "next/link";
import { TIER_PRICES_CENTS, tierLabel } from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { formatDateByPreference } from "@/lib/date-time";
import type { PlanInfoCardProps } from "@/types/settings/PlanInfoCard-types";

export default function PlanInfoCard({
  tier,
  periodEnd,
  cancelAtPeriodEnd,
  t,
  currency,
  dateDisplay,
  lang,
}: PlanInfoCardProps) {
  return (
    <div className="border-border bg-surface flex items-center justify-between rounded-lg border p-4">
      <div>
        <p className="text-lg font-bold">{tierLabel(tier)}</p>
        <p className="text-muted text-sm">
          {formatPrice(TIER_PRICES_CENTS[tier], currency)}
        </p>
        {tier !== "FREE" && periodEnd && (
          <p className="text-muted mt-1 text-xs">
            {cancelAtPeriodEnd
              ? `Cancels on ${formatDateByPreference(periodEnd, dateDisplay)}`
              : `Next payment: ${formatDateByPreference(periodEnd, dateDisplay)}`}
          </p>
        )}
      </div>
      <Link
        href={`/v1/${lang}/settings/billing`}
        className="border-border hover:bg-surface-hover rounded-lg border px-4 py-2 text-sm font-medium"
      >
        {t.navBilling}
      </Link>
    </div>
  );
}
