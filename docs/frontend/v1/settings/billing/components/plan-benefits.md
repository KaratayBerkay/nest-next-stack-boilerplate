# PlanBenefits

**Source:** [`PlanBenefits.tsx`](../../../../../../next-js-boilerplate/src/views/settings/billing/PlanBenefits.tsx)
**Used in:** [Billing page](../page.md), Plan tab (second card)
**Mobile equivalent:** [`_PlanBenefitsSection`](../../../../../mobile/v1/settings/billing/screen.md#what-renders-here)
(inline private widget, functionally identical logic re-implemented in Dart)

## Purpose

A collapsed-by-default accordion listing every feature the caller's current tier already includes
(check icon) plus every feature the *next* tier up would add (X icon, strikethrough) — a diff, not a
static per-tier list. Pure presentation; no data fetching of its own.

## Behavior

Walks `TIER_FEATURES` (from
[`lib/checkout/tier-features.ts`](../../../../../../next-js-boilerplate/src/lib/checkout/tier-features.ts) —
a Phase 4a-owned shared constant, read here but not documented here) from tier index `1` up to and
including `currentTierIndex`, de-duplicating by feature string across tiers (a feature introduced at
Basic still shows once, not once per tier it's part of). Then does the same for exactly one tier past
the current one, marking those `included: false`. A `PREMIUM`-tier caller therefore sees every feature
from Basic through Premium checked, and nothing struck through (there's no tier beyond Premium).

## Props (`PlanBenefitsProps`)

`currentTier` (a `Tier`), `className`.

## Calls

None — purely derived from the `TIER_FEATURES` constant and the `currentTier` prop, no network access.
