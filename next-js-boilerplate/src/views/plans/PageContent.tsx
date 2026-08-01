"use client";

import { use } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { TierCardProps } from "@/types/plans/TierCard-types";
import type { PlansPageProps } from "@/types/plans/PlansPage-types";
import {
  TIERS,
  tierLabel,
  tierAtLeast,
  TIER_PRICES_CENTS,
  type Tier,
} from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { checkoutPath } from "@/constants/routes";
import { LOGIN_PATH } from "@/constants/routes";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import type { CurrencyCode } from "@/constants/currency";
import { PageInfoButton } from "@/components/ui/page-info";
import { plansPageInfo } from "@/constants/page-info";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { subscriptionQueryOptions } from "@/api/client/billing/query";

function buildTierCards(
  user: { tier?: string } | null,
  currency: CurrencyCode,
  lang: string,
  FEATURES: Record<Tier, string[]>,
  t: Record<string, string | string[]>,
  pendingTier?: string,
  pendingTierEffectiveAt?: string,
) {
  const hasPendingChange = Boolean(pendingTier && pendingTierEffectiveAt);

  return TIERS.map((tier) => {
    const isCurrent = tier === user?.tier;
    const hasAccess = user?.tier && tierAtLeast(user.tier, tier);
    const isUpgrade = user?.tier && !hasAccess && tier !== user.tier;
    const changePending = Boolean(hasPendingChange && isUpgrade);

    return (
      <TierCard
        key={tier}
        tier={tier}
        price={formatPrice(TIER_PRICES_CENTS[tier], currency)}
        features={FEATURES[tier]}
        current={isCurrent}
        currentLabel={t.currentPlan as string}
        ctaLabel={
          changePending
            ? (t.changePending as string)
            : isCurrent
              ? (t.currentPlan as string)
              : hasAccess
                ? (t.included as string)
                : (t.upgrade as string)
        }
        ctaHref={
          isUpgrade && user
            ? checkoutPath(tier, lang)
            : !user
              ? LOGIN_PATH
              : undefined
        }
        changePending={changePending}
      />
    );
  });
}

function TierCard({
  tier,
  price,
  features,
  current,
  ctaLabel,
  ctaHref,
  currentLabel,
  changePending,
}: TierCardProps) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-6 ${
        current ? "border-brand ring-brand/20 ring-2" : "border-border"
      }`}
    >
      <h3 className="text-lg font-semibold">{tierLabel(tier)}</h3>
      <p className="text-muted mt-1 text-2xl font-bold">{price}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {features.map((f) => (
          <li key={f} className="text-muted text-sm">
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        {current ? (
          <span className="bg-surface text-muted block rounded-lg px-4 py-2 text-center text-sm font-medium">
            {currentLabel}
          </span>
        ) : ctaHref && !changePending ? (
          <Link
            href={ctaHref}
            className="bg-brand hover:bg-brand/90 text-brand-fg block rounded-lg px-4 py-2 text-center text-sm font-medium"
          >
            {ctaLabel}
          </Link>
        ) : (
          <span className="bg-surface text-muted block rounded-lg px-4 py-2 text-center text-sm font-medium">
            {ctaLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PageContent({ params, className }: PlansPageProps) {
  const { lang } = use(params);
  const { user } = useAuth();
  const t = useMessages("pricing");
  const currency = useCurrencyCookie();
  const { data: subData } = useQuery(subscriptionQueryOptions(user?.id));

  const pendingTier =
    (subData as { pendingTier?: string } | null)?.pendingTier ?? undefined;
  const pendingTierEffectiveAt =
    (subData as { pendingTierEffectiveAt?: string } | null)
      ?.pendingTierEffectiveAt ?? undefined;
  const hasPendingChange = Boolean(pendingTier && pendingTierEffectiveAt);

  const FEATURES: Record<Tier, string[]> = {
    FREE: t.featuresBasic,
    BASIC: t.featuresMedium,
    MEDIUM: t.featuresPremium,
    PREMIUM: t.featuresPro,
  };

  const tierCards = buildTierCards(
    user,
    currency,
    lang,
    FEATURES,
    t,
    pendingTier,
    pendingTierEffectiveAt,
  );

  return (
    <div className={cn("flex h-full w-full flex-col gap-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t.heading}</h1>
          <p className="text-muted text-sm">{t.subtitle}</p>
        </div>
        <PageInfoButton content={plansPageInfo} />
      </div>

      {hasPendingChange && (
        <p className="text-warning text-xs">
          {t.planChangeScheduled
            .replace("{tier}", tierLabel(pendingTier ?? ""))
            .replace("{date}", pendingTierEffectiveAt ?? "")}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tierCards}
      </div>
    </div>
  );
}
