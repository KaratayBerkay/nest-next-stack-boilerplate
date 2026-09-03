"use client";

import { useQuery } from "@tanstack/react-query";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { tierLabel, type Tier } from "@/lib/tier";
import { useCurrencyCookie } from "@/hooks/useCurrencyCookie";
import { planPricesQueryOptions } from "@/api/client/billing/query";
import type {
  PlanPrice,
  TierFeatureDescriptor,
} from "@/api/server/billing/plan-prices";

const TIERS: Tier[] = ["FREE", "BASIC", "MEDIUM", "PREMIUM"];

/**
 * Translate one backend feature descriptor. Unknown keys (a backend newer
 * than this build) fall back to the raw key so nothing silently disappears.
 */
export function tierFeatureLabel(
  feature: TierFeatureDescriptor,
  labels: Record<string, string>,
): string {
  const template = labels[feature.key];
  if (!template)
    return feature.value ? `${feature.key}: ${feature.value}` : feature.key;
  const value =
    feature.key === "everythingIn" && feature.value
      ? tierLabel(feature.value)
      : (feature.value ?? "");
  return template.replace("{value}", value).replace("{tier}", value);
}

/** Pure mapping used by the hook and by tests: plan prices → per-tier label lists. */
export function featuresFromPlanPrices(
  prices: PlanPrice[] | undefined,
  labels: Record<string, string>,
  fallback: Record<Tier, string[]>,
): Record<Tier, string[]> {
  const out = { ...fallback };
  for (const tier of TIERS) {
    const row = prices?.find((p) => p.tier === tier);
    if (row?.features?.length) {
      out[tier] = row.features.map((f) => tierFeatureLabel(f, labels));
    }
  }
  return out;
}

// CROSS-031: single source of truth for "what each tier includes" is the
// backend (`planPrices { features { key value } }`, built from the same
// constants that enforce the limits). This hook only owns the *wording*:
// `pricing.featureLabels` maps each key to localized copy. The legacy
// `featuresFree/Basic/...` arrays are kept purely as the pre-fetch/SSR
// placeholder so the cards never render empty — they are not a second
// source of truth any more.
export function useTierFeatures(): Record<Tier, string[]> {
  const t = useMessages("pricing");
  const currency = useCurrencyCookie();
  const { data } = useQuery(planPricesQueryOptions(currency));
  const fallback: Record<Tier, string[]> = {
    FREE: t.featuresFree,
    BASIC: t.featuresBasic,
    MEDIUM: t.featuresMedium,
    PREMIUM: t.featuresPremium,
  };
  return featuresFromPlanPrices(
    data,
    (t as { featureLabels?: Record<string, string> }).featureLabels ?? {},
    fallback,
  );
}
