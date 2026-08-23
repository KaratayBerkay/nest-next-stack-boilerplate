# Billing — API

Screen: [screen.md](./screen.md) · Client:
[`lib/api/client/billing/`](../../../../../flutter-boilerplate/lib/api/client/billing/) · Server:
[`lib/api/server/billing/`](../../../../../flutter-boilerplate/lib/api/server/billing/)

## Shape per file

Per [conventions.md § 9](../../../../conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement) —
every file this screen touches is **direct GraphQL to the backend**, zero Next.js involvement, same
shape family as [messages](../../messages/api.md) and [premium](../../premium/api.md):

| File | Shape | Operation | Backend endpoint |
|---|---|---|---|
| [`subscription.dart`](../../../../../flutter-boilerplate/lib/api/server/billing/subscription.dart) | Direct GraphQL | `query MySubscription` | [`mySubscription`](../../../../backend/billing-usage/billing/endpoints.md#get-my-subscription) |
| [`history.dart`](../../../../../flutter-boilerplate/lib/api/server/billing/history.dart) | Direct GraphQL | `query MyBillingHistory` | [`myBillingHistory`](../../../../backend/billing-usage/billing/endpoints.md#get-my-billing-history) |
| [`cancel.dart`](../../../../../flutter-boilerplate/lib/api/server/billing/cancel.dart) | Direct GraphQL | `mutation CancelSubscription` | [`cancelSubscription`](../../../../backend/billing-usage/billing/endpoints.md#cancel-a-subscription) |
| [`payment_methods.dart`](../../../../../flutter-boilerplate/lib/api/server/billing/payment_methods.dart) | Direct GraphQL | `query MyPaymentMethods` | [`myPaymentMethods`](../../../../backend/billing-usage/billing/endpoints.md#get-my-payment-methods) — a live Stripe read, not cached (same as web, see [web api.md](../../../../frontend/v1/settings/billing/api.md#payment-methods)) |
| [`remove_payment_method.dart`](../../../../../flutter-boilerplate/lib/api/server/billing/remove_payment_method.dart) | Direct GraphQL | `mutation RemovePaymentMethod($paymentMethodId)` | [`removePaymentMethod`](../../../../backend/billing-usage/billing/endpoints.md#remove-a-payment-method) — **used here**, unlike web (see ⚠ [CROSS-034](../../../../issues.md#cross-034)) |
| [`set_default_payment_method.dart`](../../../../../flutter-boilerplate/lib/api/server/billing/set_default_payment_method.dart) | Direct GraphQL | `mutation SetDefaultPaymentMethod($paymentMethodId)` | [`setDefaultPaymentMethod`](../../../../backend/billing-usage/billing/endpoints.md#set-a-default-payment-method) — **used here**, unlike web |
| [`stripe.dart`](../../../../../flutter-boilerplate/lib/api/server/billing/stripe.dart) | Direct GraphQL | `mutation CreateBillingSetupIntent`, `mutation SubscribeToPlan` | [`createBillingSetupIntent`](../../../../backend/billing-usage/billing/endpoints.md#create-a-billing-setup-intent) (used here, for the add-card dialog), [`subscribeToPlan`](../../../../backend/billing-usage/billing/endpoints.md#subscribe-to-a-plan) (used here, only for the cancel-pending-change escape hatch — see [screen.md](./screen.md)) |
| [`address.dart`](../../../../../flutter-boilerplate/lib/api/server/billing/address.dart) | Direct GraphQL | `query MyBillingAddress`, `mutation UpsertBillingAddress` | [`myBillingAddress`](../../../../backend/billing-usage/billing/endpoints.md#get-my-billing-address), [`upsertBillingAddress`](../../../../backend/billing-usage/billing/endpoints.md#upsert-my-billing-address) |

`plan_prices.dart` also exists in this folder but has no caller on this screen (used by the
[plans screen](../../plans/screen.md) instead).

## Client layer (`lib/api/client/billing/`)

- [`query.dart`](../../../../../flutter-boilerplate/lib/api/client/billing/query.dart) —
  `subscriptionProvider`, `billingHistoryProvider`, `paymentMethodsProvider` (all bare
  `FutureProvider`s), plus `planPricesProvider` (not used here).
- [`actions.dart`](../../../../../flutter-boilerplate/lib/api/client/billing/actions.dart) —
  `billingActionsProvider` → `BillingActions`, exposing `cancelSubscription()`, `updateAddress()`,
  `createSetupIntent()`, `subscribe()`, `removePaymentMethod()`, `setDefaultPaymentMethod()` — one
  provider backing every mutation this screen calls, unlike web's split across three separate files
  (`actions.ts`/`payment-methods.ts`/`address.ts`).

## Models — field-name renames, verified correct

- [`SubscriptionInfo`](../../../../../flutter-boilerplate/lib/api/server/billing/subscription.dart) —
  `status` is **not** a real backend field; it's derived client-side
  (`json['cancelAtPeriodEnd'] == true ? 'canceling' : 'active'`) from the one field the backend
  actually sends. Worth knowing if you're tracing a "status" value back to its source — it never came
  from Stripe or the database directly.
- [`Invoice`](../../../../../flutter-boilerplate/lib/api/server/billing/history.dart) — `pdfUrl`
  correctly reads the backend's `stripeInvoiceUrl` field (a rename, not a mismatch); `status` is passed
  through verbatim (always `'COMPLETED'` in practice — see the badge-color bug in
  [screen.md](./screen.md#-invoice-status-badge-always-shows-the-wrong-color)).

## Calls

- [screen.md](./screen.md) (via `page_view.dart`'s section widgets) → every file in the table above
  except `plan_prices.dart`.
