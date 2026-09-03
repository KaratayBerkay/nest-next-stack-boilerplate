# Billing (backend)

**Source:** [`nest-js-boilerplate/src/billing/`](../../../../nest-js-boilerplate/src/billing/) ·
**Category:** [Billing & Usage](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md) ·
**Webhook/event detail:** [stripe.md](./stripe.md)

Full doc. Covers the entire module: subscribe/upgrade/downgrade/cancel, payment methods, billing
address, billing history, and the Stripe setup-intent + webhook machinery underneath all of them.
This module does **not** split cleanly along the acquisition-funnel/management-funnel line — a single
mutation (`subscribeToPlan`) handles a brand-new FREE→paid subscribe, a paid↔paid upgrade or
downgrade, and (via a "re-select your current tier" escape hatch) cancelling a pending scheduled
change, so it's documented here as one coherent unit. See [endpoints.md](./endpoints.md) for the
full per-operation reference and [stripe.md](./stripe.md) for the webhook receiver's event-by-event
behavior.

## What this module owns

Wired into [`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES`
directly (both `BillingModule` and `StripeModule`, not demo-gated). See
[`billing.module.ts`](../../../../nest-js-boilerplate/src/billing/billing.module.ts).

Unlike [auth](../../identity-access/auth/README.md) and messaging's "facade over hand-constructed
sub-services" shape, `BillingService` is **one flat, NestJS-provided service** — no internal
sub-service split. It composes four *other* real modules directly instead:

| Collaborator | Role |
|---|---|
| [`StripeService`](../../../../nest-js-boilerplate/src/billing/stripe/stripe.service.ts) | the raw Stripe SDK wrapper — see [stripe.md](./stripe.md) |
| [`WalletService`](../../../../nest-js-boilerplate/src/billing/wallet.service.ts) | see [§ Wallet — a ledger anchor, not a feature](#wallet--a-ledger-anchor-not-a-feature) below |
| `TokenStoreService` / `RealtimeGateway` | propagate a tier change into the live session + connected sockets — see [§ Making a tier change take effect immediately](#making-a-tier-change-take-effect-immediately) |
| `OutboxService` / `NotificationService` | the transactional-outbox audit trail and in-app `BILLING` notifications every mutation emits |

`BillingResolver` is **GraphQL-only** and guards its entire class with
[`SessionAuthGuard`](../../identity-access/auth/README.md#sessionauthguard--validation-order) — every
single query and mutation in the module, including `planPrices`, requires a full logged-in session.
There is no `@Public()`-style exception anywhere in this resolver. See ⚠
`CROSS-029` (resolved) — this is one half of why the marketing pricing page
can't show real prices to a logged-out visitor.

The only REST surface is [`StripeWebhookController`](../../../../nest-js-boilerplate/src/billing/stripe-webhook.controller.ts)
(`POST /stripe/webhook`), authenticated by Stripe's own signature scheme rather than a session — see
[stripe.md](./stripe.md).

## The payment-provider abstraction — one implementation today

[`payment-provider.interface.ts`](../../../../nest-js-boilerplate/src/billing/payment-provider.interface.ts)
defines `PaymentProvider` (`createSubscription`, `cancelSubscription`, `cancelSubscriptionNow`,
`releaseSubscriptionSchedule`, `scheduleTierChange`) and a `PAYMENT_PROVIDER` DI token.
[`billing.module.ts`](../../../../nest-js-boilerplate/src/billing/billing.module.ts) binds that token
to [`StripePaymentProvider`](../../../../nest-js-boilerplate/src/billing/stripe-payment.provider.ts) —
confirmed the **only** class implementing the interface and the **only** provider ever registered for
the token (`grep -rn "implements PaymentProvider"` / `grep -rn "PAYMENT_PROVIDER"` across the whole
backend, one hit each). `BillingService` depends on `PaymentProvider` (the interface), never on
`StripePaymentProvider` or `StripeService` directly for subscription-shaped operations — a real,
currently-single-tenant abstraction layer, not dead ceremony: `StripePaymentProvider` is a thin
adapter translating `BillingService`'s tier/user-shaped calls into `StripeService`'s
price-id/customer-id-shaped ones (e.g. resolving `getPriceIdForTier(tier)` before calling
`stripeService.createSubscription`), so swapping providers would mean writing a new adapter class
against this same interface, not touching `BillingService` at all. (Payment-*method* operations —
`myPaymentMethods`/`removePaymentMethod`/`setDefaultPaymentMethod`/`createBillingSetupIntent` — go
straight to `StripeService`, bypassing the interface entirely; only the subscription lifecycle is
abstracted.)

## Subscribing, upgrading, downgrading, and cancelling — one mutation, three branches

[`subscribeToPlan`](./endpoints.md#subscribe-to-a-plan) branches on `(currentTier, targetTier)`:

```
targetRank == currentRank            → BadRequestException, UNLESS a pendingTier is set on this
                                        exact tier already (re-selecting your current tier while a
                                        change is pending = "never mind" — releasePendingChange)
currentTier == FREE                  → handleFirstSubscribe   (real charge now, needs paymentMethodId)
targetTier  == FREE (currentTier ≠ FREE) → handleFullCancellation (keep access to period end, no charge)
otherwise (paid ↔ paid, either way)  → handleTierChange       (deferred to next renewal, no charge now)
```

**`handleFirstSubscribe`** is the only branch that charges immediately and the only one that requires
`paymentMethodId` (throws `BadRequestException` without one). It's wrapped in a
`pg_advisory_xact_lock(hashtext(userId))`-guarded transaction so a double-click or two-tab race can't
provision two live Stripe subscriptions for the same user: the lock is acquired, the user row is
re-read *inside* the lock (the pre-lock snapshot may already be stale), and if a concurrent request
already provisioned the target tier (or higher), this request just returns that outcome instead of
creating a second subscription or cancelling a genuinely-live one. A client-supplied `idempotencyKey`
(or one derived from `userId:tier:<current-minute>` if omitted) is checked against
`WalletTransaction.clientIdempotencyKey` first, so a network-timeout-then-retry from the same client
attempt is recognized and replayed rather than double-charged.

**`handleFullCancellation`** doesn't call Stripe's outright-delete API — it sets
`cancel_at_period_end: true` (access continues through the paid period; the tier only actually flips
to FREE when `customer.subscription.deleted` lands, see [stripe.md](./stripe.md#customersubscriptiondeleted)).
Any pending schedule from a not-yet-billed `handleTierChange` is released (not cancelled — cancelling
a *schedule* would also cancel the subscription it's attached to) since a full cancellation supersedes
whatever paid↔paid change was pending.

**`handleTierChange`** never charges or credits mid-cycle — it calls
[`StripeService.scheduleSubscriptionChange`](./stripe.md#scheduling-a-tier-change) to phase the price
change in at the *next* renewal, storing `pendingTier`/`pendingTierEffectiveAt` locally so the UI can
show "changing to X on \<date\>" while the user keeps their current tier's access until the boundary.
Same advisory-lock treatment as first-subscribe (a double-click can't create two competing schedules).
The `pendingTier` markers are only cleared once `invoice.paid` actually reconciles onto that tier (or
the schedule is released/cancelled/aborted) — see [stripe.md](./stripe.md).

**`applyLocalTierChange`** is the fallback both `handleFullCancellation` and `handleTierChange` drop
into when the user has no `stripeSubscriptionId` at all (e.g. an admin/dev-set tier with no real
Stripe backing) — applies the tier immediately, no Stripe call, `cancelAtPeriodEnd: true` since
there's no real subscription to keep alive.

Every branch that actually changes the tier writes a `WalletTransaction` ledger row (see below), emits
an [outbox](../../../architecture.md#transactional-outbox--reliable-event-emission) event
(`billing.tier_upgraded` / `billing.tier_downgraded` / `billing.tier_change_scheduled` /
`billing.tier_changed`), and best-effort sends an in-app `BILLING`-type notification (failure logged
and swallowed, never blocks the response).

## Making a tier change take effect immediately

A successful tier flip (first-subscribe and the no-Stripe local-change path; **not** the deferred
paid↔paid schedule, since the tier hasn't moved yet there) does two things beyond the Postgres write,
both load-bearing for the rest of the app to see the new tier without a re-login:

1. `TokenStoreService.rewriteFieldsForUser(userId, {tier})` — rewrites the `tier` field baked into
   every live Redis session hash for that user. This matters because `rbacToken` is a
   `(userId, tier)`-derived, date-bound value the guard recomputes and compares on every request (see
   [auth README § SessionAuthGuard](../../identity-access/auth/README.md#sessionauthguard--validation-order));
   without this rewrite the *session* would still carry the old tier until the token quadruple next
   rotates.
2. `RealtimeGateway.updateUserTier(userId, tier)` — pushes a `{type: 'tier-changed', tier}` frame to
   every live WebSocket for that user immediately, so a tier-gated UI (e.g. `TierGate` on
   frontend/mobile) can react without waiting for a page reload or the next poll.

⚠ **This second step is only actually consumed on web.** Confirmed by listing every WS frame type
each client's realtime dispatcher handles: web's
[`event-dispatch.ts`](../../../../next-js-boilerplate/src/lib/realtime/event-dispatch.ts) has a
`case "tier-changed"` that fires a `window` `CustomEvent`,
[`useAuth.tsx`](../../../../next-js-boilerplate/src/features/auth/hooks/useAuth.tsx) listens for it
and updates local auth state live. Flutter's equivalent dispatcher,
[`realtime_provider.dart`](../../../../flutter-boilerplate/lib/lib/realtime/realtime_provider.dart),
has no `case 'tier-changed'` at all among its ~25 handled frame types (`grep -rn "tier-changed"
flutter-boilerplate/lib` — zero matches anywhere in the app) — the frame arrives over the socket and
is silently dropped. Backend enforcement is unaffected either way (`SessionAuthGuard` re-derives the
rbac token from the real Redis-stored tier on every request, not from client state), but a mobile
session left open across a tier change (an admin edit, or a scheduled paid↔paid change reconciling
via webhook while the app is in the foreground) shows stale tier-gated UI until the app is restarted
or the session naturally re-syncs. See ⚠ `CROSS-032` (resolved).

## Wallet — a ledger anchor, not a feature

[`WalletService`](../../../../nest-js-boilerplate/src/billing/wallet.service.ts) is a single method,
`ensureWallet(userId, tx?)`: lazily creates (or returns the existing) one-per-user `Wallet` row keyed
`(userId, currency: 'USD')`, racing-safe (a `P2002` unique-constraint hit on concurrent first-time
calls just re-fetches instead of throwing). The optional `tx` parameter lets a caller run this inside
its own enclosing `$transaction` (every call site in `BillingService` does) so wallet creation is
genuinely atomic with the write it's backing, not a separate commit that could survive a rolled-back
transaction.

**What it is not**: the `Wallet` Prisma model has a real `balance` field (`Decimal`, default 0) and
`WalletTransaction` has two nullable FKs (`fromWalletId`/`toWalletId`) plus a `WalletTxnType` enum with
six values (`DEPOSIT`, `WITHDRAWAL`, `TRANSFER`, `REFUND`, `FEE`, `ADJUSTMENT`) — a schema clearly
built for a general-purpose, transferable-balance wallet/ledger system. **Billing only ever exercises
two of those six transaction types** (`FEE` for real charges, `ADJUSTMENT` for the zero-amount
scheduling/cancellation bookkeeping rows), only ever sets `fromWalletId` (never `toWalletId` — the one
`OR: [{fromWallet:...}, {toWallet:...}]` read in `getBillingHistory` is defensive, not something any
write path populates), and never reads or writes `.balance` anywhere. Confirmed via
`grep -rn "\.balance\b"` and `grep -rn "toWalletId" ` across all non-generated backend source: zero
real (non-spec, non-`@generated`) hits beyond that one defensive `OR` clause. See ⚠
`BE-021` (resolved) — this is forward-provisioned schema with no feature
built on top of it, the same pattern as `BE-008` (resolved — fixed 2026-09-03: the WebAuthn columns were dropped from `MfaFactor` by migration) (`MfaFactor`'s unused
WebAuthn columns) and `CROSS-002` (resolved — fixed 2026-09-03: already structural-only — `ProjectTasksModule`/`TeamMembersModule` live in `DEMO_MODULES`, not in the always-on core) (`Organization`/`Team`/`Project` with
no API surface). Every real `Wallet`/`WalletTransaction` reference in the backend lives in exactly
three files: this one, `billing.service.ts`, and `stripe-webhook.controller.ts` — nothing under
`usage/` (Phase 4b's module) touches either model.

## Currencies

`SUPPORTED_CURRENCIES = ['USD', 'EUR', 'TRY']` in
[`billing.service.ts`](../../../../nest-js-boilerplate/src/billing/billing.service.ts) — a source
comment states this is kept in sync by hand with `next-js-boilerplate`'s `CURRENCIES` constant
([frontend api.md](../../../frontend/v1/plans/api.md)) and Flutter's `CurrencyCode` equivalent; all three
lists were checked and currently agree (`USD`/`EUR`/`TRY` on every side). `normalizeCurrency()`
upper-cases and falls back to `USD` for anything unrecognized — a request currency is never rejected,
just silently coerced. Real per-currency amounts come from each tier's Stripe Price's
`currency_options` (see [stripe.md § Prices and currency](./stripe.md#prices-and-currency)), not a
hand-maintained cents table — `getSubscription`/`getPlanPrices` both read live Stripe data, never a
static tier→price map.

## Depends on

`AuthModule` (for `SessionAuthGuard`/`CurrentUser`/`TokenStoreService`), `NotificationModule` (in-app
`BILLING` notifications), `RealtimeModule` (`RealtimeGateway.updateUserTier`), plus the always-on,
`@Global()` [`StripeModule`](../../../../nest-js-boilerplate/src/billing/stripe/stripe.module.ts) (so
`StripeService` is injectable anywhere without an explicit import) and `OutboxModule`/`PrismaModule`
(app-wide core modules, not billing-specific imports).

## Used by

| App | Page / Screen |
|---|---|
| Frontend | [plans page](../../../frontend/v1/plans/page.md), [checkout page](../../../frontend/v1/checkout/page.md) — `subscribeToPlan`, `mySubscription`, `planPrices`, `createBillingSetupIntent`. The [pricing redirect page](../../../frontend/pricing/page.md) itself calls none of these — it client-redirects to the plans page before any fetch happens (see ⚠ `CROSS-029` (resolved)) |
| Mobile | [plans screen](../../../mobile/v1/plans/screen.md), [checkout screen](../../../mobile/v1/checkout/screen.md) — same four operations, called directly (no BFF) |
| Frontend | [settings/billing page](../../../frontend/v1/settings/billing/page.md) (Phase 4b) — `myBillingHistory`, `myPaymentMethods` (read-only — `removePaymentMethod`/`setDefaultPaymentMethod` are wired but unused, see that page's own known issues), `myBillingAddress`, `upsertBillingAddress`, `cancelSubscription`, and the "re-select current tier" escape hatch of `subscribeToPlan` |
| Mobile | [settings/billing screen](../../../mobile/v1/settings/billing/screen.md) (Phase 4b) — same operations, `removePaymentMethod`/`setDefaultPaymentMethod` genuinely used here (unlike web) |

Per-endpoint "Used by" detail (including which specific component calls which operation) is in
[endpoints.md](./endpoints.md).

## Known issues

- ⚠ `CROSS-029` (resolved) (with frontend) — no code path lets a logged-out
  visitor see real tier/pricing data: this resolver's class-level `SessionAuthGuard` has no exception
  for `planPrices`, and the frontend's own public pricing route never reaches a page that could call
  it anyway.
- ⚠ `BE-018` (resolved), `BE-019` (resolved — fixed 2026-09-03: subscriptions are created with `payment_behavior: allow_incomplete`; an `authentication_required` outcome carries the PaymentIntent `clientSecret` + `stripeSubscriptionId`, the client completes 3DS (Stripe.js `confirmCardPayment` / flutter_stripe `handleNextAction`) and calls the new `finalizeSubscription` mutation, and decline reasons map to readable copy on every client),
  `BE-020` (resolved) — Stripe webhook throttling, 3DS/SCA handling, and
  ledger-accuracy-pending-reconciliation gaps; see [stripe.md § Known issues](./stripe.md#known-issues).
- ⚠ `BE-021` (resolved) — `Wallet`/`WalletTransaction`'s balance/transfer
  surface is unused; see [§ Wallet](#wallet--a-ledger-anchor-not-a-feature) above.
- ⚠ `CROSS-032` (resolved) — mobile never handles the `tier-changed` WS
  frame this module pushes on every live tier change; see
  [§ Making a tier change take effect immediately](#making-a-tier-change-take-effect-immediately) above.
- Full findings with severity are filed in [`issues.md`](../../../issues.md).
