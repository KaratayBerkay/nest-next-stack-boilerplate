# Checkout — API

Screen: [screen.md](./screen.md) · Client:
[`lib/api/client/billing/`](../../../../flutter-boilerplate/lib/api/client/billing/) · Server:
[`lib/api/server/billing/`](../../../../flutter-boilerplate/lib/api/server/billing/)

Same direct-to-backend model as [plans/api.md](../plans/api.md) — confirmed by reading both server
files below, both post a literal `/graphql` body, no Next.js involvement.

## Shape per file

| File | Shape | Path/operation | Backend endpoint |
|---|---|---|---|
| [`stripe.dart`](../../../../flutter-boilerplate/lib/api/server/billing/stripe.dart) | Direct GraphQL | `mutation CreateBillingSetupIntent` | [Create a billing setup intent](../../../backend/billing-usage/billing/endpoints.md#create-a-billing-setup-intent) |
| [`stripe.dart`](../../../../flutter-boilerplate/lib/api/server/billing/stripe.dart) (same file, `subscribe()`) | Direct GraphQL | `mutation SubscribeToPlan` | [Subscribe to a plan](../../../backend/billing-usage/billing/endpoints.md#subscribe-to-a-plan) — see [screen.md § Paid↔paid tier changes work correctly here](./screen.md#-paidpaid-tier-changes-work-correctly-here--confirmed-unlike-web) |
| [`plan_prices.dart`](../../../../flutter-boilerplate/lib/api/server/billing/plan_prices.dart) | Direct GraphQL | `query PlanPrices($currency: String)` | [Get plan prices](../../../backend/billing-usage/billing/endpoints.md#get-plan-prices) |

`subscription.dart` (`mySubscription`) exists in this same folder but has no caller on this screen —
confirmed via `screen.md`'s own read of `page_content.dart`, which never references
`subscriptionProvider`. This screen has no "current subscription" read of its own; it only reads live
prices and submits changes.

## Create a setup intent

`billingStateProvider.createSetupIntent()`
([`hooks/use_billing.dart`](../../../../flutter-boilerplate/lib/hooks/use_billing.dart)) →
`billingActionsProvider.createSetupIntent()`
([`api/client/billing/actions.dart`](../../../../flutter-boilerplate/lib/api/client/billing/actions.dart)) →
[`StripeServer.createSetupIntent()`](../../../../flutter-boilerplate/lib/api/server/billing/stripe.dart) →
backend [billing/endpoints.md#create-a-billing-setup-intent](../../../backend/billing-usage/billing/endpoints.md#create-a-billing-setup-intent).
Called from `_handleSubscribe()`.

## Subscribe / change / cancel a plan

`billingStateProvider.subscribe(tier, paymentMethodId:, idempotencyKey:, currency:)` → same
`billingActionsProvider`/`StripeServer` chain → `StripeServer.subscribe()` → backend
[billing/endpoints.md#subscribe-to-a-plan](../../../backend/billing-usage/billing/endpoints.md#subscribe-to-a-plan).
Called from both `_handleSubscribe()` (immediate, with `paymentMethodId` + a generated idempotency
key — `_generateIdempotencyKey()` builds a 32-hex-char random string, kept across a retry the same
way web's `retryKeyRef` is) and `_handleChange()` (scheduled/cancel, tier only — this is the call
that reaches the backend's paid↔paid logic correctly, see
[screen.md](./screen.md#-paidpaid-tier-changes-work-correctly-here--confirmed-unlike-web)).

## Get plan prices

Identical to [plans/api.md § Shape per file](../plans/api.md#shape-per-file) — same
`planPricesProvider`, re-keyed on `currencyProvider`.

## Not called from this screen

`address.dart`/`cancel.dart`/`payment_methods.dart`/`remove_payment_method.dart`/
`set_default_payment_method.dart` in `lib/api/server/billing/` all exist and are wired into
`billingActionsProvider`/`query.dart`, but belong to the
[`settings/billing` screen](../settings/billing/api.md) (Phase 4b).
