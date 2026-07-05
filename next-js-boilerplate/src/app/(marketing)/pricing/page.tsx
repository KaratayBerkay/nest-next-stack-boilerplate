"use client";

import { useAuth } from "@/hooks/useAuth";
import { TIERS, tierLabel, tierAtLeast, type Tier } from "@/lib/tier";
import { checkoutPath, LOGIN_PATH } from "@/constants/routes";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import Link from "next/link";

function TierCard({
  tier,
  price,
  features,
  current,
  ctaLabel,
  ctaHref,
  currentLabel,
}: {
  tier: Tier;
  price: string;
  features: string[];
  current?: boolean;
  ctaLabel: string;
  ctaHref?: string;
  currentLabel: string;
}) {
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
      <div className="mt-6">
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

export default function PricingPage() {
  const { user } = useAuth();
  const t = useMessages("pricing");

  const FEATURES: Record<Tier, string[]> = {
    FREE: t.featuresBasic,
    BASIC: t.featuresBasic,
    MEDIUM: t.featuresMedium,
    PREMIUM: t.featuresPro,
  };

  const PRICES: Record<Tier, string> = {
    FREE: t.priceFree,
    BASIC: t.priceBasic,
    MEDIUM: t.priceMedium,
    PREMIUM: t.pricePremium,
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1
          data-testid="page-heading"
          className="text-2xl font-semibold tracking-tight"
        >
          {t.heading}
        </h1>
        <p className="text-sm text-muted">
          {t.subtitle}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => {
          const isCurrent = tier === user?.tier;
          const hasAccess = user?.tier && tierAtLeast(user.tier, tier);
          const isUpgrade =
            user?.tier && !hasAccess && tier !== user.tier;

          return (
            <TierCard
              key={tier}
              tier={tier}
              price={PRICES[tier]}
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
                  ? checkoutPath(tier)
                  : !user
                    ? LOGIN_PATH
                    : undefined
              }
            />
          );
        })}
      </div>
    </div>
  );
}
