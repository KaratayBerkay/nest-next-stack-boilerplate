"use client";

import { use, useState } from "react";
import type { SettingsIndexPageProps } from "@/types/settings/SettingsIndexPage-types";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSuspenseQuery } from "@tanstack/react-query";
import { apiFetchJson } from "@/lib/api-client";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import {
  TIERS,
  TIER_PRICES_CENTS,
  tierLabel,
  tierAtLeast,
  type Tier,
} from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { plansPath } from "@/constants/routes";
import { formatDateByPreference } from "@/lib/date-time";
import { BILLING_SUBSCRIPTION_URL } from "@/constants/api/urls";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsPageInfo } from "@/constants/page-info";

interface SubscriptionInfo {
  tier: string;
  priceCents: number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  cancelAtPeriodEnd: boolean;
}

function useSubscription(userId: string | undefined) {
  return useSuspenseQuery<{ subscription: SubscriptionInfo | null }>({
    queryKey: ["subscription", userId],
    queryFn: () => apiFetchJson(BILLING_SUBSCRIPTION_URL),
  });
}

// fallow-ignore-next-line complexity
export default function PageContent({ params }: SettingsIndexPageProps) {
  const { lang } = use(params);
  const { user } = useAuth();
  const t = useMessages("settings");
  const p = useMessages("pricing");
  const currency = useCurrencyCookie();
  const dateDisplay = useDateDisplayCookie();
  const { data: subscriptionData } = useSubscription(user?.id);
  const subscription = subscriptionData?.subscription ?? null;

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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t.currentPlan}</h2>
        <PageInfoButton content={settingsPageInfo} />
      </div>

      <div className="flex flex-col gap-4">
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

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Plan Advantages</h3>
          <ul className="flex flex-col gap-2">
            {FEATURES[tier].map((f) => (
              <li
                key={f}
                className="border-border bg-surface flex items-center gap-2 rounded-lg border p-3 text-sm"
              >
                <span className="text-brand flex size-5 items-center justify-center rounded-full bg-green-100 text-xs font-bold">
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
              className="text-muted hover:text-foreground text-sm underline underline-offset-2"
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
