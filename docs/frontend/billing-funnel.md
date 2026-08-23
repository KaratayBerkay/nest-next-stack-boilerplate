# Billing funnel

The real path from "logged-in free user" to "active paid subscriber," across 4 pages — **not 5**. This
effort's own original plan assumed a 5-step funnel ending in `v1/premium`; Phase 4 found that's wrong
(see the correction below) and this doc reflects the verified, real shape instead.

## The real 4 steps

1. **[`(marketing)/pricing`](./pricing/page.md)** — public marketing entry point. **Currently broken
   for its actual audience**: it client-redirects straight to step 2 without ever rendering, and step
   2 requires a session — see [CROSS-029](../issues.md#cross-029). A logged-out visitor cannot
   complete this step today.
2. **[`v1/plans`](./v1/plans/page.md)** — the real plan-comparison page (session-gated). Fetches live
   prices from [`billing/endpoints.md#get-plan-prices`](../backend/billing-usage/billing/endpoints.md);
   feature-list *copy* is hardcoded separately here, in step 3, and on mobile — see
   [CROSS-031](../issues.md#cross-031).
3. **[`v1/checkout/[tier]`](./v1/checkout/page.md)** — payment collection (FREE→paid, via Stripe
   Elements) or a plan change (paid↔paid or paid→FREE, no payment form). **Paid↔paid changes are
   broken from this page** — see [CROSS-030](../issues.md#cross-030); only FREE→paid and paid→FREE
   currently work through it. Backend confirmation: [`billing/endpoints.md#subscribe-to-a-plan`](../backend/billing-usage/billing/endpoints.md),
   webhook-reconciled per [`billing/stripe.md`](../backend/billing-usage/billing/stripe.md).
4. **[`v1/settings/billing`](./v1/settings/billing/page.md)** — the ongoing subscription-management
   surface: current plan, billing history, payment methods, cancel. This is where a subscriber lands
   for every *future* billing action, not just the initial purchase.

## Correction to this effort's own original plan

The original Phase 4 plan (written in Phase 0, before any billing page was actually read) listed
`v1/premium` as funnel step 4, between checkout and settings/billing — presumably assumed to be a
post-purchase "you're premium now" status page. **Phase 4b verified this is wrong**: `v1/premium` is
an unrelated NestJS `@MinTier()`/RBAC tech demo (`AdminResolver.premiumStats`/`.growthStats`) that
happens to share nav placement with the real subscription pages — see
[CROSS-035](../issues.md#cross-035) for the full finding, already independently anticipated by Phase
1b's `authorization/endpoints.md`. It is documented at [`v1/premium/page.md`](./v1/premium/page.md)
as its own thing, not as part of this funnel.

## Cancel / downgrade, not a separate funnel

Cancelling and "downgrading to FREE" are the same server-side path
(`BillingService.handleFullCancellation`) — both set `cancelAtPeriodEnd: true`; access continues
until the paid period genuinely ends, then Stripe's `customer.subscription.deleted` webhook flips the
tier. A paid↔paid tier change instead defers via a Stripe subscription schedule to the next renewal.
The only *immediate* downgrade is involuntary — a failed renewal charge cuts access right away, no
grace period. Full detail in [`v1/settings/billing/page.md`](./v1/settings/billing/page.md).
