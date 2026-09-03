# Billing — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/billing/`](../../../../nest-js-boilerplate/src/billing/) ·
Webhook detail: [stripe.md](./stripe.md)

## GraphQL

Resolver: [`billing.resolver.ts`](../../../../nest-js-boilerplate/src/billing/billing.resolver.ts) ·
**class-level `SessionAuthGuard`** — every operation below requires a full logged-in session, with no
exception (see [README.md § What this module owns](./README.md#what-this-module-owns) and ⚠
`CROSS-029` (resolved)). All service logic is delegated to
[`BillingService`](../../../../nest-js-boilerplate/src/billing/billing.service.ts) — a single flat
service, not a facade over sub-services (contrast [auth](../../identity-access/auth/endpoints.md)).

### Subscribe to a plan

**Kind:** GraphQL Mutation ·
**`subscribeToPlan(tier: SubscriptionTier!, paymentMethodId: String, idempotencyKey: String, currency: String): SubscribeResult!`**
**Source:** [`billing.resolver.ts#L184-L209`](../../../../nest-js-boilerplate/src/billing/billing.resolver.ts),
logic in [`billing.service.ts#L80-L131`](../../../../nest-js-boilerplate/src/billing/billing.service.ts) (`BillingService.subscribeToPlan`)
**Response:** `SubscribeResult` — `success`, optional `reason` (a machine-readable string, not an
`exc` code — see Errors below), optional `periodEnd`, optional `pendingTier`/`pendingTierEffectiveAt`
(only ever populated by the paid↔paid schedule path, or explicitly nulled by the "cancel my pending
change" escape hatch — every other branch leaves them `undefined`).
**Behavior:** the single mutation behind every subscribe/upgrade/downgrade/cancel-via-reselect
action. Branches on `(currentTier, targetTier)` — full state-machine detail in
[README.md § Subscribing, upgrading, downgrading, and cancelling](./README.md#subscribing-upgrading-downgrading-and-cancelling--one-mutation-three-branches):
- Same tier requested again: `BadRequestException("Already on this tier")` — **unless** a
  `pendingTier` is already set to that exact tier, in which case this is the "never mind, cancel my
  scheduled change" escape hatch (releases the Stripe schedule, clears `pendingTier`/
  `pendingTierEffectiveAt`, `reason: 'pending_change_cancelled'`). The **only** real call site that
  ever exercises this escape hatch today is the `settings/billing` page's "cancel pending change"
  button ([web: PlanDetails](../../../frontend/v1/settings/billing/components/plan-details.md),
  [mobile: settings/billing screen](../../../mobile/v1/settings/billing/screen.md) — both Phase 4b,
  out of this pass's scope to document in depth), which explicitly passes its own current tier as a
  distinct 4th argument the mutation doesn't have (see below) — the frontend/mobile layers reconstruct
  "is this a re-selection" themselves before calling.
- `FREE → paid`: real charge now. Requires `paymentMethodId` (`BadRequestException` without one).
  Advisory-locked per user; dedupes via `idempotencyKey`.
- `paid → FREE`: `cancel_at_period_end: true`, no immediate charge, access continues to period end.
- `paid → paid` (either direction): deferred to the next renewal via a Stripe Subscription Schedule,
  no charge/credit now, no `paymentMethodId` needed or accepted.
**Errors:** `400 "Already on this tier"` (plain `BadRequestException`, no `exc` code) ·
`400 "paymentMethodId required for upgrades"` (FREE→paid with no payment method) · on a Stripe
decline, `success: false` with a `reason` string (`insufficient_funds` / `declined` /
`subscription_failed` / `configuration_error` / `subscription_schedule_failed`) — **not** thrown, the
mutation resolves normally and the caller must check `result.success`. ⚠
`BE-019` (resolved — fixed 2026-09-03: subscriptions are created with `payment_behavior: allow_incomplete`; an `authentication_required` outcome carries the PaymentIntent `clientSecret` + `stripeSubscriptionId`, the client completes 3DS (Stripe.js `confirmCardPayment` / flutter_stripe `handleNextAction`) and calls the new `finalizeSubscription` mutation, and decline reasons map to readable copy on every client) — an `authentication_required` (3DS/SCA) decline isn't
distinguished from a generic decline; see [stripe.md § Known issues](./stripe.md#known-issues).
**Used by:** Frontend [checkout page](../../../frontend/v1/checkout/page.md) (`StripeCardForm` for
FREE→paid; `DowngradeSection` for paid↔paid and paid→FREE — see ⚠
`CROSS-030` (resolved), the paid↔paid path is currently broken **on web
only**, blocked by the Next.js BFF before this mutation is ever reached); Mobile
[checkout screen](../../../mobile/v1/checkout/screen.md) (`_handleSubscribe` for FREE→paid,
`_handleChange` for paid↔paid/paid→FREE — calls this mutation directly, unaffected by
CROSS-030); Frontend/Mobile `settings/billing` (Phase 4b) — the re-selection escape hatch only.

### Finalize a subscription after 3DS (added 2026-09-03, `BE-019`)

**Kind:** GraphQL Mutation · **`finalizeSubscription(stripeSubscriptionId: String!): SubscribeResult!`**
**Source:** `billing.resolver.ts` → `BillingService.finalizeSubscription`.

`subscribeToPlan` now creates the Stripe subscription with `payment_behavior: allow_incomplete`. When
the bank requires customer authentication, the mutation returns `success: false,
reason: "authentication_required"` **plus** `clientSecret` (the first invoice's PaymentIntent) and
`stripeSubscriptionId`; nothing is provisioned yet, and the finalize context is parked in Redis
(`billing:sca:<subscriptionId>`, 24h, bound to the user). The client confirms the PaymentIntent
on-session (Stripe.js `confirmCardPayment` on web via `/api/billing/subscribe` → `/api/billing/subscribe/finalize`,
flutter_stripe `handleNextAction` on mobile) and calls this mutation. The backend re-reads the
subscription; if it is `active` it provisions exactly as the first-subscribe path would (same
advisory lock, same ledger row keyed by the invoice, tier rewrite, realtime + notification). If
Stripe still reports `incomplete` the same `authentication_required` payload comes back; a hard
decline maps to `insufficient_funds` / `declined`. **Errors:** `404 EX_BILLING_NO_PENDING_SUBSCRIPTION`
when no parked context exists for this user + subscription.

### Cancel a subscription

**Kind:** GraphQL Mutation · **`cancelSubscription: Boolean!`**
**Source:** [`billing.resolver.ts#L301-L305`](../../../../nest-js-boilerplate/src/billing/billing.resolver.ts),
logic in [`billing.service.ts#L747-L757`](../../../../nest-js-boilerplate/src/billing/billing.service.ts) (`BillingService.cancelSubscription`)
**Behavior:** a dedicated wrapper that throws plain `Error`s (`"User not found"` /
`"No active subscription"`) instead of returning a result object, then delegates to the exact same
`handleFullCancellation` that `subscribeToPlan(tier: FREE)` uses — same ledger row shape, same outbox
event, same notification, regardless of which mutation triggered it.
**Errors:** `500` (both failure cases are plain `Error`, not a `BadRequestException`/`exc`-coded
error — a caller sees a generic message either way).
**Used by:** not called by any page in this pass's scope (pricing/plans/checkout never cancel this
way — cancelling from the checkout page goes through `subscribeToPlan(tier: FREE)` above instead,
since navigating to `/checkout/free` is how this codebase's UI models "downgrade to Free"). Frontend
[settings/billing § Cancel / downgrade](../../../frontend/v1/settings/billing/page.md#cancel--downgrade--what-actually-happens)
(`PlanDetails`'s dedicated "Cancel subscription" button, `handleCancel`) — that doc traces this exact
mutation's full server-side path and confirms it's the same `handleFullCancellation` branch as
`subscribeToPlan(tier: FREE)` above; Mobile
[settings/billing screen](../../../mobile/v1/settings/billing/screen.md) (same action).

### Get my subscription

**Kind:** GraphQL Query · **`mySubscription: SubscriptionInfo`** (nullable)
**Source:** [`billing.resolver.ts#L229-L242`](../../../../nest-js-boilerplate/src/billing/billing.resolver.ts),
logic in [`billing.service.ts#L775-L823`](../../../../nest-js-boilerplate/src/billing/billing.service.ts) (`BillingService.getSubscription`)
**Response:** `SubscriptionInfo` — `tier`, `priceCents`, `currency`, optional `periodStart`/
`periodEnd`, `cancelAtPeriodEnd`, optional `pendingTier`/`pendingTierEffectiveAt`.
**Behavior:** `priceCents`/`currency` are read off the **live Stripe subscription object** when one
exists (`stripeService.getSubscription`) — the real amount actually being charged, which can differ
from a tier's default price if the subscriber picked a non-default currency at subscribe time. Falls
back to the tier's canonical default-currency Price only when there's no live subscription (FREE, or
an admin-set tier with no real Stripe backing). `periodStart`/`periodEnd`/`cancelAtPeriodEnd`/
`pendingTier*` always come from local Postgres fields, set synchronously by `subscribeToPlan` itself
— **not** dependent on any webhook having fired yet (see [stripe.md](./stripe.md) for what genuinely
does depend on the webhook).
**Used by:** Frontend [plans page](../../../frontend/v1/plans/page.md) (pending-change banner);
Mobile — not called by the [plans screen](../../../mobile/v1/plans/screen.md) (which only reads
`userTierProvider`, a session-derived value, not this query) or the
[checkout screen](../../../mobile/v1/checkout/screen.md) directly. Frontend
[settings/billing](../../../frontend/v1/settings/billing/api.md#subscription) (the primary
subscription-details panel, `PlanDetails`/`PlanBenefits`); Mobile
[settings/billing](../../../mobile/v1/settings/billing/api.md#shape-per-file) (`subscription.dart`).

### Get plan prices

**Kind:** GraphQL Query · **`planPrices(currency: String): [PlanPriceInfo!]!`**

**Since 2026-09-03 (`CROSS-031`)** each `PlanPriceInfo` also carries `features: [TierFeatureInfo!]!`
(`{ key, value }`) — the canonical "what's included" list per tier from `billing/tier-features.ts`,
with numeric perks (`callMinutes`, `storageMultiplier`) derived from the constants that enforce
them. Clients translate `key` (web `pricing.featureLabels`, Flutter `pricingFeature*`) and never
keep their own list.
**Source:** [`billing.resolver.ts#L244-L249`](../../../../nest-js-boilerplate/src/billing/billing.resolver.ts),
logic in [`billing.service.ts#L833-L854`](../../../../nest-js-boilerplate/src/billing/billing.service.ts) (`BillingService.getPlanPrices`)
**Response:** `[PlanPriceInfo]` — one entry per tier (`FREE`, `BASIC`, `MEDIUM`, `PREMIUM`), each
`{tier, priceCents, currency}`.
**Behavior:** `currency` is normalized (unrecognized/omitted → `USD`, see
[README.md § Currencies](./README.md#currencies)), then each tier's live Stripe Price is read via
[`StripeService.getPriceInfoForTier`](./stripe.md#prices-and-currency) (in-memory cached) — **the
single real source of truth for what a tier costs**, not a hand-maintained cents table. Every
client-side "price" constant in this codebase (web's `TIER_PRICES_CENTS`, mobile's ARB
`pricingPriceX` strings) is explicitly a same-shape **loading placeholder only**, shown before this
query resolves, not a fallback source of truth — confirmed by reading both call sites (see
[frontend plans page.md](../../../frontend/v1/plans/page.md) and
[mobile plans screen.md](../../../mobile/v1/plans/screen.md)).
**Behind the same guard as everything else in this resolver** — see ⚠
`CROSS-029` (resolved): there is no way for a not-yet-authenticated visitor
to fetch a real price from this backend at all, anywhere, today.
**Used by:** Frontend [plans page](../../../frontend/v1/plans/page.md),
[checkout page](../../../frontend/v1/checkout/page.md); Mobile
[plans screen](../../../mobile/v1/plans/screen.md), [checkout screen](../../../mobile/v1/checkout/screen.md).

### Get my billing history

**Kind:** GraphQL Query · **`myBillingHistory: [BillingTransaction!]!`**
**Source:** [`billing.resolver.ts#L211-L227`](../../../../nest-js-boilerplate/src/billing/billing.resolver.ts),
logic in [`billing.service.ts#L759-L773`](../../../../nest-js-boilerplate/src/billing/billing.service.ts) (`BillingService.getBillingHistory`)
**Response:** up to 50 most-recent `WalletTransaction` rows, `{id, type, status, amount, currency,
reference, stripeInvoiceUrl?, metadata?, createdAt}` — `amount`/`metadata` are coerced
(`Number(...)`/`JSON.stringify(...)`) since Prisma's `Decimal`/`Json` types aren't directly
GraphQL-representable.
**Behavior:** filtered to `type: 'FEE'` rows only, `reference` starting with `subscription:` — the
zero-amount `ADJUSTMENT` rows written for scheduled cancellations/tier changes are deliberately
excluded here (they're internal bookkeeping, surfaced to the user via `pendingTier`/
`cancelAtPeriodEnd` on `mySubscription` instead, not as a fake "invoice"). See ⚠
`BE-020` (resolved) — the first `FEE` row for a brand-new subscription is
written with `amount: 0` synchronously by `subscribeToPlan` itself and only corrected to the real
charged amount once the `invoice.paid` webhook reconciles it; if that webhook is delayed or never
arrives, this query keeps returning `$0.00` (and no `stripeInvoiceUrl`) for a charge that genuinely
happened.
**Used by:** not called by any page in this pass's scope. Frontend
[InvoiceTable](../../../frontend/v1/settings/billing/components/invoice-table.md) (the
invoices/billing-history tab — that doc's own note confirms these are real, webhook-mirrored rows,
not a live Stripe call); Mobile
[settings/billing](../../../mobile/v1/settings/billing/api.md#shape-per-file) (`history.dart`).

### Create a billing setup intent

**Kind:** GraphQL Mutation · **`createBillingSetupIntent: SetupIntentResult!`**
**Source:** [`billing.resolver.ts#L251-L257`](../../../../nest-js-boilerplate/src/billing/billing.resolver.ts),
logic in [`billing.service.ts#L856-L878`](../../../../nest-js-boilerplate/src/billing/billing.service.ts) (`BillingService.createSetupIntent`)
**Response:** `{clientSecret}` — a Stripe `SetupIntent` client secret, handed to Stripe.js/
`flutter_stripe` client-side to collect and verify a card **without the backend ever seeing raw card
data**. Creates the Stripe `Customer` first if the user doesn't have one yet.
**Behavior:** this is the step that happens *before* `subscribeToPlan` on a FREE→paid checkout — the
client confirms this SetupIntent (handling any 3DS challenge for the setup itself), gets back a
`payment_method` id, then passes that id as `subscribeToPlan`'s `paymentMethodId`. See
[README.md § Payment provider abstraction](./README.md#the-payment-provider-abstraction--one-implementation-today)
for why this bypasses the `PaymentProvider` interface and calls `StripeService` directly.
**Used by:** Frontend [checkout page](../../../frontend/v1/checkout/page.md) (`StripeCardForm`);
Mobile [checkout screen](../../../mobile/v1/checkout/screen.md) (`_handleSubscribe`, via
`billingStateProvider.createSetupIntent()`).

### Get my payment methods

**Kind:** GraphQL Query · **`myPaymentMethods: [PaymentMethodInfo!]!`**
**Source:** [`billing.resolver.ts#L259-L264`](../../../../nest-js-boilerplate/src/billing/billing.resolver.ts),
logic in [`billing.service.ts#L880-L912`](../../../../nest-js-boilerplate/src/billing/billing.service.ts) (`BillingService.getPaymentMethods`)
**Response:** `[]` if the user has no Stripe customer yet; otherwise every saved card
`{id, brand, last4, expMonth, expYear, isDefault}`, cross-referenced against the customer's
`invoice_settings.default_payment_method` to flag the default one.
**Used by:** not called by any page in this pass's scope. Frontend
[PaymentMethods](../../../frontend/v1/settings/billing/components/payment-methods.md) (the saved-cards
list — **read-only** on web, see ⚠ below); Mobile
[settings/billing](../../../mobile/v1/settings/billing/api.md#shape-per-file) (`payment_methods.dart`).

### Remove a payment method

**Kind:** GraphQL Mutation · **`removePaymentMethod(paymentMethodId: String!): Boolean!`**
**Source:** [`billing.resolver.ts#L266-L273`](../../../../nest-js-boilerplate/src/billing/billing.resolver.ts),
logic in [`billing.service.ts#L933-L945`](../../../../nest-js-boilerplate/src/billing/billing.service.ts) (`BillingService.removePaymentMethod`)
**Behavior:** calls `assertOwnsPaymentMethod` first (see below) before detaching — Stripe's own
detach API takes only the payment-method id with no customer-scoping, so this ownership check is the
only thing stopping one authenticated user from detaching a *different* user's card if they ever
obtained its `pm_...` id.
**Errors:** `400 "No Stripe customer"` · `403 "Payment method does not belong to this customer"`
(`ForbiddenException`, from `assertOwnsPaymentMethod`).
**Used by:** not called by any page in this pass's scope. Frontend — fully BFF-proxied
(`useRemovePaymentMethod()`) but **never called from any UI**, per
[settings/billing page.md § Known issues](../../../frontend/v1/settings/billing/page.md#known-issues-affecting-this-page)
(that doc's own finding, not this pass's); Mobile
[settings/billing screen](../../../mobile/v1/settings/billing/screen.md) — genuinely used (`_removeMethod`),
a rare case of mobile ahead of web for the same feature.

### Set a default payment method

**Kind:** GraphQL Mutation · **`setDefaultPaymentMethod(paymentMethodId: String!): Boolean!`**
**Source:** [`billing.resolver.ts#L275-L282`](../../../../nest-js-boilerplate/src/billing/billing.resolver.ts),
logic in [`billing.service.ts#L947-L962`](../../../../nest-js-boilerplate/src/billing/billing.service.ts) (`BillingService.setDefaultPaymentMethod`)
**Behavior:** same `assertOwnsPaymentMethod` ownership check as `removePaymentMethod` before calling
`stripe.customers.update(..., {invoice_settings: {default_payment_method}})`.
**Errors:** same two as `removePaymentMethod`.
**Used by:** not called by any page in this pass's scope. Frontend — same as `removePaymentMethod`
above, fully wired but unused; Mobile
[settings/billing screen](../../../mobile/v1/settings/billing/screen.md) — used (`_setDefault`).

### Get my billing address

**Kind:** GraphQL Query · **`myBillingAddress: BillingAddressInfo`** (nullable)
**Source:** [`billing.resolver.ts#L284-L299`](../../../../nest-js-boilerplate/src/billing/billing.resolver.ts),
logic in [`billing.service.ts#L964-L968`](../../../../nest-js-boilerplate/src/billing/billing.service.ts) (`BillingService.getBillingAddress`)
**Response:** `{name?, street?, city?, state?, country?, zipCode?, vatNumber?}` or `null` if never set
— a plain `BillingAddress` row keyed 1:1 on `userId`, entirely separate from Stripe (no
`customer.address` involved).
**Used by:** not called by any page in this pass's scope. Frontend
[BillingAddressForm / BillingInfoDisplay](../../../frontend/v1/settings/billing/components/billing-address.md);
Mobile [BillingAddressForm widget](../../../mobile/v1/settings/billing/widgets/billing-address-form.md).

### Upsert my billing address

**Kind:** GraphQL Mutation · **`upsertBillingAddress(input: BillingAddressInput!): BillingAddressInfo!`**
**Source:** [`billing.resolver.ts#L307-L322`](../../../../nest-js-boilerplate/src/billing/billing.resolver.ts),
logic in [`billing.service.ts#L970-L987`](../../../../nest-js-boilerplate/src/billing/billing.service.ts) (`BillingService.upsertBillingAddress`)
**Behavior:** plain Prisma `upsert` on `BillingAddress.userId` — every field optional, no validation
beyond the DTO's own (all fields plain optional strings, no format/country-code checking).
**Used by:** not called by any page in this pass's scope. Frontend
[BillingAddressForm / BillingInfoDisplay](../../../frontend/v1/settings/billing/components/billing-address.md);
Mobile [BillingAddressForm widget](../../../mobile/v1/settings/billing/widgets/billing-address-form.md).

## REST

### Receive Stripe webhook events

**Kind:** REST · **`POST /stripe/webhook`**
**Source:** [`stripe-webhook.controller.ts#L28-L101`](../../../../nest-js-boilerplate/src/billing/stripe-webhook.controller.ts)
**Auth:** none via `SessionAuthGuard` — authenticated entirely by Stripe's own HMAC signature
(`stripe-signature` header, verified against `STRIPE_WEBHOOK_SECRET`). Full signature-verification,
idempotency, event-catalogue, and security detail (throttling, ledger-accuracy implications) is in
[stripe.md](./stripe.md) — documented there rather than here given its complexity and security
sensitivity.
**Used by:** nothing in this codebase calls this URL — **Stripe itself** posts every subscription/
invoice lifecycle event here, server-to-server, from Stripe's own infrastructure. No frontend or
mobile code is aware this endpoint exists.

## Known issues

- ⚠ `CROSS-029` (resolved) — `planPrices` (and every other query/mutation
  here) requires a full session; no logged-out visitor can ever see real pricing data through this
  resolver.
- ⚠ `CROSS-030` (resolved) — `subscribeToPlan`'s paid↔paid path is unreachable
  from the **web** checkout page specifically (a frontend BFF bug, not a bug in this resolver/service
  — confirmed working when called directly, as mobile does).
- ⚠ `BE-019` (resolved), `BE-020` (resolved) —
  see [stripe.md § Known issues](./stripe.md#known-issues).
- Full findings with severity are filed in [`issues.md`](../../../issues.md).
