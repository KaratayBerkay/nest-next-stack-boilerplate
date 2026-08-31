"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { TIERS, TIER_PRICES_CENTS, type Tier } from "@/lib/tier";
import { formatPrice } from "@/lib/currency";
import { REGISTER_PATH, plansPath } from "@/constants/routes";
import { readLangCookie } from "@/lib/read-lang-cookie";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import { useTierFeatures } from "@/lib/checkout/tier-features";
import { planPricesQueryOptions } from "@/api/client/billing/query";
import { TierCard } from "@/views/plans/TierCard";

// Guest-facing marketing pricing page — unlike the authenticated
// `/v1/[lang]/plans` page (views/plans/PageContent.tsx), there's no signed-in
// user here: every tier's CTA points at registration rather than a checkout
// link, and there's no "current plan"/"pending change" state to render. A
// signed-in visitor is redirected to the real Plans page instead (the
// original behavior this page had before it lost its guest-facing content
// entirely — see CROSS-029), since that page can show their actual current
// tier/pending-change state, which this one deliberately can't.
// Reuses the same `planPrices` query (public since CROSS-029's backend fix)
// and the same consolidated tier-feature copy (useTierFeatures) so pricing
// shown here can never drift from what a signed-in user sees on Plans.
export default function PricingPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const t = useMessages("pricing");
  const currency = useCurrencyCookie();
  const features = useTierFeatures();
  const { data: priceData } = useQuery(planPricesQueryOptions(currency));

  useEffect(() => {
    if (user) router.replace(plansPath(readLangCookie()));
  }, [user, router]);

  if (authLoading || user) return null;

  const priceCents: Record<Tier, number> = priceData
    ? (Object.fromEntries(
        priceData.map((p) => [p.tier, p.priceCents]),
      ) as Record<Tier, number>)
    : TIER_PRICES_CENTS;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t.heading}</h1>
        <p className="text-muted text-sm">{t.guestSubtitle}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => (
          <TierCard
            key={tier}
            tier={tier}
            price={formatPrice(priceCents[tier], currency, t.free)}
            features={features[tier]}
            currentLabel={t.currentPlan}
            ctaLabel={t.getStarted}
            ctaHref={REGISTER_PATH}
          />
        ))}
      </div>
    </div>
  );
}
