# PlanSummaryCard

**Source:** [`PlanSummaryCard.tsx`](../../../../../next-js-boilerplate/src/views/checkout/PlanSummaryCard.tsx)
**Used in:** [checkout page](../page.md)
**Mobile equivalent:** [PlanSummaryCard widget](../../../../mobile/v1/checkout/widgets/plan-summary-card.md)
(name matches, content/behavior differs — see below)

## Purpose

A read-only recap card at the top of checkout: target tier name, live price (or "Free"), and a
feature-bullet list. Purely presentational — no state, no API call of its own.

## Props (`PlanSummaryCardProps`)

| Prop | Purpose |
|---|---|
| `targetTier` | which tier's name/price/features to show |
| `currency` | passed straight to `formatPrice` |
| `priceCents` | resolved by the parent (`CheckoutContent`) from the live `planPrices` query, falling back to `TIER_PRICES_CENTS` — this component never fetches anything itself |

## ⚠ Feature copy is a third, independent, unlocalized source

Features come from
[`lib/checkout/tier-features.ts`](../../../../../next-js-boilerplate/src/lib/checkout/tier-features.ts)'s
`TIER_FEATURES` — a plain hardcoded `Record<string, string[]>`, always English, never routed through
`useMessages()`. This is textually **different** copy from both the
[plans page](../../plans/page.md)'s i18n-driven (and separately mis-mapped, see
[FE-013](../../../../issues.md#fe-013)) feature lists and mobile's own inline Dart feature
lists. Three independently-maintained tier-feature-copy sources across the app (four counting the
i18n bundle's own `featuresPro`/`featuresPremium` split) is the drift risk tracked as
[CROSS-031](../../../../issues.md#cross-031) — precedent:
[issues.md#cross-008](../../../../issues.md#cross-008) (hardcoded OAuth provider lists, same shape).

## Calls

None — pure presentational component, receives everything as props.
