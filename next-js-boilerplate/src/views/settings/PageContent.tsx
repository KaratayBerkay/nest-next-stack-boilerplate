"use client";

import { use } from "react";
import { cn } from "@/lib/cn";
import type { SettingsIndexPageProps } from "@/types/settings/SettingsIndexPage-types";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { TIER_PRICES_CENTS, tierLabel, type Tier } from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import type { CurrencyCode } from "@/constants/currency";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { plansPath } from "@/constants/routes";
import {
  formatDateByPreference,
  type DateDisplayPreference,
} from "@/lib/date-time";
import { PageHeader } from "@/components/ui";
import { PageInfoButton } from "@/components/ui/page-info";
import { settingsPageInfo } from "@/constants/page-info";
import { subscriptionQueryOptions } from "@/api/client/billing/query";

function useSubscription(userId: string | undefined) {
  return useSuspenseQuery(subscriptionQueryOptions(userId));
}

function renderPlanInfo(
  tier: Tier,
  periodEnd: string | undefined,
  cancelAtPeriodEnd: boolean,
  t: Record<string, string>,
  currency: CurrencyCode,
  dateDisplay: DateDisplayPreference,
  lang: string,
) {
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

function renderPlanAdvantages(tier: Tier, FEATURES: Record<Tier, string[]>) {
  return (
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
  );
}

function renderUpgradeActions(
  tier: Tier,
  t: Record<string, string>,
  lang: string,
) {
  return (
    <>
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
          className="bg-brand text-brand-fg mt-2 block rounded-lg px-4 py-2 text-center text-sm font-medium hover:opacity-90"
        >
          {t.upgradePlan}
        </Link>
      )}
    </>
  );
}

export default function PageContent({
  params,
  className,
}: SettingsIndexPageProps) {
  const { lang } = use(params);
  const { user } = useAuth();
  const t = useMessages("settings");
  const p = useMessages("pricing");
  const currency = useCurrencyCookie();
  const dateDisplay = useDateDisplayCookie();
  const { data: subscription } = useSubscription(user?.id);

  const tier = (subscription?.tier as Tier) ?? (user!.tier as Tier) ?? "FREE";
  const periodEnd = (subscription as { periodEnd?: string } | null)?.periodEnd;
  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd ?? false;

  const FEATURES: Record<Tier, string[]> = {
    FREE: p.featuresBasic,
    BASIC: p.featuresMedium,
    MEDIUM: p.featuresPremium,
    PREMIUM: p.featuresPro,
  };

  return (
    <div className={cn("flex h-full w-full flex-col gap-6", className)}>
      <PageHeader
        title={t.currentPlan}
        actions={<PageInfoButton content={settingsPageInfo} />}
      />

      <div className="flex flex-col gap-4">
        {renderPlanInfo(
          tier,
          periodEnd,
          cancelAtPeriodEnd,
          t as unknown as Record<string, string>,
          currency,
          dateDisplay,
          lang,
        )}
        {renderPlanAdvantages(tier, FEATURES)}
        {renderUpgradeActions(
          tier,
          t as unknown as Record<string, string>,
          lang,
        )}
      </div>
    </div>
  );
}
