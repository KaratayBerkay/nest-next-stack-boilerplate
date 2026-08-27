"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
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
    <Card variant="surface" className="flex items-center justify-between p-4">
      <div>
        <p className="text-lg font-bold">{tierLabel(tier)}</p>
        <p className="text-muted text-sm">
          {formatPrice(TIER_PRICES_CENTS[tier], currency, t.free)}
        </p>
        {tier !== "FREE" && periodEnd && (
          <p className="text-muted mt-1 text-xs">
            {(cancelAtPeriodEnd
              ? t.planInfoCardCancelsOn
              : t.planInfoCardNextPayment
            ).replace("{date}", formatDateByPreference(periodEnd, dateDisplay))}
          </p>
        )}
      </div>
      <Button variant="outline" asChild>
        <Link href={`/v1/${lang}/settings/billing`}>{t.navBilling}</Link>
      </Button>
    </Card>
  );
}
