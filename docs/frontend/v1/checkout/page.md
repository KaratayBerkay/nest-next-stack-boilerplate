# Checkout (page)

**Route:** `/v1/[lang]/checkout/[tier]` (`tier` ∈ `free`|`basic`|`medium`|`premium`, lowercase in the
URL — mapped to the backend's uppercase `SubscriptionTier` enum client-side) ·
**Source:** [`page.tsx`](../../../../next-js-boilerplate/src/app/v1/[lang]/checkout/[tier]/page.tsx)
**Entry component:** [`CheckoutContent.tsx`](../../../../next-js-boilerplate/src/views/checkout/CheckoutContent.tsx)
**Mobile equivalent:** [checkout screen](../../../mobile/v1/checkout/screen.md)

## What renders here

Client component wrapped in a `<Suspense>` with
[`CheckoutLoadingFallback`](../../../../next-js-boilerplate/src/fallbacks/app/v1/[lang]/checkout/CheckoutLoadingFallback.tsx). Like
[plans](../plans/page.md), this route only ever renders for an already-authenticated visitor (the
`v1/[lang]` layout's session gate — see [pricing page.md](../../pricing/page.md)).

[`resolveChangeType(currentTier, targetTier)`](../../../../next-js-boilerplate/src/lib/checkout/plan-change.ts)
decides which of two entirely different UIs this page shows:

| `currentTier` | `targetTier` | Result | UI shown |
|---|---|---|---|
| `FREE` or absent | anything | `"immediate"` | [`StripeCardForm`](./components/stripe-card-form.md) — real charge, needs a card |
| paid | `FREE` | `"cancel"` | [`DowngradeSection`](./components/downgrade-section.md) — no card needed |
| paid | a *different* paid tier | `"scheduled"` | [`DowngradeSection`](./components/downgrade-section.md) — no card needed |

Both non-immediate cases funnel through the same `DowngradeSection` component — a slight misnomer
(mobile's equivalent widget uses the identical name for the identical reason, see
[mobile checkout screen.md](../../../mobile/v1/checkout/screen.md)) since `"scheduled"` also covers a
genuine **upgrade** between two paid tiers (e.g. BASIC → PREMIUM), not just a downgrade — the common
thread is "no immediate charge," not "the tier goes down."

[`PlanSummaryCard`](./components/plan-summary-card.md) renders above either branch, always showing
the target tier's live price (same `planPricesQueryOptions` query [plans](../plans/page.md) uses,
falling back to the same `TIER_PRICES_CENTS` placeholder). A successful submit of either branch shows
[`CheckoutSuccessView`](./components/checkout-success-view.md) and redirects to `/pricing` after a
delay (2s immediate, 2s cancel, 5s scheduled — the longer delay gives the user time to read the
"changes on \<date\>" message).

## ⚠ Paid↔paid tier changes are broken on web

See [CROSS-030](../../../issues.md#cross-030) for the full write-up (evidence, exact call
chain, severity). Summary: [`DowngradeSection`](./components/downgrade-section.md)'s submit handler
calls `subscribe(targetTier)` with **no `paymentMethodId` and no `currentTier`**. The BFF route this
hits ([`app/api/billing/subscribe/route.ts`](../../../../next-js-boilerplate/src/app/api/billing/subscribe/route.ts))
runs this check before ever contacting the backend:

```ts
const isUpgrade = ["BASIC", "MEDIUM", "PREMIUM"].includes(body.tier);
const isReSelection = body.tier === body.currentTier;
if (isUpgrade && !isReSelection && !body.paymentMethodId) {
  return 400 "Payment method required for upgrades";
}
```

`isUpgrade` is true for *any* paid target tier (not just a true upgrade-from-FREE), and
`isReSelection` can never be true from this call site since `currentTier` is never sent — so **every**
paid↔paid change attempted from this page (upgrade *or* downgrade between two paid tiers) 400s at the
BFF, before the backend's own correctly-implemented, fully-tested deferred-schedule logic
([billing/README.md](../../../backend/billing-usage/billing/README.md#subscribing-upgrading-downgrading-and-cancelling--one-mutation-three-branches))
is ever reached. Only two paths on this page actually work: a brand-new FREE→paid subscribe (via
`StripeCardForm`, which does supply `paymentMethodId`), and a downgrade-to-FREE (`targetTier === "FREE"`
makes `isUpgrade` false, so the check is skipped entirely). Confirmed **not** reproducible on mobile
— [Flutter's checkout screen](../../../mobile/v1/checkout/screen.md) calls the backend's GraphQL
mutation directly, with no equivalent BFF-side gate.

## Does checkout wait for the Stripe webhook, or assume success?

**Neither, and this is by design, not a race.** Traced the full chain from the client's submit
handler through to the database write:

1. [`StripeCardForm`](./components/stripe-card-form.md) confirms a **SetupIntent** client-side
   (`stripe.confirmSetup`) — this only saves and verifies a payment method, no charge yet.
2. It then calls [`subscribeToPlan`](../../../backend/billing-usage/billing/endpoints.md#subscribe-to-a-plan)
   and **awaits its response** — the UI shows "Processing…" the whole time, `onSuccess`/`onError` only
   fire once that mutation actually resolves. No optimistic "assume it worked" anywhere in this chain.
3. `subscribeToPlan` itself, synchronously within that one request, calls Stripe's real
   `subscriptions.create()` API and — if Stripe returns before throwing — **writes the tier change to
   Postgres and Redis in the same request**, before returning. The mutation's response *is* the
   authoritative confirmation; by the time the client sees `success: true`, the tier has genuinely
   already changed.
4. The `invoice.paid` webhook ([stripe.md](../../../backend/billing-usage/billing/stripe.md#invoicepaid))
   is **not** what activates the subscription — it's purely a later reconciliation step: it corrects
   the first ledger row's placeholder `amount: 0` to the real charged amount (see
   [BE-020](../../../issues.md#be-020)), and it's what actually clears `pendingTier` once a
   *scheduled* paid↔paid change eventually bills. `mySubscription`'s `tier`/`periodStart`/`periodEnd`
   are all set synchronously by the mutation itself, never dependent on the webhook having fired.

**What a delayed/failed webhook actually breaks, then**, is narrower than "checkout stops working":
the [billing-history](../../../backend/billing-usage/billing/endpoints.md#get-my-billing-history)
entry for that specific charge under-reports `$0.00` with no invoice link until the webhook
eventually reconciles it (or forever, if it never does) — see
[BE-020](../../../issues.md#be-020) — and a **scheduled** paid↔paid change's `pendingTier`
banner never clears until the renewal invoice's webhook lands, which is expected/inherent (there's
nothing to reconcile *to* until Stripe actually bills the new price).

## Components

4 significant components in
[`src/views/checkout/`](../../../../next-js-boilerplate/src/views/checkout/) (plus
[`StripeCardForm`](./components/stripe-card-form.md), which physically lives in
`src/features/billing/ui/`, documented here since this page is its only real caller):

[plan-summary-card.md](./components/plan-summary-card.md) ·
[stripe-card-form.md](./components/stripe-card-form.md) ·
[downgrade-section.md](./components/downgrade-section.md) ·
[checkout-success-view.md](./components/checkout-success-view.md)

## Hooks & API

No dedicated hook file exists for this vertical (same as [plans](../plans/page.md)) —
`useAuth()`, `useCurrencyCookie()`, `useMessages("checkout")` are all cross-cutting. See
[api.md](./api.md) for the full client/BFF/backend chain.

## Backend endpoints this page depends on

| Action | Backend doc |
|---|---|
| Create a Stripe SetupIntent | [billing/endpoints.md#create-a-billing-setup-intent](../../../backend/billing-usage/billing/endpoints.md#create-a-billing-setup-intent) |
| Subscribe / change / cancel | [billing/endpoints.md#subscribe-to-a-plan](../../../backend/billing-usage/billing/endpoints.md#subscribe-to-a-plan) |
| Live tier price | [billing/endpoints.md#get-plan-prices](../../../backend/billing-usage/billing/endpoints.md#get-plan-prices) |

## Known issues affecting this page

- ⚠ [CROSS-029](../../../issues.md#cross-029) (HIGH) — unreachable when logged out, same as
  [plans](../plans/page.md).
- ⚠ [CROSS-030](../../../issues.md#cross-030) (HIGH) — see above; paid↔paid changes broken on
  web only.
- ⚠ [CROSS-031](../../../issues.md#cross-031) (MED) — [`PlanSummaryCard`](./components/plan-summary-card.md)'s
  feature bullets are a third, unlocalized, independently-hardcoded copy of tier feature copy.
- ⚠ [BE-019](../../../issues.md#be-019) (LOW) — no UI recovery path for a Stripe
  `authentication_required` (3DS/SCA) decline on the actual subscription charge.
- ⚠ [FE-014](../../../issues.md#fe-014) (LOW) — the `subscribe` BFF route publishes a
  Kafka event unconditionally mislabeled `billing.subscription.upgraded`, even for a cancel/downgrade
  submitted from this same page.
