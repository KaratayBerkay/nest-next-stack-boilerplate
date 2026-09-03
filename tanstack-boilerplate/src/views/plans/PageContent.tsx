"use client";

import { use } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { PlansPageProps } from "@/types/plans/PlansPage-types";
import {
  TIERS,
  tierLabel,
  tierAtLeast,
  TIER_PRICES_CENTS,
  type Tier,
} from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { formatDateByPreference } from "@/lib/date-time";
import { useDateDisplayCookie } from "@/hooks/useDateDisplayCookie";
import { checkoutPath } from "@/constants/routes";
import { LOGIN_PATH } from "@/constants/routes";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import type { CurrencyCode } from "@/constants/currency";
import { PageInfoButton } from "@/components/ui/page-info";
import { plansPageInfo } from "@/constants/page-info";
import { cn } from "@/lib/cn";
import { useQuery } from "@tanstack/react-query";
import {
  subscriptionQueryOptions,
  planPricesQueryOptions,
} from "@/api/client/billing/query";
import { useTierFeatures } from "@/lib/checkout/tier-features";
import { TierCard } from "./TierCard";
import type { I18nMessages } from "@/generated/i18n-messages";

function buildTierCards(
  user: { tier?: string } | null,
  currency: CurrencyCode,
  priceCents: Record<Tier, number>,
  lang: string,
  FEATURES: Record<Tier, string[]>,
  t: I18nMessages["pricing"],
  pendingTier?: string,
  pendingTierEffectiveAt?: string,
) {
  const hasPendingChange = Boolean(pendingTier && pendingTierEffectiveAt);

  return TIERS.map((tier) => {
    const isCurrent = tier === user?.tier;
    const hasAccess = user?.tier && tierAtLeast(user.tier, tier);
    const isUpgrade = user?.tier && !hasAccess && tier !== user.tier;
    const changePending = Boolean(hasPendingChange && isUpgrade);
    // A lower PAID tier than the user's current one — reachable nowhere else
    // in the app (Settings only offers "Upgrade" or a full "Cancel
    // Subscription" to FREE). Downgrading to FREE stays a deliberate,
    // dedicated flow (cancellation), so it's excluded here; every other
    // step down reuses the same checkout route/CheckoutContent machinery
    // upgrades already use — it already resolves a lower target tier to a
    // scheduled downgrade (resolveChangeType), this was just never linked to.
    const isPaidDowngrade = Boolean(hasAccess) && !isCurrent && tier !== "FREE";

    return (
      <TierCard
        key={tier}
        tier={tier}
        price={formatPrice(priceCents[tier], currency, t.free as string)}
        features={FEATURES[tier]}
        current={isCurrent}
        currentLabel={t.currentPlan as string}
        ctaLabel={
          changePending
            ? (t.changePending as string)
            : isCurrent
              ? (t.currentPlan as string)
              : isPaidDowngrade
                ? (t.downgrade as string)
                : hasAccess
                  ? (t.included as string)
                  : (t.upgrade as string)
        }
        ctaHref={
          isUpgrade && user
            ? checkoutPath(tier, lang)
            : isPaidDowngrade
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

export default function PageContent({ params, className }: PlansPageProps) {
  const { lang } = use(params);
  const { user } = useAuth();
  const t = useMessages("pricing");
  const currency = useCurrencyCookie();
  const dateDisplay = useDateDisplayCookie();
  const { data: subData } = useQuery(subscriptionQueryOptions(user?.id));
  const { data: priceData } = useQuery(planPricesQueryOptions(currency));

  // Real per-currency amounts once loaded; TIER_PRICES_CENTS (USD cents,
  // stale as a currency-specific number) is just a same-shape placeholder
  // for the render before the query resolves, not a fallback source of truth.
  const priceCents: Record<Tier, number> = priceData
    ? (Object.fromEntries(
        priceData.map((p) => [p.tier, p.priceCents]),
      ) as Record<Tier, number>)
    : TIER_PRICES_CENTS;

  const pendingTier =
    (subData as { pendingTier?: string } | null)?.pendingTier ?? undefined;
  const pendingTierEffectiveAt =
    (subData as { pendingTierEffectiveAt?: string } | null)
      ?.pendingTierEffectiveAt ?? undefined;
  const hasPendingChange = Boolean(pendingTier && pendingTierEffectiveAt);

  const FEATURES = useTierFeatures();

  const tierCards = buildTierCards(
    user,
    currency,
    priceCents,
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
            .replace(
              "{date}",
              pendingTierEffectiveAt
                ? formatDateByPreference(pendingTierEffectiveAt, dateDisplay)
                : "",
            )}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tierCards}
      </div>
    </div>
  );
}
