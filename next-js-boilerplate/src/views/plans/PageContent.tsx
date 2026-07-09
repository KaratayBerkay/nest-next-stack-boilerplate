"use client";

import { use } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { TierCardProps } from "@/types/plans/TierCard-types";
import type { PlansPageProps } from "@/types/plans/PlansPage-types";
import { TIERS, tierLabel, tierAtLeast, TIER_PRICES_CENTS, type Tier } from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { checkoutPath } from "@/constants/routes";
import { LOGIN_PATH } from "@/constants/routes";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import { PageInfoButton } from "@/components/ui/page-info";
import { plansPageInfo } from "@/constants/page-info";
import Link from "next/link";

function TierCard({
  tier,
  price,
  features,
  current,
  ctaLabel,
  ctaHref,
  currentLabel,
}: TierCardProps) {
  return (
    <div
      className={`flex flex-col rounded-xl border p-6 ${
        current ? "border-brand ring-brand/20 ring-2" : "border-border"
      }`}
    >
      <h3 className="text-lg font-semibold">{tierLabel(tier)}</h3>
      <p className="mt-1 text-2xl font-bold text-muted">{price}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {features.map((f) => (
          <li key={f} className="text-sm text-muted">
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        {current ? (
          <span className="block rounded-lg bg-surface px-4 py-2 text-center text-sm font-medium text-muted">
            {currentLabel}
          </span>
        ) : ctaHref ? (
          <Link
            href={ctaHref}
            className="block rounded-lg bg-brand px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand/90"
          >
            {ctaLabel}
          </Link>
        ) : (
          <span className="block rounded-lg bg-surface px-4 py-2 text-center text-sm font-medium text-muted">
            {ctaLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PageContent({
  params,
}: PlansPageProps) {
  const { lang } = use(params);
  const { user } = useAuth();
  const t = useMessages("pricing");
  const currency = useCurrencyCookie();

  const FEATURES: Record<Tier, string[]> = {
    FREE: t.featuresBasic,
    BASIC: t.featuresMedium,
    MEDIUM: t.featuresPremium,
    PREMIUM: t.featuresPro,
  };

  // fallow-ignore-next-line complexity
  const tierCards = TIERS.map((tier) => {
    const isCurrent = tier === user?.tier;
    const hasAccess = user?.tier && tierAtLeast(user.tier, tier);
    const isUpgrade = user?.tier && !hasAccess && tier !== user.tier;

    return (
      <TierCard
        key={tier}
        tier={tier}
        price={formatPrice(TIER_PRICES_CENTS[tier], currency)}
        features={FEATURES[tier]}
        current={isCurrent}
        currentLabel={t.currentPlan}
        ctaLabel={
          isCurrent
            ? t.currentPlan
            : hasAccess
              ? t.included
              : t.upgrade
        }
        ctaHref={
          isUpgrade && user
            ? checkoutPath(tier, lang)
            : !user
              ? LOGIN_PATH
              : undefined
        }
      />
    );
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t.heading}</h1>
          <p className="text-sm text-muted">{t.subtitle}</p>
        </div>
        <PageInfoButton content={plansPageInfo} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tierCards}
      </div>
    </div>
  );
}
