"use client";

import { use, useEffect, useState } from "react";
import type { SettingsIndexPageProps } from "@/types/settings/SettingsIndexPage-types";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiFetchJson } from "@/lib/api-client";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { TIERS, TIER_PRICES_CENTS, tierLabel, tierAtLeast, type Tier } from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import { plansPath } from "@/constants/routes";
import { formatDate } from "@/lib/date-time";
import { BILLING_SUBSCRIPTION_URL } from "@/constants/api/urls";

interface SubscriptionInfo {
  tier: string;
  priceCents: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// fallow-ignore-next-line complexity
export default function PageContent({
  params,
}: SettingsIndexPageProps) {
  const { lang } = use(params);
  const { user } = useAuth();
  const t = useMessages("settings");
  const p = useMessages("pricing");
  const currency = useCurrencyCookie();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    if (!user) return;
    apiFetchJson<{ subscription: SubscriptionInfo | null }>(BILLING_SUBSCRIPTION_URL)
      .then((data) => setSubscription(data.subscription))
      .catch(() => {});
  }, [user]);

  const tier = (subscription?.tier as Tier) ?? (user!.tier as Tier) ?? "FREE";
  const periodEnd = subscription?.periodEnd;
  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd ?? false;

  const FEATURES: Record<Tier, string[]> = {
    FREE: p.featuresBasic,
    BASIC: p.featuresMedium,
    MEDIUM: p.featuresPremium,
    PREMIUM: p.featuresPro,
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">{t.currentPlan}</h2>

      <div className="flex flex-col gap-4">
        <div className="border-border bg-surface flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-lg font-bold">{tierLabel(tier)}</p>
            <p className="text-sm text-muted">{formatPrice(TIER_PRICES_CENTS[tier], currency)}</p>
            {tier !== "FREE" && periodEnd && (
              <p className="mt-1 text-xs text-muted">
                {cancelAtPeriodEnd
                  ? `Cancels on ${formatDate(periodEnd)}`
                  : `Next payment: ${formatDate(periodEnd)}`}
              </p>
            )}
          </div>
          <Link
            href={`/v1/${lang}/settings/billing`}
            className="border-border rounded-lg border px-4 py-2 text-sm font-medium hover:bg-surface-hover"
          >
            {t.navBilling}
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Plan Advantages</h3>
          <ul className="flex flex-col gap-2">
            {FEATURES[tier].map((f) => (
              <li key={f} className="border-border bg-surface flex items-center gap-2 rounded-lg border p-3 text-sm">
                <span className="text-brand size-5 flex items-center justify-center rounded-full bg-green-100 text-xs font-bold">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {tier !== "FREE" && (
          <div className="border-border flex justify-center rounded-lg border p-3">
            <Link
              href={`/v1/${lang}/settings/billing`}
              className="text-sm text-muted hover:text-foreground underline underline-offset-2"
            >
              {t.navBilling}
            </Link>
          </div>
        )}

        {tier === "FREE" && (
          <Link
            href={plansPath(lang)}
            className="bg-brand mt-2 block rounded-lg px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90"
          >
            {t.upgradePlan}
          </Link>
        )}
      </div>
    </div>
  );
}
