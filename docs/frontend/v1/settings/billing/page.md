# Billing (page)

**Route:** `/v1/[lang]/settings/billing` · **Source:** [`page.tsx`](../../../../../next-js-boilerplate/src/app/v1/[lang]/settings/billing/page.tsx)
**Mobile equivalent:** [settings/billing screen](../../../../mobile/v1/settings/billing/screen.md)
**Settings index:** [../README.md](../README.md) (row updated by this doc — see that file's own note)

This is the real "manage my existing subscription" page — not to be confused with
[premium](../../premium/page.md), a same-nav-bar but functionally unrelated page (see that page's own
warning). This one is genuinely about the caller's own plan, invoices, payment methods, and billing
address.

## What renders here

`getTierView()`, but all four tier files resolve to the identical component — no real tier
differentiation:

```ts
// BasicPageView.tsx / MediumPageView.tsx / PremiumPageView.tsx, verbatim:
export { FreePageView as default } from "./FreePageView";
```

[`FreePageView.tsx`](../../../../../next-js-boilerplate/src/views/settings/billing/FreePageView.tsx)
owns everything: three `useQuery` calls (subscription, billing history, billing address) plus one
`useState` for the address-form's edit/view toggle. Renders a two-tab layout
(`Tabs`/`TabsList`/`TabsContent`):

```
FreePageView
├─ Tab: Plan
│   ├─ PlanDetails       (current tier, price, renewal/cancellation date, cancel/upgrade actions)
│   ├─ PlanBenefits      (collapsed-by-default accordion diffing this tier's features vs. the next)
│   ├─ PaymentMethods    (list only — see Known issues)
│   └─ BillingAddressForm  ⇄  BillingInfoDisplay   (toggled by isEditingAddress)
└─ Tab: Invoices
    └─ InvoiceTable      (paginated, 5/page, via InvoicePagination)
```

`tier` for `PlanDetails`/`PlanBenefits` is taken from `subscription?.tier` first, falling back to
`user.tier` (the session snapshot) only if the subscription query hasn't resolved yet — the two should
always agree in steady state (both ultimately derive from the same `User.subscriptionTier` column),
but the subscription query is the fresher of the two since it isn't tied to session-refresh timing.

## Cancel / downgrade — what actually happens

Traced end-to-end against
[`billing.service.ts`](../../../../../nest-js-boilerplate/src/billing/billing.service.ts) (read-only —
the `billing` module itself is a parallel phase's territory, not documented here beyond what this page
needs):

- **"Cancel Subscription"** ([PlanDetailsActions](./components/plan-details.md)) calls the dedicated
  `cancelSubscriptionServer()` → GraphQL `cancelSubscription` mutation →
  `BillingService.cancelSubscription()` → the same private `handleFullCancellation()` method
  `subscribeToPlan(FREE)` also routes through. **This is not an immediate downgrade** — it sets
  `cancelAtPeriodEnd: true` right away (tells Stripe `cancel_at_period_end: true`, not an immediate
  cancel) and the user keeps their current tier/access until the paid period genuinely ends. The
  tier only actually flips to `FREE` when Stripe's `customer.subscription.deleted` webhook lands
  (`StripeWebhookController.handleSubscriptionDeleted`).
- **A failed renewal charge is treated differently and much more harshly**: Stripe's
  `invoice.payment_failed` webhook (`handleInvoiceFailed`) downgrades the user to `FREE`
  **immediately** (no grace period) — a distinct, involuntary "dunning" policy from the graceful,
  voluntary cancel above. Not reachable from this page directly; noted here since it's the same
  underlying tier field this page displays.
- **"Cancel pending change"** (only shown when `pendingTier`/`pendingTierEffectiveAt` are set — i.e. a
  paid↔paid tier switch is scheduled for next renewal) re-calls `subscribeToPlan` with the tier the
  user is *already on*. Re-selecting your current tier while a change is pending is a deliberate
  escape hatch (`BillingService.releasePendingChange`) that releases the Stripe subscription schedule
  and clears the pending fields — it does **not** cancel the subscription itself.
- **There is no "downgrade to a different paid tier" action on this page at all** — the only paid-tier
  destination this page links to is `plansPath()`, the [plans page](../../plans/page.md). Its
  "select a lower tier" action presumably calls the same `subscribeToPlan` mutation directly,
  but that page's client code is a different phase's territory — flagged, not assumed.

In short: **cancel and "downgrade to FREE" are the exact same server-side code path** regardless of
which UI button triggers it, and neither is immediate — both honor the remaining paid period. Only an
involuntary payment failure downgrades immediately.

## Known issues affecting this page

- ⚠ [CROSS-034](../../../../issues.md#cross-034) —
  [PaymentMethods](./components/payment-methods.md) here is **read-only**: no add/remove/set-default
  action anywhere, despite the backend and even this app's own client hooks
  (`useRemovePaymentMethod`/`useSetDefaultPaymentMethod`, see [api.md](./api.md)) already existing,
  fully wired, completely unused. [Mobile's equivalent screen](../../../../mobile/v1/settings/billing/screen.md)
  has a working add/remove/set-default flow — a rare case in this doc effort of mobile being ahead of
  web.
- ⚠ [FE-015](../../../../issues.md#fe-015) —
  [BillingAddressForm](./components/billing-address.md)'s "Cancel" button reuses the
  `cancelSubscription` translation key, so it visibly reads "Cancel subscription" instead of "Cancel."
- Usage/quota data (storage used, message limits) does **not** appear anywhere on this page — see the
  dedicated [settings/usage page](../usage/page.md) for where that actually lives.
