# PlanDetails / PlanDetailsActions

**Source:** [`PlanDetails.tsx`](../../../../../../next-js-boilerplate/src/views/settings/billing/PlanDetails.tsx),
[`PlanDetailsActions.tsx`](../../../../../../next-js-boilerplate/src/views/settings/billing/PlanDetailsActions.tsx)
**Used in:** [Billing page](../page.md), Plan tab (first card)
**Mobile equivalent:** [`_SubscriptionCard`](../../../../../mobile/v1/settings/billing/screen.md#what-renders-here)
(an inline private widget on mobile, not a standalone file)

Documented together — `PlanDetailsActions` is a pure button-row extracted from `PlanDetails` with no
independent state or fetch of its own.

## Purpose

Displays current tier, price, and (for paid tiers) either the renewal date or — if
`cancelAtPeriodEnd` — the date access actually ends. If a paid↔paid tier change is scheduled
(`pendingTier`/`pendingTierEffectiveAt` both set), shows a warning line naming the new tier and date.
`PlanDetailsActions` renders exactly one of three button states:

| State | Buttons shown |
|---|---|
| A tier change is pending | "Cancel pending change" only |
| `tier === FREE` | "Upgrade Plan" (→ `plansPath()`) only |
| Paid tier, nothing pending | "Upgrade Plan" + either "Cancel Subscription" (with a `ConfirmDialog`) or, if already `cancelAtPeriodEnd`, a static "cancels on…" note instead of a button |

## Props (`PlanDetailsProps`)

`tier`, `priceCents`, `currency`, `periodEnd`, `cancelAtPeriodEnd`, `pendingTier`,
`pendingTierEffectiveAt` — all sourced from `mySubscription` (see [api.md](../api.md)), passed through
verbatim from `FreePageView`.

## Calls

Two distinct mutations, both defined in `PlanDetails.tsx` itself (not extracted to a hook):

- **Cancel** (`handleCancel`) → dynamically imports
  [`cancelSubscriptionServer()`](../api.md#cancel-subscription) → GraphQL `cancelSubscription` — see
  [page.md § Cancel / downgrade — what actually happens](../page.md#cancel--downgrade--what-actually-happens)
  for the full server-side trace (this is **not** an immediate downgrade).
- **Cancel pending change** (`handleCancelPendingChange`) → `useBillingActions().subscribe(tier, ...,
  currentTier: tier)` — re-selects the *current* tier, which the backend treats as "release the
  scheduled change" rather than "subscribe" (see [page.md](../page.md) for why).

Both invalidate the `["subscription"]` query key on success so `PlanDetails` immediately reflects the
new state without a full reload.
