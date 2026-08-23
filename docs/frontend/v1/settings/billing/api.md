# Billing — API

Page: [page.md](./page.md) · Client:
[`src/api/client/billing/`](../../../../../next-js-boilerplate/src/api/client/billing/) · Server (BFF):
[`src/api/server/billing/`](../../../../../next-js-boilerplate/src/api/server/billing/)

Same three-layer BFF chain as every other web vertical in this doc set (browser → `api/client` hook →
`api/server/*.ts`, same-origin → `app/api/billing/**/route.ts`, the real BFF → NestJS GraphQL) — see
[messages/api.md](../../messages/api.md) for the fully-worked-out version. Every route below reads the
access-token cookie server-side and runs a GraphQL operation against
[`billing.resolver.ts`](../../../../../nest-js-boilerplate/src/billing/billing.resolver.ts), documented
in full at [backend billing/endpoints.md](../../../../backend/billing-usage/billing/endpoints.md) (a
parallel phase's module — read here only as far as this page's own contract requires; see
[page.md](./page.md) for the one place this doc goes further, tracing the cancel/downgrade logic).

## Client (`src/api/client/billing/`)

| File | Exports | Purpose |
|---|---|---|
| [`query.ts`](../../../../../next-js-boilerplate/src/api/client/billing/query.ts) | `subscriptionQueryOptions`, `planPricesQueryOptions`, `billingHistoryQueryOptions` | React Query option builders, all lazy-`import()` their matching `api/server` file |
| [`payment-methods.ts`](../../../../../next-js-boilerplate/src/api/client/billing/payment-methods.ts) | `paymentMethodsQueryOptions`, `useSetDefaultPaymentMethod()`, `useRemovePaymentMethod()` | The latter two are fully built `useMutation` hooks with correct cache invalidation — see ⚠ below |
| [`address.ts`](../../../../../next-js-boilerplate/src/api/client/billing/address.ts) | `billingAddressQueryOptions`, `useUpsertBillingAddress()` | |
| [`actions.ts`](../../../../../next-js-boilerplate/src/api/client/billing/actions.ts) | `useBillingActions()` → `{createSetupIntent, subscribe, cancelSubscription}` | Thin lazy-import wrappers, no React Query involvement |

### ⚠ Two fully-built mutation hooks with zero callers

`useSetDefaultPaymentMethod()` and `useRemovePaymentMethod()` (`payment-methods.ts`) are complete,
correctly-invalidating mutation hooks — and are never imported anywhere outside their own definition
file. [`PaymentMethods.tsx`](./components/payment-methods.md), the one component on this page that
could plausibly call them, doesn't. See ⚠ [CROSS-034](../../../../issues.md#cross-034).

`useBillingActions().createSetupIntent` **is** used, but not from this page — its only call site is
[`StripeCardForm.tsx`](../../../../../next-js-boilerplate/src/features/billing/ui/StripeCardForm.tsx),
rendered from the [checkout page](../../checkout/page.md), not from anything on this page — this page has no "add a card" UI at all (see
[PaymentMethods](./components/payment-methods.md)).

## Server / BFF routes (`src/api/server/billing/`)

Base URL constants live in
[`src/constants/api/urls.ts`](../../../../../next-js-boilerplate/src/constants/api/urls.ts)
(`BILLING_*`).

### Subscription

**Source:** [`subscription.ts`](../../../../../next-js-boilerplate/src/api/server/billing/subscription.ts) ·
`GET BILLING_SUBSCRIPTION_URL` (`/api/billing/subscription`) → route
[`app/api/billing/subscription/route.ts`](../../../../../next-js-boilerplate/src/app/api/billing/subscription/route.ts) →
backend [`mySubscription`](../../../../backend/billing-usage/billing/endpoints.md#get-my-subscription)
query. Returns `{tier, priceCents, currency, periodStart?, periodEnd?,
cancelAtPeriodEnd, pendingTier?, pendingTierEffectiveAt?}` or `null`.
**Used by:** [PlanDetails](./components/plan-details.md), and [page.md](./page.md) itself for the tier
fallback.

### Billing history

**Source:** [`history.ts`](../../../../../next-js-boilerplate/src/api/server/billing/history.ts) ·
`GET BILLING_HISTORY_URL` (`/api/billing/history`) → route
[`app/api/billing/history/route.ts`](../../../../../next-js-boilerplate/src/app/api/billing/history/route.ts) →
backend [`myBillingHistory`](../../../../backend/billing-usage/billing/endpoints.md#get-my-billing-history)
query → real, webhook-mirrored `WalletTransaction` rows (see
[InvoiceTable](./components/invoice-table.md#data-real-stripe-data-mirrored-locally--not-a-live-api-call)
for the full data-provenance note — **not** a live Stripe call).
**Used by:** [InvoiceTable](./components/invoice-table.md).

### Cancel subscription

**Source:** [`cancel.ts`](../../../../../next-js-boilerplate/src/api/server/billing/cancel.ts) ·
`POST BILLING_CANCEL_URL` (`/api/billing/cancel`) → route
[`app/api/billing/cancel/route.ts`](../../../../../next-js-boilerplate/src/app/api/billing/cancel/route.ts) →
backend [`cancelSubscription`](../../../../backend/billing-usage/billing/endpoints.md#cancel-a-subscription)
mutation. See
[page.md § Cancel / downgrade — what actually happens](./page.md#cancel--downgrade--what-actually-happens)
for the full server-side trace — **not** an immediate downgrade.
**Used by:** [PlanDetails](./components/plan-details.md) (`handleCancel`).

### Payment methods

**Source:** [`payment-methods.ts`](../../../../../next-js-boilerplate/src/api/server/billing/payment-methods.ts) ·
`GET BILLING_PAYMENT_METHODS_URL` (`/api/billing/payment-methods`) → route
[`app/api/billing/payment-methods/route.ts`](../../../../../next-js-boilerplate/src/app/api/billing/payment-methods/route.ts) →
backend [`myPaymentMethods`](../../../../backend/billing-usage/billing/endpoints.md#get-my-payment-methods) —
a **live Stripe API read** on every call, not cached/mirrored (see
[InvoiceTable](./components/invoice-table.md#data-real-stripe-data-mirrored-locally--not-a-live-api-call)
for the contrast with billing history). The same route also handles `POST` with `{action: "setDefault"
| "remove", paymentMethodId}`, dispatching to
[`setDefaultPaymentMethod`](../../../../backend/billing-usage/billing/endpoints.md#set-a-default-payment-method)/
[`removePaymentMethod`](../../../../backend/billing-usage/billing/endpoints.md#remove-a-payment-method) —
fully implemented and reachable via `curl`, just never called by this page's UI (see ⚠ above).
**Used by:** [PaymentMethods](./components/payment-methods.md) (`GET` only).

### Billing address

**Source:** [`address.ts`](../../../../../next-js-boilerplate/src/api/server/billing/address.ts) ·
`GET`/`POST BILLING_ADDRESS_URL` (`/api/billing/address`) → route
[`app/api/billing/address/route.ts`](../../../../../next-js-boilerplate/src/app/api/billing/address/route.ts) →
backend [`myBillingAddress`](../../../../backend/billing-usage/billing/endpoints.md#get-my-billing-address) query /
[`upsertBillingAddress`](../../../../backend/billing-usage/billing/endpoints.md#upsert-my-billing-address) mutation.
**Used by:** [BillingAddressForm / BillingInfoDisplay](./components/billing-address.md).

### Everything else (not used by this page)

| File | Backend op | Real caller |
|---|---|---|
| [`stripe.ts`](../../../../../next-js-boilerplate/src/api/server/billing/stripe.ts) | [`createBillingSetupIntent`](../../../../backend/billing-usage/billing/endpoints.md#create-a-billing-setup-intent) mutation, [`subscribeToPlan`](../../../../backend/billing-usage/billing/endpoints.md#subscribe-to-a-plan) mutation | [checkout page](../../checkout/page.md) — not this page |
| [`plan-prices.ts`](../../../../../next-js-boilerplate/src/api/server/billing/plan-prices.ts) | [`planPrices`](../../../../backend/billing-usage/billing/endpoints.md#get-plan-prices) query | [plans page](../../plans/page.md) — not this page |

## Calls

- [page.md](./page.md) (via `FreePageView`) → `subscriptionQueryOptions()`, `billingHistoryQueryOptions()`,
  `billingAddressQueryOptions()`, `useUpsertBillingAddress()` — all four files documented above except
  `stripe.ts`/`plan-prices.ts`.
