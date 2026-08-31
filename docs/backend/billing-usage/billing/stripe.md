# Stripe integration — SDK wrapper and webhook receiver

Module: [README.md](./README.md) · Endpoints: [endpoints.md](./endpoints.md) · Source:
[`stripe/stripe.service.ts`](../../../../nest-js-boilerplate/src/billing/stripe/stripe.service.ts),
[`stripe/stripe.module.ts`](../../../../nest-js-boilerplate/src/billing/stripe/stripe.module.ts),
[`stripe-webhook.controller.ts`](../../../../nest-js-boilerplate/src/billing/stripe-webhook.controller.ts)

This is the third doc for the billing module, on top of [README.md](./README.md) and
[endpoints.md](./endpoints.md) — the webhook/event-handling surface here is complex and
security-sensitive enough (signature verification, idempotent event replay, five distinct event
types each with their own reconciliation logic) to deserve its own reference rather than being a
subsection of either other file.

## `StripeService` — the raw SDK wrapper

[`stripe/stripe.module.ts`](../../../../nest-js-boilerplate/src/billing/stripe/stripe.module.ts)
is `@Global()` — `StripeService` is injectable anywhere in the backend with no explicit module
import, the same convention `PrismaModule`/`OutboxModule` use for other app-wide primitives.
Constructed once with `STRIPE_SECRET_KEY` (`getOrThrow` — boot fails loudly if unset) and a pinned
API version (`2026-06-24.dahlia`). Neither `STRIPE_SECRET_KEY` nor `STRIPE_WEBHOOK_SECRET` nor the
four `STRIPE_PRICE_<TIER>` variables appear in this repo's `.env`/`.env.example` — they're Vault-
sourced (`main.ts`'s `loadVaultSecrets()` populates `process.env` before `ConfigService` reads
anything), consistent with how this repo treats every other genuinely sensitive secret.

Every method is a thin pass-through to the `stripe` npm SDK, with three exceptions worth calling out:

### Creating a subscription

[`createSubscription`](../../../../nest-js-boilerplate/src/billing/stripe/stripe.service.ts#L35-L59)
first attaches the given `paymentMethodId` to the customer, then creates the subscription with
`default_payment_method` set to it and **`off_session: true`**. This is a deliberate two-step
pattern, not an oversight: the caller (`BillingService.handleFirstSubscribe`, via
[`createBillingSetupIntent`](./endpoints.md#create-a-billing-setup-intent)) already collected and
confirmed the card through a **SetupIntent** client-side first — 3DS/SCA for *that* confirmation
happens interactively, with the customer present. By the time `createSubscription` runs, Stripe
already considers the payment method verified for off-session use, so the subscription's first
invoice is charged off-session against it. See ⚠ [Known issues](#known-issues) below for what
happens when that assumption doesn't hold.

### Scheduling a tier change

[`scheduleSubscriptionChange`](../../../../nest-js-boilerplate/src/billing/stripe/stripe.service.ts#L89-L140)
implements the paid↔paid deferred-change mechanic
([README.md](./README.md#subscribing-upgrading-downgrading-and-cancelling--one-mutation-three-branches)).
Reuses an existing `Subscription Schedule` if one is already pending (so a second tier-change request
before the first one bills doesn't create two competing schedules — the schedule id is round-tripped
through `BillingService`'s own `stripeSubscriptionScheduleId` column), otherwise creates one
`from_subscription`. Sets up exactly two phases: phase 1 keeps the *current* price through the
*current* period (`proration_behavior: 'none'` — no mid-cycle proration credit/charge), phase 2
starts the *new* price at the boundary. `end_behavior: 'release'` means the schedule dissolves back
into a normal subscription once phase 2 starts, rather than requiring further phases.

### Prices and currency

[`getPriceIdForTier`](../../../../nest-js-boilerplate/src/billing/stripe/stripe.service.ts#L167-L170)
reads `STRIPE_PRICE_<TIER>` env vars (`STRIPE_PRICE_FREE`/`BASIC`/`MEDIUM`/`PREMIUM`) — the mapping
from this app's tier enum to a real Stripe Price object id.
[`getPriceInfoForTier`](../../../../nest-js-boilerplate/src/billing/stripe/stripe.service.ts#L188-L217)
is **the single real source of truth for what a tier costs** in a given currency: it retrieves the
live Stripe `Price` (expanding `currency_options`, since that field isn't included by default),
returns the requested currency's `currency_options` entry if configured, else falls back to the
Price's own default-currency amount. Reads are cached in an in-memory `Map<priceId, Promise<Price>>`
for the life of the process (Prices are treated as effectively immutable — a `currency_options`
addition is possible but existing amounts never change) — a rejected lookup is evicted from the
cache immediately so a transient Stripe/network error doesn't poison every subsequent read.
[`getTierForPriceId`](../../../../nest-js-boilerplate/src/billing/stripe/stripe.service.ts#L219-L226)
is the reverse lookup, used by the webhook handler to figure out which tier an arbitrary invoice's
price actually corresponds to (see [`invoice.paid`](#invoicepaid) below).

## The webhook receiver

[`StripeWebhookController`](../../../../nest-js-boilerplate/src/billing/stripe-webhook.controller.ts)
exposes exactly one route, `POST /stripe/webhook`, with no `SessionAuthGuard` (Stripe can't carry a
session) and no class-level guard of any kind.

### Signature verification

1. **Body size cap**: `req.rawBody.length > 1 MB` → `413`, before touching the payload at all.
2. **Missing `stripe-signature` header** → `400`.
3. [`StripeService.constructWebhookEvent`](../../../../nest-js-boilerplate/src/billing/stripe/stripe.service.ts#L156-L159)
   wraps the SDK's `stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)` — this
   is the actual HMAC verification; any failure (bad signature, wrong secret, tampered body) throws,
   caught and turned into a `400`.
4. `req.rawBody` (a `Buffer`, not the JSON-parsed body) is what's verified — this depends on
   `NestFactory.create(AppModule, { rawBody: true })` in
   [`main.ts`](../../../../nest-js-boilerplate/src/main.ts#L88-L91), a global option that preserves
   the exact wire bytes alongside Nest's normal body-parsing. Signature verification against a
   re-serialized/re-parsed body would fail unpredictably (whitespace/key-order differences), so this
   dependency is load-bearing, not incidental.

Only after signature verification succeeds does the handler switch on `event.type`. Any exception
thrown by an event handler is caught and turned into a `500` (Stripe will retry a `5xx` on its own
schedule — see [Known issues](#known-issues) for what happens if retries also fail or get
rate-limited).

### Idempotency

Stripe explicitly documents that webhook delivery is at-least-once — the same event can arrive more
than once (retries, or a manual "resend" from the Stripe dashboard). Every handler that writes a
ledger row keys it so a re-delivery **reconciles into the same row** instead of creating a duplicate
or throwing on a unique-constraint collision:

- [`invoice.paid`](#invoicepaid) keys its `WalletTransaction` by `` `stripe_invoice:${invoiceId}` `` —
  the **same** key `BillingService.handleFirstSubscribe`'s synchronous first-charge write uses (see
  [README.md § handleFirstSubscribe](./README.md#subscribing-upgrading-downgrading-and-cancelling--one-mutation-three-branches)),
  so whichever of the two (the mutation's own synchronous write, or this webhook) lands first creates
  the row and the other one updates it — never a collision, never a duplicate.
- `subscription_schedule.{released,canceled,aborted}` (see the
  [event catalogue](#event-catalogue) above) matches on the **schedule's own id**, not the customer
  id, specifically so an out-of-order delivery
  (an older event arriving after a newer one) can't clobber a schedule the user has since replaced —
  the inline comment on `handleScheduleEnded` states this explicitly.
- `customer.subscription.updated` uses `updateMany` keyed on `stripeCustomerId` and conditionally
  spreads in `subscriptionPeriodEnd` only when the event payload actually carried one — a source
  comment notes this was fixed after being caught live: some `customer.subscription.updated`
  payloads have no item-level period data, and an earlier version of this handler was nulling out an
  otherwise-correct `subscriptionPeriodEnd` on those events.

### Event catalogue

| Event | Handler | What it does |
|---|---|---|
| `invoice.paid` | `handleInvoicePaid` | See [below](#invoicepaid). |
| `invoice.payment_failed` | `handleInvoiceFailed` | See [below](#invoicepayment_failed). |
| `customer.subscription.deleted` | `handleSubscriptionDeleted` | See [below](#customersubscriptiondeleted). |
| `customer.subscription.updated` | `handleSubscriptionUpdated` | Syncs `cancelAtPeriodEnd` and (when present) `subscriptionPeriodEnd`; logs (doesn't act on) `past_due`/`unpaid` status for dunning visibility — the actual downgrade-on-failure is driven by `invoice.payment_failed`, not this event. |
| `subscription_schedule.released` / `.canceled` / `.aborted` | `handleScheduleEnded` | Clears the locally-stored `stripeSubscriptionScheduleId` for whichever user has that schedule id, so pending-change bookkeeping can't go stale once Stripe's own schedule is gone. All three event types share one handler — a schedule ending is a schedule ending regardless of which of the three ways it happened. |

Any other event type Stripe might send to this endpoint (this account presumably has other event
types enabled, or will in the future) is silently accepted (`200 {received: true}`) and ignored —
there's no fallthrough logging of "unhandled event type," so a newly-enabled event type produces no
signal that it's landing here unhandled.

#### `invoice.paid`

[`handleInvoicePaid`](../../../../nest-js-boilerplate/src/billing/stripe-webhook.controller.ts#L103-L206) —
fires for **every** paid invoice, not just the first one: the initial subscribe charge and every
later renewal both land here.

1. Looks up the user by `stripeCustomerId`; unknown customer → warn-logged, no-op (not an error —
   could be a webhook for an account with no matching local user, e.g. a test-mode event).
2. **Reconciles the tier with what was actually billed**: resolves the invoice's subscription's
   current price back to a tier via `getTierForPriceId`, and if that differs from the user's stored
   `subscriptionTier`, updates it (covers a mid-cycle price switch or a prior attempt that never
   persisted) and rewrites the Redis session tier the same way a live `subscribeToPlan` call would.
3. Writes/reconciles the `WalletTransaction` row (idempotency above) with the **real** `amountPaid`
   and `stripeInvoiceUrl` — this is what upgrades the synchronous first-charge row's placeholder
   `amount: 0` to the genuine charged amount (see [BE-020](#known-issues)).
4. Updates `subscriptionPeriodEnd` from the invoice's own `period_end` — never nulls out an existing
   `stripeSubscriptionId` with a non-subscription invoice (e.g. a bare setup-intent-adjacent invoice
   with no `subscription` field).
5. If a `pendingTier` was set and this invoice's billed tier matches it, clears `pendingTier`/
   `pendingTierEffectiveAt` — **this is the actual moment a scheduled paid↔paid change becomes real**
   from the UI's perspective; until this webhook lands, `mySubscription` keeps showing "changing to X
   on \<date\>".

#### `invoice.payment_failed`

[`handleInvoiceFailed`](../../../../nest-js-boilerplate/src/billing/stripe-webhook.controller.ts#L208-L291) —
**immediate-downgrade dunning policy**: a failed renewal charge cuts paid access *now*, not at the
end of some grace period. A FREE user (no paid access to lose) is a no-op. Otherwise: releases any
pending Subscription Schedule (a scheduled tier change can't survive its own funding charge failing),
sets `subscriptionTier: FREE` + clears `cancelAtPeriodEnd`/`pendingTier*`/the stored schedule id, and
sends a "your payment failed, you've been downgraded" in-app notification. Stripe keeps retrying the
charge on its own dunning schedule regardless — a later successful retry's own `invoice.paid`
reconciles the tier back up automatically (step 2 above), no special-case code needed for that.

#### `customer.subscription.deleted`

[`handleSubscriptionDeleted`](../../../../nest-js-boilerplate/src/billing/stripe-webhook.controller.ts#L369-L437) —
fires when a subscription actually ends (the natural conclusion of `cancel_at_period_end: true`, or
an immediate cancel). **Guards against a stale-event race explicitly**: if the user's *currently
stored* `stripeSubscriptionId` no longer matches the id in this event, the user has since upgraded to
a replacement subscription (an upgrade cancels the old subscription before creating the new one, see
[README.md § handleFirstSubscribe](./README.md#subscribing-upgrading-downgrading-and-cancelling--one-mutation-three-branches)),
so this handler skips the FREE downgrade entirely rather than undoing a since-completed upgrade.
Otherwise: sets the user to `FREE`, clears `stripeSubscriptionId`/period fields/`cancelAtPeriodEnd`,
emits an outbox event, rewrites the Redis session tier.

### Env vars

`STRIPE_SECRET_KEY` (server-side secret key), `STRIPE_WEBHOOK_SECRET` (signing secret for this
specific webhook endpoint), `STRIPE_PRICE_FREE`/`STRIPE_PRICE_BASIC`/`STRIPE_PRICE_MEDIUM`/
`STRIPE_PRICE_PREMIUM` (named by `getPriceIdForTier`'s own `` `STRIPE_PRICE_${tier}` `` template) —
all Vault-sourced, none present in `.env`/`.env.example`.

## Known issues

- ⚠ `BE-018` (resolved) — this controller has no `@SkipThrottle()` (a decorator this codebase does use
  elsewhere, see
  [`throttle.controller.ts`](../../../../nest-js-boilerplate/src/throttle/throttle.controller.ts)),
  so `/stripe/webhook` shares the app's global default rate limit
  (`ThrottlerModule.forRootAsync({throttlers: [{ttl: 60000, limit: 120}]})` in
  [`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts), IP-tracked via
  `HttpThrottlerGuard`, itself installed globally via `APP_GUARD`). A burst of Stripe deliveries
  (retry storms, or a bulk "resend events" from the Stripe dashboard) could get `429`'d — and since a
  `429` isn't a `2xx`, Stripe treats it as a failed delivery and keeps retrying, with enough
  consecutive failures on one endpoint risking Stripe auto-disabling it.
- ⚠ [BE-019](../../../issues.md#be-019) — no code path distinguishes an `authentication_required` (3DS/SCA) decline from
  any other Stripe failure. `StripePaymentProvider.createSubscription`'s `catch` block only pattern-
  matches the substrings `"insufficient funds"` and `"card_declined"` in the thrown error's message
  (confirmed: `stripe-payment.provider.spec.ts`'s only failure-mapping test covers
  `"Your card has insufficient funds"` → `insufficient_funds`); anything else, including a SCA
  challenge Stripe declines to complete off-session, falls through to the generic
  `subscription_failed` reason. Neither the web nor mobile checkout UI has a "please complete
  verification with your bank" retry path — both just show `result.reason` as an opaque failure
  string. Plausible given `off_session: true` is used deliberately for the (recommended) "verify via
  SetupIntent first, then charge off-session" pattern (see
  [§ Creating a subscription](#creating-a-subscription) above) — but that pattern doesn't guarantee
  the off-session charge itself never needs authentication, only that it usually won't for a
  just-verified card.
- ⚠ `BE-020` (resolved) — a brand-new subscription's first `WalletTransaction` ledger row is written
  with `amount: 0` synchronously inside `subscribeToPlan` (before any webhook exists to know the real
  amount), and is only corrected to the genuine charged amount when `invoice.paid` reconciles it (see
  [§ invoice.paid](#invoicepaid) above, and idempotency above for why they share a row). If that
  webhook is delayed, dropped, or never arrives (including as a consequence of BE-018's
  throttling gap), [`myBillingHistory`](./endpoints.md#get-my-billing-history) permanently shows
  `$0.00` with no invoice link for a charge that genuinely happened, until/unless some other event
  for the same invoice ID happens to reconcile it later.
- Full findings with severity are filed in [`issues.md`](../../../issues.md).
