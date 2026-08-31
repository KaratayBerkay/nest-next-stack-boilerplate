# Checkout — API

Page: [page.md](./page.md) · Client: [`src/api/client/billing/`](../../../../next-js-boilerplate/src/api/client/billing/) ·
Server (BFF): [`src/api/server/billing/`](../../../../next-js-boilerplate/src/api/server/billing/)

Same three-layer chain as [plans/api.md](../plans/api.md) — every call below is same-origin
`apiFetchJson` against a Next.js Route Handler, which does the real server-to-server GraphQL call.
Nothing on this page ever calls the backend directly from the browser, and there is no WebSocket
involvement (contrast [messages](../messages/api.md), which prefers a direct WS send) — checkout is
BFF-proxied REST-shaped-over-GraphQL, full stop.

## Create a setup intent

`useBillingActions().createSetupIntent(tier)`
([`api/client/billing/actions.ts`](../../../../next-js-boilerplate/src/api/client/billing/actions.ts))
→ [`createSetupIntentServer(tier)`](../../../../next-js-boilerplate/src/api/server/billing/stripe.ts) —
`POST STRIPE_CREATE_SETUP_INTENT_URL`
→ [`app/api/billing/create-setup-intent/route.ts`](../../../../next-js-boilerplate/src/app/api/billing/create-setup-intent/route.ts) —
reads `access_token` cookie, runs `CreateBillingSetupIntent` mutation, no extra side effects
→ backend [billing/endpoints.md#create-a-billing-setup-intent](../../../backend/billing-usage/billing/endpoints.md#create-a-billing-setup-intent).
Called from [`StripeCardForm`](./components/stripe-card-form.md) on mount.

## Subscribe / change / cancel a plan

`useBillingActions().subscribe(tier, paymentMethodId?, idempotencyKey?, currentTier?, currency?)`
→ [`subscribeServer(...)`](../../../../next-js-boilerplate/src/api/server/billing/stripe.ts) —
`POST STRIPE_SUBSCRIBE_URL`
→ [`app/api/billing/subscribe/route.ts`](../../../../next-js-boilerplate/src/app/api/billing/subscribe/route.ts) —
the most involved BFF route on this page:
1. `401`s without an `access_token` cookie.
2. **The `isUpgrade`/`isReSelection`/`paymentMethodId` gate that breaks paid↔paid changes from this
   page** — see [page.md § Paid↔paid tier changes are broken on web](./page.md#-paidpaid-tier-changes-are-broken-on-web)
   and `CROSS-030` (resolved).
3. Runs `SubscribeToPlan` server-to-server, CSRF-echoed (`csrfEchoHeaders()`).
4. A GraphQL-level failure → `errBody.statusCode`; a GraphQL-level `success: false` → `402
   EX_BILLING_DECLINED` with `result.reason` as the message.
5. On success, **re-fetches `me`** and merges the fresh tier into the `session_user` cookie — without
   this, the account's own Plans/Pricing pages would keep showing the pre-upgrade tier until the next
   full login even though Postgres/Redis are already correct (the same bug class as the
   [auth module's session-hydration notes](../../../backend/identity-access/auth/README.md#session-model--four-token-compound-key-in-redis),
   just for `tier` instead of profile fields).
6. Unconditionally publishes a Kafka event (`billing.subscription.upgraded`, topic name literal
   regardless of whether this was actually an upgrade, a downgrade, or a cancel) via
   [`lib/kafka.ts`](../../../../next-js-boilerplate/src/lib/kafka.ts)`.publishEvent` — best-effort
   (no-ops entirely if `KAFKA_BROKER` is unset/`"disabled"`). See
   `FE-014` (resolved) — zero consumers of this topic exist anywhere in
   the current codebase, so this has no observed effect today, but the label is wrong for any
   non-upgrade outcome.

→ backend [billing/endpoints.md#subscribe-to-a-plan](../../../backend/billing-usage/billing/endpoints.md#subscribe-to-a-plan).
Called from [`StripeCardForm`](./components/stripe-card-form.md) (immediate path, with
`paymentMethodId`) and [`DowngradeSection`](./components/downgrade-section.md) (scheduled/cancel
path, tier only).

## Get plan prices

Identical to [plans/api.md § Get plan prices](../plans/api.md#get-plan-prices) — same client/server/
BFF/backend chain, called here by [`CheckoutContent`](./page.md) to price the
[`PlanSummaryCard`](./components/plan-summary-card.md).

## Not called from this page

`createBillingSetupIntent`'s sibling payment-method/address/history operations
(`myPaymentMethods`/`removePaymentMethod`/`setDefaultPaymentMethod`/`myBillingAddress`/
`upsertBillingAddress`/`myBillingHistory`) and the dedicated `cancelSubscription` mutation (this page
cancels via `subscribeToPlan(tier: FREE)` instead, not the dedicated mutation) all belong to the
[`settings/billing` page](../settings/billing/api.md) (Phase 4b).
