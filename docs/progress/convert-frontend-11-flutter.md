# convert-frontend-11-flutter — Payments & subscriptions, full-stack hammer pass

## 0. How to read this doc

Berkay asked for a dedicated, maximally thorough pass over payments/subscriptions across the whole
stack — backend (NestJS/Stripe), Next.js web, and Flutter — after `convert-frontend-10-flutter.md`'s
live-testing tail (§11.4, §12) turned up a string of real billing bugs (F44 cancel-dialog crash, F45
Stripe-init race, F46 Plans page tier-blindness) and a further, still-undocumented webhook fix appeared
uncommitted in the working tree while this doc was being written (see §2.2's note on F9/the
`current_period_end` fix). This doc is **investigation + fix plan only**, per this project's established
convention ([[phased-roadmap-workflow]]) — nothing in §2 has been implemented yet. §4 is the proposed,
staged build plan; implementation starts only when Berkay says go.

**Methodology:** four parallel agents each went deep on one slice — backend write-path
(`billing.service.ts`), backend webhook path (`stripe-webhook.controller.ts`), Next.js frontend+BFF, and
Flutter — all four told to treat prior "fixed" claims as unverified and re-derive current status from the
actual code, not from `convert-frontend-10-flutter.md`'s own account of itself (that doc has a
well-documented history of overstated completion claims, five separate times by its own final tally).
The three most severe-sounding claims that came back (F26, F27, F16 below) were independently re-verified
by hand afterward — reading the exact resolver argument names against the exact client mutation strings —
before being written up here as Confirmed rather than trusted at face value. Every finding below is tagged
**Confirmed** (the agent or this pass read the exact current code) or **Plausible** (a strong, code-grounded
hypothesis that would benefit from a live check). Findings are grouped by subsystem (§2.1–§2.5); the fix
plan (§4) is grouped by rollout stage instead, since a single bug's fix often spans two or three of the
findings sections.

---

## 1. Executive summary — what matters most

1. **Two "this cannot possibly work" bugs on Flutter, both one-line fixes.** Subscribing to any paid tier
   sends the GraphQL enum variable `tier: "price_basic"` instead of `"BASIC"` — the backend's
   `SubscriptionTier` enum has never accepted that value, so every paid subscribe attempt has been failing
   before the resolver even runs (F26). Removing or setting a default payment method sends the argument
   name `id` where the schema only defines `paymentMethodId` — "Unknown argument," 100% of the time (F27).
   Both are pre-existing (not part of today's uncommitted work), both are Confirmed by reading the exact
   mutation string against the exact resolver signature, both are one-line fixes with zero design
   ambiguity. These should ship first, today, regardless of anything else in this doc.
2. **A third "silently discards your input" bug, same shape, on web.** The billing-address form's `onSave`
   handler ignores its own argument and just closes the editor — the real, fully-built
   `useUpsertBillingAddress` mutation has never been called from anywhere in the app (F16).
3. **Today's brand-new deferred-billing feature (commit `49f34582`, same day this doc was written) is
   incomplete at every single layer it touches.** Paid↔paid tier changes now use a Stripe Subscription
   Schedule instead of billing immediately — but nothing anywhere ever releases that schedule, even on the
   happy path, so **every user's second plan change ever attempted permanently fails** (F15a). Neither
   frontend fully understands the new pending-change state either: web's checkout still shows "Upgrade
   successful, effective immediately" for a change that hasn't actually happened yet (F15d), and Flutter's
   checkout page has no upgrade/downgrade distinction at all — three purpose-built widgets ported for
   exactly this sit completely unused (F15g). See §2.3 for the full seven-part story — this is the doc's
   single most consequential finding, more so than any individual bullet in it, because it's a feature
   that shipped today and nobody has used it twice yet.
4. **The currency selector is cosmetic.** Plans/Checkout let a user pick USD/EUR/TRY and show a
   plausible-looking price in that currency — but the backend has exactly one Stripe Price per tier, no
   currency dimension, and bills everyone in whatever that Price's real currency is. A user can watch a
   price in ₺ on screen and be charged a different number in a different currency (F17). This is a
   decision-time, point-of-sale mismatch, not a cosmetic display bug — flagged as an open decision in §3
   before any fix is built.
5. **No dunning, no refund handling, anywhere.** A declined renewal charge is a pure no-op — logged and
   nothing else — so a customer whose card fails keeps full paid access indefinitely until Stripe's own
   retry schedule exhausts days or weeks later (F9). A refund or chargeback issued from the Stripe
   dashboard never touches the local ledger or the user's tier at all (F10). Both `WalletTxnStatus.FAILED`
   and `WalletTxnType.REFUND` exist in the Prisma schema, built for exactly this, and are referenced
   nowhere in application code.
6. **Admin tier overrides quietly lose to real billing.** `setUserTier` writes the local tier with no
   Stripe call and no check of the user's actual subscription — and the very next `invoice.paid`
   reconciliation silently reverts it back to whatever Stripe actually billed, with no signal to the admin
   that their change didn't stick (F1).
7. **Two independent, behaviorally-different cancellation code paths exist** (`cancelSubscription` mutation
   vs. `subscribeToPlan` called with tier `FREE`) — one emits a ledger row, an outbox event, and a
   notification; the other emits none of those (F2). This is also *why* F15b (schedule never cleared on
   cancel) has to be fixed in two places instead of one, and unifying it is a prerequisite step in §4.
8. **Currency bugs keep recurring at new call sites, three docs running.** `convert-frontend-10`'s F17
   (100x currency bug) and its Flutter-side echo were both fixed — but `InvoiceTable.tsx` and
   `PlanDetails.tsx` each independently hand-roll `$`/`"USD"` instead of reusing the one correct
   `formatPrice()` helper the rest of the app already has (F18, F19), and Flutter's Plans/Checkout pages
   show prices roughly $1 low against the real cent amounts (F28). The pattern here isn't "the formatter is
   wrong" (it isn't) — it's that fixing one call site has never yet meant anyone swept the others.
9. **A recurring theme across every layer this session: a fix applied at one call site, not its sibling.**
   The F41-style "BFF route forwards zero auth" bug from `convert-frontend-10` does **not** reproduce on
   any of the 7 billing BFF routes (all correctly use `graphqlFetch`, re-checked one by one) — genuinely
   clean, worth stating since it was the single highest-prior for this audit. But the same *shape* of bug
   recurs elsewhere: web's upgrade path has double-submit + idempotency-key protection that its sibling
   downgrade path lacks entirely (F20); Flutter's checkout Subscribe button is the only billing action with
   a busy-guard, every other billing button on that screen has none (F31).
10. **Test coverage is thin exactly where these bugs live.** None of F15's seven parts has a test. Neither
    do F26/F27 (Flutter's two dead-on-arrival mutations) — no integration test anywhere in either app
    actually round-trips a GraphQL call against the real backend schema, which is precisely how both
    shipped broken and stayed that way.

---

## 2. Findings (full detail)

### 2.1 Backend — subscription write path (`billing.service.ts` and friends)

**F1 — [High, Confirmed] Admin `setUserTier` desyncs from live Stripe billing and is silently reverted on
the next renewal.** `nest-js-boilerplate/src/authorization/admin.resolver.ts:137-173`, cross-referenced
against `stripe-webhook.controller.ts:155-175`. `setUserTier` writes `subscriptionTier` directly with no
check of `stripeSubscriptionId`/`pendingTier` and no Stripe call. Two failure modes: an admin downgrading a
user with a live paid subscription leaves them billed at the old price while access is gated at the new
tier (nothing cancels or changes Stripe); and even a benign admin override isn't durable — the next
`invoice.paid` reconciliation (`if (billedTier && billedTier !== user.subscriptionTier)`) silently
overwrites the admin's change back to whatever Stripe actually billed, with zero signal that it happened.
No test file exists for `admin.resolver.ts` at all. *Fix direction:* T24 (decision-gated, see §3).

**F2 — [High, Confirmed] Two independently-reachable, behaviorally-divergent cancellation code paths.**
`billing.resolver.ts:269-275` (`cancelSubscription` mutation) → `billing.service.ts:638-661`, versus
`billing.resolver.ts:166-184` (`subscribeToPlan` called with tier `FREE`) → `billing.service.ts:364-434`.
Both are live client-side entry points (Next.js's `cancel/route.ts` and `PlanDetails.tsx` use the first;
`subscribe/route.ts`'s FREE-tier path uses the second; Flutter mirrors both). The standalone
`cancelSubscription` path skips the `ADJUSTMENT` ledger row, the `OutboxEvent`, and the user notification
that the other path performs for the same logical action. This split is also the direct reason F15b (the
Subscription Schedule never gets released on cancel) has two places to fix instead of one. *Fix direction:*
T5, prerequisite for T6.

**F3 — [High, Confirmed] No way to cancel a pending scheduled tier change back to the current tier.**
`billing.service.ts:64-66`: `if (targetRank === currentRank) throw new BadRequestException('Already on this
tier')`. This compares only against `subscriptionTier`, ignoring `pendingTier`, and fires before the
Subscription Schedule logic is ever reached. A user on MEDIUM with a downgrade already scheduled to BASIC
who changes their mind and wants to stay on MEDIUM gets flatly blocked with "Already on this tier" — there
is no `cancelPendingChange` mutation anywhere. Their only escapes are picking a *third* tier (works) or
cancelling outright (broken per F15b). This is also part of F15's cross-cutting story. *Fix direction*: T6.

**F4 — [Medium/High, Confirmed pattern / Plausible trigger] Stripe network calls run inside an open
Postgres transaction holding a per-user advisory lock, 120-second timeout.** `billing.service.ts:110-191`
(`handleFirstSubscribe`, Stripe call at :157) and `:460-546` (`handleTierChange`, 2-3 sequential Stripe
calls at :486), both `{maxWait: 15_000, timeout: 120_000}`. Holding a DB transaction + advisory lock across
sequential external HTTP round-trips ties up a pool connection and blocks all other operations on that user
for the full latency window. If the transaction exceeds 120s, Prisma rolls back locally but the in-flight
Stripe call isn't cancelled — a charge or schedule can succeed at Stripe while the local write is lost, with
`invoice.paid` reconciliation (F16's write-path counterpart) the only safety net, and only for
`subscriptionTier` specifically. *Fix direction:* T22.

**F5 — [Medium, Confirmed] Cancellation paths have no concurrency guard, unlike subscribe/upgrade.**
`billing.service.ts:364-434`, `:638-661` — contrast the advisory-lock pattern at `:112`/`:462`, added for
the doc-10 F13 fix but never extended to cancellation. A double-click cancel within the same 60-second
idempotency-key bucket makes the second `walletTransaction.create` throw an uncaught unique-constraint
error (surfaces as a raw 500) instead of a graceful "already cancelled." Outside that window it silently
creates a duplicate `ADJUSTMENT` row and a duplicate cancellation notification. *Fix direction:* T21.

**F6 — [Medium, Confirmed] Two independent, unsynchronized sources of truth for tier pricing.**
`billing.service.ts:694-703` (`getSubscription`'s `priceCents`, reads `PRICE_${tier}` env vars, hardcoded
fallback `{FREE:0,BASIC:999,MEDIUM:1999,PREMIUM:4999}`) versus `stripe/stripe.service.ts:137-140`
(`getPriceIdForTier`, reads `STRIPE_PRICE_${tier}`, the actual Stripe Price that gets charged). Nothing
cross-checks the two. Repointing `STRIPE_PRICE_BASIC` to a new Stripe Price without updating `PRICE_BASIC`
makes the UI silently disagree with what's actually charged — the backend-side twin of F17/F19's
currency-display problems. *Fix direction:* T14.

**F7 — [Medium, Confirmed] The decline-retry local-dedup path is dead code, and its own test verifies a lie.**
`billing.service.ts:204-220` (`findRetryResult`'s FAILED branch), `:165-168` (the decline branch writes
nothing). Repo-wide grep found zero writes of `status: 'FAILED'` for any `WalletTransaction` anywhere in
billing code. `findRetryResult`'s spec test ("returns the prior failed reason for a duplicate idempotency
key") assumes a DB state production code never actually produces — retrying after a decline always
re-calls Stripe; it's safe only because Stripe's own idempotency key (also passed through) prevents a
double charge, not because of this local fast path. *Fix direction:* T23.

**F8 — [Low/Medium, Confirmed, bundle] Two minor correctness nits.** (a) `billing.service.ts:487`
force-unwraps `lockedUser.stripeSubscriptionId!` without re-checking truthiness under the lock (the
pre-lock check at :450 isn't re-verified post-lock) — a concurrent webhook-driven deletion between the two
reads passes `null` into the Stripe SDK, caught safely by the provider's try/catch but surfaced as a
generic error instead of a clear "already cancelled" reason. (b) First-subscribe writes its `FEE` ledger
row with `amount: 0` (`:293-307`), correct only once the `invoice.paid` webhook backfills the real amount
(`stripe-webhook.controller.ts:253,273-282`) — self-healing on the happy path, but a permanently-wrong
$0.00 row if that webhook delivery is ever delayed or dropped. *Fix direction:* T30 (bundled with §2.2's
low-severity items).

### 2.2 Backend — Stripe webhook & reconciliation (`stripe-webhook.controller.ts`)

**A note on the working tree before these findings:** `stripe-webhook.controller.ts` and its spec currently
carry an **uncommitted** fix (not written up anywhere until now) correcting how `customer.subscription.updated`
reads `current_period_end` — the field only ever lived on `items.data[0]` on this Stripe API version, never
on the top-level Subscription object, so reading it unguarded was silently wiping a correct
`subscriptionPeriodEnd` back to `null` on every update event, including a plain cancel. This audit
independently verified the fix is **correct**: it matches how `stripe-payment.provider.ts` and
`stripe.service.ts` already read the same field elsewhere, both new spec tests pass, and the "only write
when resolved" guard degrades safely on an empty `items.data`. Recommended action is simply to commit it
(T4) — it needs no further changes.

**F9 — [Critical, Confirmed] No dunning: failed renewal/scheduled-change charges are pure no-ops.**
`stripe-webhook.controller.ts:200-216` (`handleInvoiceFailed`) does nothing but `logger.warn(...)` — no DB
write, no wallet entry, no tier change, no notification. Separately, `handleSubscriptionUpdated`
(`:364-397`) reads `cancel_at_period_end` and the period-end date but **never inspects
`subscription['status']`**, so a `past_due`/`unpaid` transition — which Stripe also delivers via this same
event — is invisible too. The schema's unused `WalletTxnStatus.FAILED` was clearly built for this. Net
effect: a declined renewal card leaves the user on the paid tier with full access indefinitely, until
Stripe's own retry schedule exhausts (days to weeks later) and finally fires `customer.subscription.deleted`
— the only path that actually downgrades them. This directly compounds F15: if the charge that fails is a
*scheduled tier change* rather than a plain renewal, `pendingTier` is never cleared either (only
`handleInvoicePaid`'s success path clears it), so the UI keeps showing "changing to X on `<date>`" for a
change that has already definitively failed to bill. *Fix direction:* T7 (decision-gated, see §3).

**F10 — [High, Confirmed] No refund or dispute/chargeback handling at all.** Neither `charge.refunded` nor
`charge.dispute.created` appears anywhere in the controller's event switch. A refund or chargeback issued
from the Stripe dashboard never reverses the corresponding `WalletTransaction` and never touches
`subscriptionTier` — the ledger permanently shows `COMPLETED` for money Stripe has already returned, and the
user keeps paid access. `WalletTxnType.REFUND` exists in the schema and is referenced nowhere in `src/`.
*Fix direction:* T16.

**F11 — [Medium, Plausible] No protection against out-of-order webhook delivery on
`customer.subscription.updated`.** `stripe-webhook.controller.ts:364-397`. Stripe explicitly does not
guarantee in-order delivery, especially across retries. The handler blindly applies whatever
`cancel_at_period_end`/period-end is in whichever event arrives last, with no check against the event's own
timestamp or id — a delayed, out-of-order redelivery can regress `cancelAtPeriodEnd` (written
unconditionally, unlike the now-guarded `subscriptionPeriodEnd`) back to a stale value. *Fix direction:* T17.

**F12 — [Medium, Confirmed] An unknown/stale Stripe price ID fails reconciliation silently, with no log.**
`stripe-webhook.controller.ts:218-227` (`getBilledTier`) / `stripe.service.ts:143-149`
(`getTierForPriceId`). If a subscription's price doesn't match any configured `STRIPE_PRICE_*` (stale env,
or the Price got edited/archived in the Stripe Dashboard), the lookup returns `null` with zero logging;
`handleInvoicePaid` falls back to the user's existing tier, so nothing crashes and no wrong tier gets
assigned — but there's no operational signal that reconciliation silently failed to do its job. *Fix
direction:* T18.

**F13 — [Low/Medium, Confirmed] Silent no-op, no log, when `customer.subscription.updated` matches no
local user.** `stripe-webhook.controller.ts:387-396` uses `prisma.user.updateMany({where:
{stripeCustomerId}})`, which silently no-ops (`count: 0`) on no match — inconsistent with
`handleInvoicePaid`/`handleInvoiceFailed`, both of which explicitly warn-log on a missing customer mapping.
A customer-mapping problem specific to this event type is currently invisible. *Fix direction:* T19.

**F14 — [Low, Confirmed, bundle] Two minor hardening items.** (a) The idempotent-redelivery skip branch of
`handleSubscriptionDeleted` (`:312-324`) logs a nonsensical "replacement subscription `{null}` is active"
message on a true redelivery (behaviorally correct/idempotent, just a confusing log line). (b) The webhook
route has no `@SkipThrottle()` and shares the global per-IP rate limit — signature verification is already
the real security gate here, so throttling adds no protection and only risks 429-ing a legitimate burst of
Stripe retries (which Stripe would then retry again). *Fix direction:* T20.

**Signature verification / raw body handling: no issues found.** `main.ts` sets `rawBody: true` at
`NestFactory.create()` with no competing body-parser middleware; `stripeService.constructWebhookEvent()`
receives the actual raw `Buffer`, not a parsed object; the only global guard (`HttpThrottlerGuard`) is pure
IP rate-limiting with no auth logic and no bypass. This is genuinely clean — worth stating plainly since
webhook signature bugs are a common, severe class of mistake this audit was specifically watching for.

### 2.3 Cross-cutting — today's deferred paid↔paid billing feature is broken end-to-end

This is the doc's headline finding (**F15**), assembled from pieces each of the four agents found separately
in their own territory — no single slice of this audit could see the whole shape alone, which is the main
reason this pass was split the way it was. Context: commit `49f34582`, landed the same day this doc was
written, changed paid↔paid tier changes (both directions) from "apply and charge/prorate immediately" to "keep
the current tier/price through the current period, switch at renewal via a Stripe Subscription Schedule,"
tracked through two new fields, `User.pendingTier` and `pendingTierEffectiveAt`. First-time subscribe
(FREE→paid) and full cancellation (paid→FREE) were explicitly not changed by that commit. The mechanism
itself — the actual Subscription Schedule creation and phase logic — is sound (independently confirmed by
Agent A: two concurrent schedule requests correctly reuse/overwrite the same schedule rather than stacking
two). Everything *around* it is not:

- **F15a — [Critical, Confirmed] The Subscription Schedule is never released anywhere, even on full
  success.** Repo-wide grep: `pendingTier: null` is written in exactly one place in the whole codebase
  (`stripe-webhook.controller.ts:183`, inside the success path). `stripeSubscriptionScheduleId` is written
  once (`billing.service.ts:504-505`) and **never nulled anywhere**, and no `subscription_schedule.*` event
  is handled at all. Stripe creates this schedule with `end_behavior: 'release'`
  (`stripe.service.ts:92`) — once phase 2 activates, Stripe itself releases the schedule and it becomes
  immutable. The **next** paid↔paid change reuses the now-stale `existingScheduleId`
  (`stripe.service.ts:83-84`), successfully retrieves the released schedule, then calls `.update()` on
  it — which Stripe's documented lifecycle rejects for a released schedule — surfacing forever after as a
  generic `subscription_schedule_failed` error. **Concretely: every user's second-ever plan change fails,
  permanently, with no recovery path in-app.** Fix direction: handle `subscription_schedule.released` (and
  `.canceled`/`.aborted`) to null `stripeSubscriptionScheduleId`.
- **F15b — [High, Confirmed] Neither cancellation code path clears the schedule or `pendingTier` either.**
  Both `handleFullCancellation` and the standalone `cancelSubscription` (F2) write `cancelAtPeriodEnd`/tier
  fields but never touch `pendingTier`/`pendingTierEffectiveAt`/`stripeSubscriptionScheduleId`, and never
  call Stripe to release the schedule. `mySubscription` can end up reporting `cancelAtPeriodEnd: true`
  *and* a future `pendingTier` simultaneously — a contradictory state hitting the UI directly (see F15e).
- **F15c — [High, Confirmed] No escape hatch out of a pending change.** This is F3 above, restated in
  context: a user can't cancel a scheduled change back to their current tier ("Already on this tier"), and
  (per F15b) can't reliably cancel outright either. Only picking a genuinely different third tier works.
- **F15d — [Critical, Confirmed] Web's checkout flow doesn't know this feature exists; it tells users a
  scheduled change already happened.** `CheckoutContent.tsx` derives `isUpgrade`/`isDowngrade` purely from
  tier rank, with no check for whether the *current* tier is FREE (genuinely immediate) versus paid
  (now scheduled). Both branches show immediate-success copy ("Your plan will be changed immediately,"
  "Upgrade successful!") and redirect after 2 seconds — verified server-side that `handleTierChange` never
  touches `subscriptionTier` and never calls `realtime.updateUserTier`, so a `refreshUser()` right after
  this "success" screen fetches back the *same old tier*. The BFF's `SUBSCRIBE_MUTATION` doesn't even
  select `pendingTier` in its response shape, so the frontend has no data path to show the correct message
  even if it wanted to. The Plans page only ever links to upgrade targets, so this reproduces through the
  primary, everyday upgrade flow, not just an edge case.
- **F15e — [Medium, Confirmed] Web's Cancel/Upgrade controls don't gate on an existing pending change.**
  `PlanDetails.tsx` renders the pending-change banner unconditionally alongside a Cancel button that only
  checks `cancelAtPeriodEnd`, never `pendingTier` — and an Upgrade-Plan link that's always active. A user
  with a change already queued gets no warning before initiating a second, conflicting one. The Plans page
  itself never fetches `pendingTier` at all.
- **F15f — [High, Confirmed] Flutter never fetches `pendingTier`/`pendingTierEffectiveAt` at all.**
  `lib/api/server/billing/subscription.dart`'s `mySubscription` query requests only `tier priceCents
  currency periodStart periodEnd cancelAtPeriodEnd` — confirmed zero mention of either new field, even
  though the backend resolver has exposed them since `49f34582`. `SubscriptionInfo` has no field for them
  and `_SubscriptionCard` has no UI branch for them at all. Concretely: a user with a scheduled downgrade
  sees their *current* tier's card with fully live Upgrade/Cancel buttons, as if nothing were queued —
  nothing stops them tapping Upgrade and stacking a second, conflicting change.
- **F15g — [High, Confirmed] Flutter's checkout page has zero upgrade/downgrade/current-plan branching —
  three purpose-built ported widgets are dead code.** `CheckoutPageContent` never reads
  `userTierProvider`/`authProvider` at all; it always renders the identical "enter a new card, Subscribe"
  flow regardless of the account's actual current tier. `downgrade_section.dart`, `plan_summary_card.dart`,
  and `checkout_success_view.dart` — faithful ports of web's equivalent three-way-branch widgets — have
  zero call sites anywhere in `lib/`. Concretely: Flutter currently has **no way to actually initiate a
  downgrade** the way the backend now expects (schedule, don't re-charge) — every checkout attempt, upgrade
  or downgrade, runs the full new-card SetupIntent path instead.

*Fix direction for the whole F15 story:* T5, T6 (backend lifecycle), T7 (failure-path clearing, shared with
F9), T8, T9 (web), T10, T11 (Flutter). See §4 Stage B — this is treated as one connected rollout, not seven
independent tickets, since T6's backend fields have to be trustworthy before T8-T11's frontend work means
anything.

### 2.4 Next.js frontend — checkout, plans, settings/billing

**F16 — [Critical, Confirmed — independently re-verified] Billing-address "Save" never persists; edits are
silently discarded.** `views/settings/billing/FreePageView.tsx:94`:
`onSave={() => setIsEditingAddress(false)}` — ignores its own argument and just closes the editor. The real
mutation (`useUpsertBillingAddress` in `api/client/billing/address.ts`, which correctly calls
`upsertBillingAddressServer` → `graphqlFetch`) is fully built, fully correct, and has zero call sites
anywhere in the app outside its own definition — confirmed directly. `isSaving` is never passed either, so
the Save button never reflects a pending or failed state because no save is ever actually attempted. *Fix
direction:* T3.

**F17 — [Critical, Confirmed] The currency selector is cosmetic: nothing displayed matches what Stripe will
actually charge.** `lib/currency.ts`'s formatter is itself correct, but `PageContent.tsx`,
`PlanSummaryCard.tsx`, and the `currency` cookie/provider let a user pick USD/EUR/TRY and see
`TIER_PRICES_CENTS` formatted in that currency — while the backend has exactly one Stripe Price per tier
(`getPriceIdForTier`, one `STRIPE_PRICE_${tier}` env var, no currency dimension at all) and every ledger
write hardcodes `currency: 'USD'`. A user can select TRY, see "₺9.99/mo," and be charged a different number
in USD. This is a point-of-sale mismatch at decision time, not a display bug. *Fix direction:* T12
(decision-gated, see §3).

**F18 — [High, Confirmed] `InvoiceTable` hardcodes `$` and manual `/100` math, ignoring the fetched
transaction's own currency.** `InvoiceTable.tsx:98`: `` `$${(tx.amount / 100).toFixed(2)}` `` — even though
`history/route.ts` explicitly fetches `currency` per transaction and the correct shared `formatPrice()`
helper already exists and is used elsewhere. Same bug *class* as `convert-frontend-10`'s F17 (100x currency
bug), recurring at a call site nobody re-audited after that fix landed. *Fix direction:* T13.

**F19 — [High, Confirmed] `PlanDetails` hardcodes `"USD"` and a static price table instead of the currency
cookie or the backend's authoritative price.** `PlanDetails.tsx:72-74`:
`formatPrice(TIER_PRICES_CENTS[tier] ?? 0, "USD")` — while `subscription/route.ts` already fetches the real
`priceCents`/`currency` from `mySubscription`, confirmed never rendered anywhere. Two duplicate,
unsynchronized sources for the same number on the same page. *Fix direction:* T13.

**F20 — [High, Confirmed] `DowngradeSection` has no double-submit guard and drops the idempotency key its
own `subscribe()` signature supports.** `DowngradeSection.tsx` — no `disabled` state, no local submitting
flag, `subscribe(targetTier)` called with no idempotency key — contrasted directly against the sibling
upgrade path (`StripeCardForm.tsx`), which has both a `submitting`-disabled guard and a persisted
`retryKeyRef` UUID. Same mutation, two call sites, only one got hardened — the exact "fix applied to one
site, not its sibling" pattern named in the executive summary. Backend defense-in-depth (the advisory lock
+ idempotency key) softens the blast radius, but redundant requests and racing success/error state are
still reachable. *Fix direction:* T26.

**F21 — [Medium, Confirmed] `PaymentMethods` is read-only in the UI; set-default/remove are fully built and
wired to nothing.** `PaymentMethods.tsx` has no interactive controls besides a passive default-status
badge, despite `useSetDefaultPaymentMethod`/`useRemovePaymentMethod` (`api/client/billing/payment-methods.ts`)
being correctly implemented against a working BFF route, with zero call sites. *Fix direction:* T25.

**F22 — [Medium, Confirmed] The billing-address form's Cancel button literally reads "Cancel
subscription."** `BillingAddressForm.tsx:111` borrows the subscription-cancellation i18n key
(`cancelSubscription`) for a plain form-cancel action — alarming, confusing wording for discarding an
address edit. *Fix direction:* T27.

**F23 — [Medium, Confirmed] "Make default" is shown as a static badge, with imperative-verb wording, on the
card that's already the default.** `PaymentMethods.tsx:87-91`. *Fix direction:* T27.

**F24 — [Medium, Confirmed] The real Subscribe/payment form is 100% hardcoded English.**
`features/billing/ui/StripeCardForm.tsx` — no `useMessages` import at all, despite matching unused i18n
keys already existing (`processing`, `subscribeTo`, `paymentFailedGeneric`). This is the app's primary
payment-submission surface. *Fix direction:* T31.

**F25 — [Low, Confirmed, bundle] Four small issues.** `PlanDetails.tsx:119` renders `{t.cancelsOn}`
("Cancels on") as a standalone sentence fragment with no date attached, as the sole replacement for the
Cancel button. `FreePageView.tsx:36` destructures the subscription query without `isLoading`, so
`cancelAtPeriodEnd` briefly defaults to `false` (Cancel button flashes) before the real value resolves.
`csrfEchoHeaders()` is applied inconsistently across the 7 billing BFF routes (only 2 of 7 use it) — harmless
today since the backend's `CsrfGuard` isn't wired to any billing resolver, but worth fixing before that
guard is ever extended. A handful of dead/superseded i18n keys remain from earlier implementations
(`priceFree`/`priceBasic`/etc., `editBillingInfo`, `downloadInvoice`). *Fix direction:* T34.

**Forms-gallery verdict (not a bug, ruled out):** `views/forms/billing/*` and `views/forms/checkout/*` are a
self-contained component/form-pattern gallery (routed under `/forms/billing`, `/forms/checkout`), not a
duplicate of the real billing flow — every handler calls a local `simulateError()` fake or a hardcoded
coupon map, never any real BFF route. No drift risk; correctly out of scope for this audit.

**Re-audit of `convert-frontend-10`'s F41 pattern (bare `fetch()`, zero auth forwarded) across all 7 billing
BFF routes: clean, not reproduced.** `address`, `cancel`, `create-setup-intent`, `history`,
`payment-methods`, `subscribe`, and `subscription` all correctly use `graphqlFetch()`, which forwards
cookies/session-tokens/UA/IP internally regardless of call site. Worth stating plainly since this was one of
the highest-prior risks going into this audit.

### 2.5 Flutter frontend — checkout, plans, settings/billing

**F26 — [Critical, Confirmed — independently re-verified] Subscribing to any paid tier is completely
broken: an invalid GraphQL enum value is sent on every attempt.** `views/checkout/page_content.dart:38-49`'s
`_priceId` returns `'price_basic'`/`'price_medium'`/`'price_premium'`, fed unchanged into
`api/server/billing/stripe.dart:60`'s `variables: {'tier': priceId}`, against a mutation declaring `$tier:
SubscriptionTier!`. The backend enum (confirmed directly at `billing.resolver.ts:169`) only accepts
`FREE|BASIC|MEDIUM|PREMIUM`. GraphQL rejects the variable at coercion time, before the resolver ever runs.
Pre-existing (introduced when this call site was migrated from REST to GraphQL), not part of today's
uncommitted work — the Subscribe button has not worked for any tier since that migration. *Fix direction:*
T1.

**F27 — [Critical, Confirmed — independently re-verified] Removing or setting a default payment method is
completely broken: wrong GraphQL argument name on every attempt.**
`api/server/billing/remove_payment_method.dart` and `set_default_payment_method.dart` both declare `mutation
...($id: ID!) { removePaymentMethod(id: $id) }` / `setDefaultPaymentMethod(id: $id)` — but the resolver
(confirmed directly, `billing.resolver.ts:237,246`) declares `@Args('paymentMethodId') paymentMethodId:
string`; there is no `id` argument anywhere in the schema. "Unknown argument" on every call, 100% of the
time. *Fix direction:* T2.

**F28 — [Medium/High, Confirmed] Plans/Checkout prices are wrong (missing cents, ~$1 low on every paid
tier) and 100% unlocalized.** `views/plans/page_content.dart:22,31,45,60` and
`views/checkout/page_content.dart:51-62` hardcode `'\$0'/'\$9'/'\$19'/'\$49'` against a real backend of
999/1999/4999 cents. The exact correct, already-localized strings exist unused in both ARB files
(`pricingPriceBasic` = "$9.99/mo", etc.) — this is a "wire it up" fix, not new copy or new translation
work. *Fix direction:* T15 (pricing correctness), T32 (i18n).

**F29 — [Medium, Confirmed] The disclosed "Plans page has zero i18n" gap (doc 10, T95) extends well beyond
the Plans page.** Card-entry labels (`components/ui/stripe_card_form.dart`), the entire 7-field billing
address form plus its Save button, and invoice pagination's "Page X of Y" text are all hardcoded English —
in every case, the matching ARB key already exists in both `app_en.arb`/`app_tr.arb` and is simply never
referenced. `invoice_pagination.dart` is internally inconsistent: its own Previous/Next buttons on the same
widget correctly use localized strings while the page-count text next to them doesn't. Everything else in
`settings/billing/page_view.dart` (tabs, subscription card, payment methods list, invoices header) is
correctly localized — these read as isolated oversights, not a systemic pattern. *Fix direction:* T32, T33.

**F30 — [Medium, Confirmed mismatch / Plausible impact] `Stripe.urlScheme` isn't registered on either
native platform; a 3DS/SCA redirect return may never reach the app.** `lib/stripe_provider.dart:11` sets
`Stripe.urlScheme = 'flutterstripe'`; neither `AndroidManifest.xml` nor `Info.plist` registers that scheme
(both register `flutterboilerplate`/`stripe` instead) — `flutterstripe` appears nowhere in either native
project. If a card issuer's SCA challenge needs a redirect-based (not in-app-modal) return, there is no OS
route back into the app. Compounding this: no timeout or cancel affordance exists around
`confirmSetupIntent`, so a hung challenge just leaves the Subscribe button spinning forever. *Fix
direction:* T30 (Stage E numbering — see §4 for the disambiguated task list; this is the "urlScheme +
timeout" task, listed there as T30 as well since it's the first task in that stage).

**F31 — [Medium, Confirmed] No idempotency key on subscribe; several billing action buttons have no
busy-guard against double-tap.** Web explicitly threads a per-attempt UUID into `subscribe()` specifically
to prevent a network-timeout retry from double-charging; Flutter's mutation string doesn't even declare an
`$idempotencyKey` variable, though the resolver accepts one. Separately, Cancel/Remove-card/Set-default/Add-card
handlers in `settings/billing/page_view.dart` have no in-flight/disabled state — rapid double-taps fire
concurrent mutations. Checkout's Subscribe button is the one billing action that does gate on a loading
flag; nothing else on the billing screen does. *Fix direction:* T28.

**F32 — [Medium, Confirmed] Real backend/Stripe error text is discarded everywhere; users only ever see
generic strings.** Every file in `api/server/billing/*.dart` throws a fixed literal (`'Failed to
subscribe'`, `'Failed to remove payment method'`, etc.) whenever the GraphQL response has errors, discarding
the actual message (card-decline reason, validation detail). The UI layer then just calls `.toString()` on
Dio's wrapper exception, never recovering the real cause. Web, by contrast, propagates the real error
message through. *Fix direction:* T29.

**F33 — [Low, Confirmed] Dead/duplicate code and two-layer API pattern drift across the billing+checkout
feature.** Zero call sites, verified by grep: `downgrade_section.dart`, `plan_summary_card.dart`,
`checkout_success_view.dart` (all three covered by F15g's fix instead of deletion), plus
`settings/billing/payment_methods.dart` (a whole separate widget + its own divergent `PaymentMethod` type,
never used — the real UI reimplements payment-method rendering inline against a *different* `PaymentMethod`
type), `api/client/billing/address.dart` and `payment_methods.dart` (proper two-layer client files per this
repo's own documented convention, bypassed in favor of calling the `*Server` providers directly from
`page_view.dart`), `types/plans/plan_tier.dart`/`types/premium/premium_tier.dart` (full models, never
constructed), and `hooks/use_min_tier.dart` (unused, duplicates `Tier.tierOrder` independently). *Fix
direction:* T35.

**F34 — [Low, Confirmed] The billing address form has zero client-side validation.**
`settings/billing/billing_address_form.dart:72-129` — plain `TextField`s, no `validator:`, submission always
allowed — despite `lib/validators/billing/schema.dart` already implementing
`validateCardholderName`/`validateBillingAddress`/`validateCity`/`validatePostalCode`/`validateCountry` and
being correctly wired into the unrelated `views/forms/...` demo gallery, just never into the real form.
*Fix direction:* T36.

**Re-verification of the three fixes sitting uncommitted in the working tree (doc 10's T93/T94/T95):**
`StripeElementsConfig` wraps every reachable `StripeCardFormField` — confirmed only 2 usages exist app-wide,
both wrapped, no other unguarded Stripe widget found anywhere. The cancel-dialog `Navigator.pop(dialogContext,
...)` fix is complete and consistent in both dialog actions. The Plans page's `isCurrent`/`included` tier
logic is correct for what it covers (backed by 3 passing widget tests) — it just sits directly next to F28
(wrong hardcoded prices) and F29 (zero i18n), pre-existing gaps that fix didn't touch. The previously-flagged
~100x invoice-display bug is re-confirmed still fixed, no regression (`page_view.dart`'s invoice amount still
divides by 100 exactly once).

---

## 3. Open decisions needing Berkay's sign-off before implementing

**3.1 Currency strategy (blocks T12, touches F17/F19).** The Plans/Checkout currency selector currently
promises something the backend can't deliver (real EUR/TRY billing). Two honest options: **(a)** gate the
currency switcher to display-only-USD (or hide it entirely) until real multi-currency Stripe Prices exist —
fast, but a visible feature regression; **(b)** actually build multi-currency support — a real Stripe Price
per tier per currency, a currency-aware `getPriceIdForTier`, and Stripe Checkout/Elements' own
currency-presentment handling — correct, but materially larger scope than anything else in this doc. This
doc's fix plan (§4) assumes (a) as the default unless Berkay picks (b), since (a) is the only option that
can ship this week.

**3.2 Dunning policy on a failed renewal or failed scheduled-change charge (blocks T7, F9).** Once
`handleInvoiceFailed` actually does something, what should the something be? Options: immediate downgrade to
FREE on first failure (harsh, but simple and matches the schema's existing tone); a grace period with N
retries before downgrading (needs a new scheduled job — nothing in this codebase currently runs one);
or notify-only, leaving Stripe's own retry schedule as the sole timer and just fixing the currently-stuck
`pendingTier` cleanup + adding a user-facing "payment failed" notification. This doc's fix plan defaults to
the last option (smallest surface area, no new infra) unless Berkay wants a real grace-period mechanism.

**3.3 Admin `setUserTier` vs. live Stripe state (blocks T24, F1).** Should this mutation be blocked outright
when the target user has a `stripeSubscriptionId` (forcing admins through real billing changes), just log a
warning and proceed (current behavior plus visibility), or actually drive a real Stripe change so the
override is durable across the next renewal? Smallest fix is the warning; most correct is driving a real
Stripe call.

**3.4 Cancellation-path unification (blocks T5, F2).** Proposed: consolidate onto `handleFullCancellation`'s
richer behavior (ledger row + outbox event + notification) and have the `cancelSubscription` mutation call
it directly, retiring the standalone method. Flagging in case either call site's current lighter-weight
behavior is intentional rather than an oversight — nothing in the code or prior docs suggests it is, but
worth a explicit yes before deleting a code path.

---

## 4. Proposed fix & build plan

Staged by rollout order, not by which findings-section a task came from — several tasks touch backend,
web, and Flutter in the same stage because F15's story requires it. Every task below is written to be
self-contained (files, exact current behavior, exact change, new tests) so it can be handed to an
implementer without flipping back to §2 — matching the density `convert-frontend-10-flutter.md`'s §8 used
for its own "with fix directions" pass. Where a fix touches Stripe's own API surface (webhook event names,
Subscription Schedule endpoints), the exact endpoint/event names are given, flagged for a quick check
against the installed `stripe` SDK version's types since this doc wasn't written with live API access.

### 4.1 Stage A — Ship today: critical, trivial, independent, zero design ambiguity

- [ ] **T1 — Flutter: send the real tier enum on subscribe.** File:
  `flutter-boilerplate/lib/views/checkout/page_content.dart:38-49`. Current code:
  ```dart
  String get _priceId {
    switch (widget.plan) {
      case 'basic': return 'price_basic';
      case 'medium': return 'price_medium';
      case 'premium': return 'price_premium';
      default: return '';
    }
  }
  ```
  Replace the whole getter with `String get _tier => widget.plan?.toUpperCase() ?? '';` (rename the
  getter — it was never actually a Stripe price ID, and the misleading name is very likely *why* this went
  unnoticed) and update its one call site at line 86 (`await billing.subscribe(_tier);`). No change needed
  in `api/server/billing/stripe.dart` — its `subscribe(String priceId)` parameter already forwards
  whatever string it's given straight into `variables: {'tier': priceId}`, which is correct once the
  caller sends `'BASIC'`/`'MEDIUM'`/`'PREMIUM'`. Don't touch the separate `_price` getter two lines below
  (line 51-62) — it's a *different* hardcoded-display-string bug, covered by T15. **Test:** add a unit test
  around `_priceId`/`_tier` (or an integration-style test using a `MockAdapter` on the Dio client) that
  asserts the GraphQL `variables` map sent for each of `'basic'/'medium'/'premium'` is exactly
  `{'tier': 'BASIC'}` / `{'tier': 'MEDIUM'}` / `{'tier': 'PREMIUM'}` — this exact class of bug (a hand-written
  mutation string never checked against the real schema) is what let this ship silently, so the regression
  test needs to actually inspect the outgoing request, not just that no exception was thrown.

- [ ] **T2 — Flutter: fix the payment-method GraphQL argument name.** Files:
  `flutter-boilerplate/lib/api/server/billing/remove_payment_method.dart` and
  `set_default_payment_method.dart`. Current code in both (only the mutation name differs):
  ```dart
  const _mutation = '''
    mutation RemovePaymentMethod(\$id: ID!) {
      removePaymentMethod(id: \$id)
    }
  ''';
  ...
  data: {'query': _mutation, 'variables': {'id': paymentMethodId}},
  ```
  Change to:
  ```dart
  const _mutation = '''
    mutation RemovePaymentMethod(\$paymentMethodId: String!) {
      removePaymentMethod(paymentMethodId: \$paymentMethodId)
    }
  ''';
  ...
  data: {'query': _mutation, 'variables': {'paymentMethodId': paymentMethodId}},
  ```
  (and the `SetDefaultPaymentMethod` equivalent in the sibling file) — matching the resolver's actual
  signature at `nest-js-boilerplate/src/billing/billing.resolver.ts:237,246`
  (`@Args('paymentMethodId') paymentMethodId: string`), which takes a plain `String!`, not `ID!` — the
  resolver never declared a GraphQL `ID` scalar for this argument, so keep the Dart-side type as `String!`
  to match exactly. **Test:** same shape as T1 — assert the literal `variables` map sent is
  `{'paymentMethodId': '<id>'}`, not `{'id': '<id>'}`, for both files.

- [ ] **T3 — Web: wire the billing-address Save button to the real mutation.** File:
  `next-js-boilerplate/src/views/settings/billing/FreePageView.tsx:91-96`. Current code:
  ```tsx
  <BillingAddressForm
    address={address}
    onSave={() => setIsEditingAddress(false)}
    onCancel={() => setIsEditingAddress(false)}
  />
  ```
  Import `useUpsertBillingAddress` from `@/api/client/billing/address` (already fully implemented, just
  never called) and replace the no-op with something like:
  ```tsx
  const upsertAddress = useUpsertBillingAddress();
  ...
  onSave={async (data) => {
    await upsertAddress.mutateAsync(data);
    setIsEditingAddress(false);
  }}
  ```
  wrapped in a try/catch (or let `BillingAddressForm` handle its own error display if it already has an
  error-prop convention — check its current signature first) so a failed save keeps the editor open with a
  visible error instead of silently closing either way. Also thread `isSaving={upsertAddress.isPending}`
  down to `BillingAddressForm` so its Save button can show a pending state — check whether
  `BillingAddressForm.tsx` already accepts an `isSaving` prop (it's referenced as a documented gap in F16's
  investigation, implying the prop type exists but nothing ever passed it) before adding a new one.
  **Test:** a component test rendering `FreePageView`, editing the address form, submitting, and asserting
  `upsertBillingAddressServer`/the underlying `graphqlFetch` call actually fired with the entered field
  values — not just that the editor closed, since "the editor closes" is exactly what the current broken
  no-op already does.

- [ ] **T4 — Housekeeping: commit everything already sitting correct-but-uncommitted in the tree.** No
  design work — this is `git add` + `git commit` for code already written and gate-verified in a prior
  session, so this doc's own Stage A-G work lands on a clean baseline instead of stacking on top of a
  week-old uncommitted diff. Files: `flutter-boilerplate/lib/views/checkout/page_content.dart`,
  `flutter-boilerplate/lib/views/plans/page_content.dart`,
  `flutter-boilerplate/lib/views/settings/billing/page_view.dart`,
  `flutter-boilerplate/test/test_helpers.dart`, the new `flutter-boilerplate/test/views/plans/` directory,
  `nest-js-boilerplate/.fallowrc.json`, `nest-js-boilerplate/src/billing/stripe-webhook.controller.ts` +
  `.spec.ts`, `nest-js-boilerplate/src/messaging/messaging-ws.gateway.ts`. Before committing: re-run
  `flutter test` and `npx jest src/billing src/messaging` fresh (not reused from memory of a prior run) as
  a final sanity check, since T1-T3 above land in two of these same Flutter files and should be committed
  as a separate, later commit on top of this baseline rather than mixed into it.

**Definition of done:** a real device/browser can subscribe to a paid tier, remove/set-default a payment
method, and save a billing address — all three currently cannot, at all, on any account.

### 4.2 Stage B — Close the deferred-billing (Subscription Schedule) lifecycle end-to-end

- [ ] **T5 — Backend: unify the two cancellation code paths.** Files:
  `nest-js-boilerplate/src/billing/billing.resolver.ts:269-275` (the `cancelSubscription` mutation) and
  `billing.service.ts:638-661` (the standalone `cancelSubscription` method) vs. `:364-434`
  (`handleFullCancellation`, the richer implementation — ledger row + `OutboxEvent` + notification).
  Change the resolver to call `handleFullCancellation(user.userId)` (check its exact parameter list — it's
  presumably already called from somewhere else, e.g. the FREE-tier branch of `subscribeToPlan`, so match
  that call shape) instead of the standalone method. Once nothing calls the standalone `cancelSubscription`
  method, delete it rather than leaving dead code — grep for other callers first (Flutter/web both go
  through the resolver, not the service method directly, so this should be safe, but confirm). **This is a
  prerequisite for T6** — with two implementations, T6's schedule-release logic would have to be written
  and tested twice. **Test:** update/add a `billing.service.spec.ts` case asserting the
  resolver-reachable cancellation path now also produces the `ADJUSTMENT` ledger row + `OutboxEvent` +
  notification that only `handleFullCancellation` used to produce.

- [ ] **T6 — Backend: close every exit path of the Subscription Schedule lifecycle.** This is the fix for
  F15a/F15b/F15c/F3 — the doc's headline bug. Three separate changes, all needed together:
  1. **Handle the schedule-released webhook.** File: `stripe-webhook.controller.ts`, add a new case to the
     event switch (alongside the existing `customer.subscription.updated`/`.deleted` cases) for
     `subscription_schedule.released` (and, for completeness, `.canceled`/`.aborted` — Stripe fires
     different ones depending on how a schedule ends). The event's data object is the Schedule itself,
     which carries the schedule's own `id` — match against the locally-stored
     `User.stripeSubscriptionScheduleId` column directly (`prisma.user.updateMany({ where: {
     stripeSubscriptionScheduleId: schedule.id }, data: { stripeSubscriptionScheduleId: null } })`) rather
     than looking up by customer id, since matching on the schedule id itself is the more precise key and
     avoids clobbering a *newer* schedule id if events ever arrive out of order.
  2. **Release the schedule on cancellation.** Inside the now-unified cancellation path from T5: before/
     alongside writing `cancelAtPeriodEnd: true`, check `lockedUser.stripeSubscriptionScheduleId` — if set,
     call Stripe's `subscriptionSchedules.release(scheduleId)` (releases the schedule and returns the
     subscription to normal management, which is what you want here since the cancellation itself is
     already being expressed via `cancel_at_period_end` on the subscription directly — `.cancel()` instead
     of `.release()` would be wrong, since that cancels the underlying subscription too, redundant with
     what the cancellation flow already does). In the same DB write, clear
     `pendingTier`/`pendingTierEffectiveAt`/`stripeSubscriptionScheduleId` together.
  3. **Add an escape hatch from a pending change (F3).** In the tier-change entry method
     (`billing.service.ts:64-66`'s guard, `if (targetRank === currentRank) throw new
     BadRequestException('Already on this tier')`): special-case `targetTier === user.subscriptionTier &&
     user.pendingTier != null` — instead of throwing, call the same `subscriptionSchedules.release()` as
     above, clear the three pending fields, and return a success result (add a `reason:
     'pending_change_cancelled'` or similar to `SubscribeResult` so the frontend can show a distinct
     "your scheduled change was cancelled" message rather than a generic success).
  **Tests:** (a) a webhook spec case for `subscription_schedule.released` asserting
  `stripeSubscriptionScheduleId` is nulled; (b) a cancellation spec case asserting that when
  `pendingTier`/`stripeSubscriptionScheduleId` are set at cancel time, the Stripe release call fires and all
  three fields clear; (c) a tier-change spec case asserting re-selecting the current tier while a change is
  pending releases it instead of throwing `BadRequestException`.

- [ ] **T7 — Backend: handle `invoice.payment_failed` and `past_due`/`unpaid` status.** [Decision-gated —
  see §3.2; guidance below assumes the smallest-scope "notify-only" option unless Berkay picks otherwise.]
  File: `stripe-webhook.controller.ts:200-216` (`handleInvoiceFailed`, currently only `logger.warn`).
  Look up the user by `stripeCustomerId` (mirror the exact lookup pattern already used in
  `handleInvoicePaid`). If `user.pendingTier` is set, this failed invoice is very likely the scheduled
  change's own renewal charge — clear `pendingTier`/`pendingTierEffectiveAt` (and release the schedule the
  same way as T6, since it's now moot) so the UI stops claiming a change is still coming. Write a
  `NotificationType.BILLING` notification (the schema already has this type; find its existing construction
  pattern elsewhere in this file, e.g. around the cancellation/upgrade notifications, and mirror it) telling
  the user their charge failed. Separately, in `handleSubscriptionUpdated` (`:364-397`), read
  `subscription['status']` (currently never inspected) and log a warning at minimum when it's `'past_due'`
  or `'unpaid'` — full downgrade-after-N-retries policy is bigger scope (needs a scheduled job this
  codebase doesn't have yet, see §6) and should not be built silently as part of this task if Berkay didn't
  ask for it. **Test:** webhook spec cases for `invoice.payment_failed` with and without a `pendingTier` set,
  asserting the field-clearing + notification only fires in the pending-change case (a plain renewal
  failure with no pending change shouldn't touch `pendingTier` since there isn't one).

- [ ] **T8 — Web: branch checkout messaging on the actual change type.** Files:
  `next-js-boilerplate/src/views/checkout/CheckoutContent.tsx:45-49,66-76,25-34`, the BFF's subscribe route
  and whatever GraphQL document defines `SUBSCRIBE_MUTATION` (`src/api/server/billing/stripe.ts` or
  co-located). First, add `pendingTier`/`pendingTierEffectiveAt` to `SUBSCRIBE_MUTATION`'s selection set —
  currently only `success/reason/periodEnd` are selected, so there's no data path for the new messaging
  even once written. In `CheckoutContent.tsx`, derive a three-way `changeType` instead of the current
  rank-only `isUpgrade`/`isDowngrade`: `currentTier === 'FREE'` → `'immediate'` (existing copy/redirect
  behavior stays as-is); `currentTier !== 'FREE' && targetTier !== 'FREE'` → `'scheduled'` (new branch: show
  something like "Your plan will change to `{targetTier}` on `{pendingTierEffectiveAt}`" using the mutation
  response's own date rather than any client-computed guess, and drop or lengthen the 2-second
  auto-redirect since there's no urgency for a change that hasn't happened yet); `targetTier === 'FREE'` is
  the cancellation flow and likely already routed through a different entry point — confirm during
  implementation rather than assume. **Test:** a `CheckoutContent` test per branch asserting the correct
  copy renders for a FREE→paid vs. paid→paid subscribe response.

- [ ] **T9 — Web: gate Cancel/Upgrade controls on an existing pending change.** File:
  `next-js-boilerplate/src/views/settings/billing/PlanDetails.tsx` (already receives `pendingTier`/
  `pendingTierEffectiveAt` as props, confirmed — the gap is purely in how they're used). Currently the
  Cancel button only checks `cancelAtPeriodEnd` and the Upgrade-Plan link is unconditionally active. Add a
  branch: when `pendingTier` is set, replace both with a single "You have a change to `{pendingTier}`
  scheduled for `{date}` — cancel that first" affordance (calling T6's new
  `pending-change-cancel path) rather than letting Upgrade/Cancel be clicked into a conflicting second
  change. Also fetch `pendingTier` on `views/plans/PageContent.tsx` (currently doesn't at all) and show an
  equivalent banner/disable state there, since Plans is the more common entry point into initiating a
  second change. **Test:** a `PlanDetails` test asserting Cancel/Upgrade are replaced by the pending-change
  affordance when `pendingTier` is non-null.

- [ ] **T10 — Flutter: fetch and render `pendingTier`.** Files:
  `flutter-boilerplate/lib/api/server/billing/subscription.dart` (the `_subscriptionQuery` string and
  whatever model class parses its response — confirm the exact class name in this file, referred to as
  `SubscriptionInfo` in this audit's notes) and `lib/views/settings/billing/page_view.dart`'s
  `_SubscriptionCard`. Add `pendingTier` and `pendingTierEffectiveAt` to the query's selection set and the
  model's fields (mirroring how `cancelAtPeriodEnd` is already threaded through both). In
  `_SubscriptionCard`'s build method, add a pending-change notice mirroring T9's web copy, and gate the
  Upgrade/Cancel buttons the same way. While in this file: `api/server/billing/stripe.dart:21-32,74-88`
  has a second, duplicate `mySubscription` query (confirmed dead, zero call sites, also flagged separately
  under F33/T35) — delete it here rather than updating it, since maintaining two query strings for the
  same data is exactly how this kind of field-parity gap happens in the first place. **Test:** extend
  doc-10's `test/views/plans/page_content_test.dart`-style provider-override pattern to
  `_SubscriptionCard`, asserting the pending-change notice renders and buttons are gated when a test fixture
  sets `pendingTier`.

- [ ] **T11 — Flutter: wire real upgrade/downgrade/current-plan branching into checkout.** File:
  `flutter-boilerplate/lib/views/checkout/page_content.dart`, wiring in the three currently-dead
  `downgrade_section.dart`, `plan_summary_card.dart`, `checkout_success_view.dart`. Make
  `CheckoutPageContent` read `userTierProvider` (same provider T10/doc-10's T95 already established the
  pattern for), and compute `isCurrent`/`isUpgrade`/`isDowngrade` using the same `Tier.hasAccess`/tier-rank
  comparison already used on the Plans page — don't reimplement this logic a third time. Branch: already on
  this tier → render `plan_summary_card.dart`'s "already subscribed" state instead of a card form; target
  tier is a downgrade *or* an upgrade **from an existing paid tier** (both now go through the Subscription
  Schedule per `49f34582`, so both need the same non-charging confirmation UI, not just downgrades despite
  the widget's name — verify `downgrade_section.dart`'s actual implementation isn't hardcoded
  downgrade-only wording before reusing it for upgrades-from-paid too, generalize its copy if it is); target
  tier is an upgrade **from FREE** → keep today's existing full SetupIntent/card-entry flow, since that
  path is genuinely unchanged by `49f34582`. On success, route through `checkout_success_view.dart` instead
  of whatever inline success handling exists today. **Test:** widget tests per branch (current/upgrade-from-free/
  upgrade-from-paid/downgrade), mirroring doc-10 T95's provider-override test pattern, asserting the right
  widget renders and the right billing action gets called for each.

**Definition of done:** a real account can change between two paid tiers twice in a row without hitting a
permanent `subscription_schedule_failed` error; both frontends correctly show "changes on `<date>`" instead
of a false immediate-success message for a paid↔paid change; neither frontend lets a user stack a second
change on top of a pending one; a pending change can be cancelled back to the current tier without an
"Already on this tier" error.

### 4.3 Stage C — Currency & pricing correctness

- [ ] **T12 — Resolve the cosmetic-currency-selector problem.** [Decision-gated — see §3.1.] **If option
  (a) (gate to USD):** find the currency selector component (`useCurrencyCookie`/`CurrencyProvider` per
  Agent C's citations) and either hide it entirely on Plans/Checkout/Billing routes, or restrict its option
  list to USD only on those routes specifically — don't rip out the cookie/provider wholesale if it's used
  for non-billing locale formatting elsewhere in the app; check its other call sites first. Remove the
  EUR/TRY-formatted price displays this enables on `PageContent.tsx`/`PlanSummaryCard.tsx`. **If option (b)
  (real multi-currency):** bigger surface — `getPriceIdForTier` needs a `(tier, currency)` signature
  instead of `(tier)`, one Stripe Price per tier per currency (or Stripe's native multi-currency Price
  `currency_options`) needs creating in the Stripe dashboard/via API, `subscribeToPlan`'s GraphQL args need
  a currency parameter threaded from the frontend's cookie value, and every hardcoded `currency: 'USD'`
  ledger write in `billing.service.ts` (4 sites per Agent A's A8/F17 citations) needs to use the real
  charged currency instead. Treat (b) as its own follow-up phase rather than a task inside this one if
  chosen — it's sized differently from everything else in this stage.

- [ ] **T13 — Web: use real currency instead of hardcoded `$`/`"USD"`.** Two call sites: (1)
  `InvoiceTable.tsx:98`, currently `` `$${(tx.amount / 100).toFixed(2)}` `` — replace with
  `formatPrice(tx.amount, tx.currency)` using the existing helper from `lib/currency.ts` (the route already
  fetches `tx.currency` per `history/route.ts:13`, just never uses it). (2) `PlanDetails.tsx:72-74`,
  currently `formatPrice(TIER_PRICES_CENTS[tier] ?? 0, "USD")` — replace with the real
  `subscription.priceCents`/`subscription.currency` already fetched by `subscription/route.ts:6-19` (thread
  them down as props if `PlanDetails` doesn't already receive the full `mySubscription` object). **Test:**
  update `InvoiceTable`/`PlanDetails` tests with a non-USD fixture transaction/subscription and assert the
  correct currency symbol/format renders, not just USD.

- [ ] **T14 — Backend: unify the two independent price sources.** File: `billing.service.ts:694-703`
  (`getSubscription`'s `priceCents`, currently reads `PRICE_${tier}` env vars with a hardcoded fallback
  table) vs. `stripe/stripe.service.ts:137-140` (`getPriceIdForTier`, reads `STRIPE_PRICE_${tier}`, the
  actual charged Price). Add a `getPriceInfoForTier(tier): Promise<{cents: number; currency: string}>`
  method to `StripeService` that calls `stripe.prices.retrieve(getPriceIdForTier(tier))` and reads
  `.unit_amount`/`.currency` directly from Stripe — cache the result (in-memory, e.g. a `Map` populated on
  first access per tier, since Stripe Prices essentially never change at runtime) to avoid a live API call
  on every `getSubscription` read. Have `getSubscription` call this instead of reading `PRICE_${tier}`, then
  delete the `PRICE_*` env vars entirely so there's exactly one place per tier to configure a price, not
  two. **Test:** a `getSubscription` spec asserting `priceCents` matches a mocked Stripe Price's
  `unit_amount`, not an env var.

- [ ] **T15 — Flutter: fix hardcoded Plans/Checkout prices.** Files:
  `views/plans/page_content.dart:22,31,45,60` and `views/checkout/page_content.dart:51-62` (the `_price`
  getter — distinct from T1's `_priceId`/`_tier` fix). Replace the hardcoded `'\$0'/'\$9'/'\$19'/'\$49'`
  strings with the already-correct, already-localized ARB getters: `t.pricingPriceBasic` ("$9.99/mo"),
  `t.pricingPriceMedium` ("$19.99/mo"), `t.pricingPricePremium` ("$49.99/mo") — confirm both files have an
  `AppLocalizations`/`t` accessor available (`plans/page_content.dart` gained Riverpod access via doc-10's
  T95 but may not yet import `AppLocalizations`; `checkout/page_content.dart` likely already does, for its
  card-form labels — verify both during implementation). **Test:** update/extend the existing
  `page_content_test.dart` widget tests to assert the correct ARB-sourced price string renders per tier.

**Definition of done:** every price shown anywhere in either app is derived from the same backend-sourced
cents amount and currency Stripe will actually charge — no hand-rolled `$`/`"USD"`/static-cents literal
remains at any billing call site.

### 4.4 Stage D — Webhook & write-path financial-integrity hardening

- [ ] **T16 — Backend: handle refunds and disputes.** File: `stripe-webhook.controller.ts`, add cases for
  `charge.refunded` and `charge.dispute.created`. For `charge.refunded`: the event's Charge object carries
  `payment_intent`/`amount_refunded`/`refunded` (bool). Look up the matching `WalletTransaction` by
  `stripePaymentIntentId` (the column already exists, written on the sync-subscribe path per F8/A11's
  citation), write a new `type: REFUND` ledger row referencing it (the enum value already exists, unused
  until now). Whether a full refund should also revoke tier access is a real product question not covered
  by §3 — recommend *not* auto-downgrading on refund without an explicit decision (a refund can be a
  goodwill customer-service gesture that doesn't end service) and just recording it + notifying the user for
  now; flag this sub-decision to Berkay if it comes up during implementation rather than guessing. For
  `charge.dispute.created`: no existing ops-alerting channel exists in this codebase (no admin dashboard,
  no external alerting integration found) — a structured `logger.error` plus the same user-facing
  `NotificationType.BILLING` notification is the realistic scope here, not a new alerting system. **Test:**
  webhook spec cases for `charge.refunded` (asserts a `REFUND` row is written, matched to the right original
  transaction) and `charge.dispute.created` (asserts it's logged/notified, doesn't crash).

- [ ] **T17 — Backend: guard against out-of-order webhook delivery.** File: `stripe-webhook.controller.ts`,
  `handleSubscriptionUpdated` (`:364-397`). Add a `ProcessedWebhookEvent { eventId String @unique,
  processedAt DateTime }` Prisma model (new migration); at the top of the webhook handler (or per
  event-type, if some event types are cheap enough to safely double-process), check-and-insert the incoming
  `event.id`, skip processing if it already exists — this solves true redelivery (Stripe retrying the exact
  same event). Full temporal out-of-order handling (two *different* events for the same subscription
  arriving reversed) needs a second piece — store the event's own `created` timestamp on the `User` row
  (e.g. a new `lastSubscriptionEventAt` field) and skip a write if the incoming event is older than what's
  already recorded — treat this as a stretch goal within the same task rather than a separate one, since it
  needs the same migration either way. **Test:** a spec case delivering the same `customer.subscription.updated`
  event twice, asserting the second delivery is a no-op; a second case delivering two events out of temporal
  order, asserting the older one doesn't overwrite the newer one's data.

- [ ] **T18 — Backend: log unknown Stripe price IDs.** File: `stripe-webhook.controller.ts:218-227`
  (`getBilledTier`) / `stripe.service.ts:143-149` (`getTierForPriceId`). Add
  `this.logger.warn(\`No tier mapping for Stripe price ${priceId}\`)` on the null-return path. Trivial,
  no test required beyond confirming the existing behavior (safe fallback to current tier) is unchanged.

- [ ] **T19 — Backend: log unmatched customers on `customer.subscription.updated`.** File:
  `stripe-webhook.controller.ts:387-396`. `prisma.user.updateMany(...)`'s return value includes `count` —
  check it and `logger.warn` when `count === 0`, mirroring the pattern `handleInvoicePaid`/
  `handleInvoiceFailed` already use for the same situation. Trivial.

- [ ] **T20 — Backend: fix a misleading log line and exempt the webhook from rate limiting.** File:
  `stripe-webhook.controller.ts:312-324` — branch the redelivery-skip log message on whether
  `user.stripeSubscriptionId` is actually truthy, instead of always saying "replacement subscription is
  active" even when there is none. Also add `@SkipThrottle()` (matching the existing pattern in
  `src/throttle/throttle.controller.ts:14`) to the webhook controller, since signature verification is
  already the real security gate and rate-limiting only risks 429-ing legitimate Stripe retry bursts.
  Trivial, no new test required.

- [ ] **T21 — Backend: add a concurrency guard to cancellation.** File: `billing.service.ts`, the
  now-unified cancellation path from T5. Wrap it in the same per-user `pg_advisory_xact_lock(hashtext(userId))`
  pattern already used in `handleFirstSubscribe`/`handleTierChange` (see T74's precedent in
  `convert-frontend-10-flutter.md` §8 for the exact raw-query-inside-`$transaction` shape used elsewhere in
  this file). **Test:** a concurrency spec firing two simultaneous cancel calls for the same user, asserting
  the second either no-ops cleanly or returns the first's result, never a raw unique-constraint 500.

- [ ] **T22 — Backend: move Stripe API calls outside the open DB transaction.** Files:
  `billing.service.ts:110-191` (`handleFirstSubscribe`) and `:460-546` (`handleTierChange`). Restructure so
  the sequence is: acquire the advisory lock and read current state in a short transaction → release it →
  make the Stripe API call(s) *outside* any open transaction → open a second, short transaction to write
  the results (re-acquiring the lock, or holding it across the gap via a different mechanism — this needs
  care to avoid reintroducing the exact race T74/F13 already closed once). Flag this as the highest-risk
  task in this stage structurally, since it changes the concurrency-control shape that a prior critical fix
  depended on — implement and re-run the full F13/T74 regression suite (concurrent first-subscribe,
  concurrent tier-change) before considering this done, not just this task's own new tests.

- [ ] **T23 — Backend: make the decline-retry dedup path real (or remove it).** File: `billing.service.ts`,
  `findRetryResult`'s FAILED branch (`:204-220`) and the decline branch that currently writes nothing
  (`:165-168`). Recommended: implement it for real rather than deleting it — on a Stripe decline, write a
  `WalletTransaction` with `status: 'FAILED'` (the enum value already exists) keyed the same way successful
  rows are, so `findRetryResult` actually has something to find on a genuine retry and its existing test
  stops asserting a lie. **Test:** update the existing spec so its setup actually produces the FAILED row
  the assertion expects, rather than mocking the read side only.

- [ ] **T24 — Backend: guard admin `setUserTier` against live Stripe state.** [Decision-gated — see §3.3.]
  File: `nest-js-boilerplate/src/authorization/admin.resolver.ts:137-173`. Depending on Berkay's pick: (i)
  block outright — `if (user.stripeSubscriptionId) throw new BadRequestException(...)`; (ii) warn and
  proceed — `logger.warn` when overriding a user with a live subscription, no behavior change; (iii) drive a
  real Stripe change — call into the same tier-change logic T6 hardens, so the override is durable across
  the next renewal instead of being silently reverted. No test file exists for `admin.resolver.ts` today —
  add one regardless of which option is picked, since this mutation currently has zero coverage.

**Definition of done:** a refund/chargeback in the Stripe dashboard is reflected in the local ledger; a
double-click cancel produces a clean "already cancelled" instead of a 500 or a duplicate row; a transaction
timeout can no longer leave a real Stripe charge with zero local record.

### 4.5 Stage E — UX correctness & double-submit/error-fidelity hardening

- [ ] **T25 — Web: wire up PaymentMethods' set-default/remove controls.** File:
  `views/settings/billing/PaymentMethods.tsx`. Add interactive buttons to the card list, calling the
  already-implemented `useSetDefaultPaymentMethod`/`useRemovePaymentMethod` hooks
  (`api/client/billing/payment-methods.ts`) — both fully working against a working BFF route today, just
  never attached to a UI element. Add a confirm dialog for remove, matching whatever confirm-dialog pattern
  the app already uses for other destructive billing actions (e.g. cancel-subscription's confirm flow).
  **Test:** a `PaymentMethods` test asserting clicking remove/set-default calls the right mutation with the
  right payment method id.

- [ ] **T26 — Web: harden `DowngradeSection` against double-submit.** File:
  `views/checkout/DowngradeSection.tsx`. Add a `submitting` state disabling the button for the call's
  duration, and a persisted-per-attempt idempotency key (a `useRef` UUID, set once per flow attempt, not
  regenerated on every render) passed into `subscribe(targetTier, idempotencyKey)` — mirror
  `StripeCardForm.tsx`'s existing `retryKeyRef` pattern exactly rather than inventing a new one. **Test:** a
  test simulating a rapid double-click, asserting only one `subscribe` call fires.

- [ ] **T27 — Web: fix two copy bugs.** (1) `BillingAddressForm.tsx:111` — add a new, neutral `cancel` i18n
  key distinct from the reused `cancelSubscription` one, use it on the address form's cancel button. (2)
  `PaymentMethods.tsx:87-91` — change the already-default card's badge from the imperative `t.makeDefault`
  ("Make default") to a passive label like "Default" (check both locale files for an existing suitable key
  before adding a new one). Trivial, no new tests needed beyond a snapshot/text-content check if this
  component already has one.

- [ ] **T28 — Flutter: add idempotency key + busy-guards.** File: `api/server/billing/stripe.dart`'s
  `_subscribeMutation` — add an `$idempotencyKey: String` variable (the resolver already accepts one,
  `billing.resolver.ts:171`) and generate a UUID per checkout attempt (check `pubspec.yaml` for an existing
  `uuid` package dependency before adding one) persisted the same way web's `retryKeyRef` is — set once when
  the user starts the flow, not regenerated per keystroke/rebuild. Separately, in
  `settings/billing/page_view.dart`, add a simple `_busy` boolean (mirroring checkout's existing `_loading`
  pattern) to each of the Cancel/Remove-card/Set-default/Add-card handlers, disabling the respective button
  while a request is in flight — currently only the Subscribe button on the checkout screen has this at
  all. **Test:** assert the idempotency key is present and stable across a retry (not regenerated) in a
  subscribe-flow test; assert each newly-guarded button is disabled during its own in-flight request.

- [ ] **T29 — Flutter: surface real error text.** Files: every file under `api/server/billing/*.dart`.
  Each currently throws a fixed literal (e.g. `'Failed to subscribe'`) whenever `body['errors'] != null`,
  discarding the actual GraphQL error message. Change each to extract
  `(body['errors'] as List).first['message'] as String?` and include it in the thrown exception's message,
  falling back to the current generic string only when the server didn't provide one. **Test:** a test
  mocking a GraphQL error response with a specific message, asserting the thrown exception's message
  contains it, not the generic fallback.

- [ ] **T30 — Flutter: fix the Stripe urlScheme mismatch and add a 3DS timeout.** File:
  `lib/stripe_provider.dart:11` — change `Stripe.urlScheme = 'flutterstripe'` to `'flutterboilerplate'`,
  matching what's actually registered in both `android/app/src/main/AndroidManifest.xml` and
  `ios/Runner/Info.plist` (the smaller-diff option; registering `flutterstripe` natively in both projects
  instead is the alternative if there's a reason to keep the code-side constant as-is). In
  `checkout/page_content.dart`, wrap the `confirmSetupIntent` call in a `.timeout(const
  Duration(seconds: 60))` with a catch branch that resets the loading state and shows a "This is taking
  longer than expected" error instead of leaving the Subscribe button spinning indefinitely. **Test:**
  hard to unit-test the native redirect itself meaningfully (same reasoning doc-10 gave for not testing
  T93/T94's native-timing races) — the timeout wrapper itself is testable with a fake delayed future.

### 4.6 Stage F — i18n completion (keys already exist in almost every case — this is "wire it up" work)

- [ ] **T31 — Web: localize `StripeCardForm`.** File: `features/billing/ui/StripeCardForm.tsx` — no
  `useMessages` import at all today. Add it (matching the hook/pattern other billing components use),
  replace the ~6 hardcoded strings ("Initializing payment...", "Processing...", "Subscribe", error
  fallbacks) with i18n keys — `processing`/`subscribeTo`/`paymentFailedGeneric` already exist in
  `messages/en(tr)/checkout/messages.json` unused; audit exactly which of the remaining strings need new
  keys added during implementation.

- [ ] **T32 — Flutter: wire existing ARB keys into card-entry, address form, and pagination.** Three call
  sites, all "the key already exists, just isn't referenced": `components/ui/stripe_card_form.dart:35,54`
  → `t.checkoutCardholderName` etc.; `settings/billing/billing_address_form.dart:74-129` → the 7 already-
  existing `t.settingsName/Street/City/State/Country/ZipCode/VatNumber` + `t.settingsSaveAddress` keys;
  `invoice_pagination.dart:39`'s "Page X of Y" text has no existing matching key (unlike its own
  Previous/Next buttons, which already correctly use `t.settingsPrevious`/`t.settingsNext`) — add one to
  both `app_en.arb`/`app_tr.arb` and run `flutter gen-l10n` to regenerate.

- [ ] **T33 — Flutter: localize the Plans page's pending strings from doc 10's T95.** That fix
  deliberately shipped "Current Plan"/"Included" as hardcoded English since the whole page had zero i18n at
  the time. Now that T15/T32 are touching this same page anyway, add ARB keys for both strings and wire
  them in during the same pass rather than a separate one.

### 4.7 Stage G — Low-priority hygiene

- [ ] **T34 — Web: four small fixes.** `PlanDetails.tsx:119` — `{t.cancelsOn}` renders as a dangling
  sentence fragment with no date; fix to interpolate the real `cancelAtPeriodEnd`/`subscriptionPeriodEnd`
  date using whatever interpolation convention this app's other date-containing i18n strings already use.
  `FreePageView.tsx:36` — destructure `isLoading` from the subscription query and gate rendering on it so
  `cancelAtPeriodEnd` doesn't flash `false` before the real value loads. Add `csrfEchoHeaders()` to the
  remaining 5 of 7 billing BFF routes (`address`, `payment-methods`, `create-setup-intent`, `history`,
  `subscription`) for consistency, even though currently inert. Remove the dead i18n keys
  (`priceFree`/`priceBasic`/`priceMedium`/`pricePremium`, `editBillingInfo`, `downloadInvoice`) from both
  locale files.

- [ ] **T35 — Flutter: clean up dead/duplicate billing code.** Delete
  `settings/billing/payment_methods.dart` (superseded by inline rendering in `page_view.dart` — re-grep for
  zero imports immediately before deleting, in case T10/T11's work changed anything) and
  `types/plans/plan_tier.dart`/`types/premium/premium_tier.dart`/`hooks/use_min_tier.dart` if still
  zero-call-site at implementation time. Decide one direction for the two-layer API pattern drift: either
  route `page_view.dart`'s reads through the existing `api/client/billing/address.dart`/
  `payment_methods.dart` wrapper classes (matching this repo's documented two-layer convention — check the
  `flutter-conversion` skill for the stated rule before converging), or delete those wrapper files too if
  direct-server-provider access is deliberately preferred here. Don't delete either side arbitrarily without
  checking which one the convention actually mandates.

- [ ] **T36 — Flutter: add billing-address form validation.** File:
  `settings/billing/billing_address_form.dart:72-129` — plain `TextField`s today, no validation. Convert to
  `TextFormField`s inside a `Form`/`GlobalKey<FormState>`, wiring in the already-implemented
  `lib/validators/billing/schema.dart` functions (`validateCardholderName`/`validateBillingAddress`/
  `validateCity`/`validatePostalCode`/`validateCountry`) — mirror the exact pattern already used correctly
  in the `views/forms/...` demo gallery rather than inventing a new validation wiring approach.

---

## 5. Verify / definition of done (whole-doc gate)

**Automated gates, run fresh (not reused from any stage's own note):**
- Backend: `nest build` (incl. fallow), full `npx jest`, `npx jest src/billing` specifically — new/updated
  tests required for T6 (schedule lifecycle: release on success, release on cancel, re-select-current-tier),
  T7 (dunning), T16 (refund), T5 (unified cancellation).
- Web: `pnpm typecheck`, `pnpm eslint`, full `vitest run` — new/updated tests required for T3 (address save),
  T8/T9 (checkout messaging + button gating on a pending change), T13 (currency), T20 (double-submit guard).
- Flutter: `flutter analyze`, `dart format --set-exit-if-changed`, full `flutter test` — new/updated tests
  **required, not optional**, for T1 and T2 specifically: both shipped broken with zero test coverage
  catching either, and both are now easy to cover (a widget/unit test asserting the exact GraphQL variables
  sent would have caught both on day one). Also for T10/T11 (pendingTier UI + checkout branching).

**Live round-trip checklist (Stripe test-mode keys — confirm test-mode before any of this, per
[[convert-frontend-10-register]]'s established caution), both platforms where applicable:**
1. Subscribe FREE → paid (any tier) — confirm it actually succeeds post-T1.
2. Upgrade paid → paid — confirm it's scheduled, not immediate; confirm correct "changes on `<date>`"
   messaging on both platforms.
3. Downgrade paid → paid — same, plus confirm access is retained at the *current* tier until the boundary.
4. Re-select the current tier while a change is pending — confirm it releases the pending change instead
   of erroring.
5. Cancel outright while a change is pending — confirm the schedule is actually released Stripe-side (not
   just locally).
6. Cancel outright with no pending change (baseline regression check).
7. Change tiers twice in a row (upgrade then downgrade, or vice versa) — this is the scenario F15a made
   permanently broken; confirm the second change succeeds.
8. Add / remove / set-default a payment method on both platforms — confirm post-T2 this actually works on
   Flutter for the first time.
9. Decline a card at subscribe time — confirm the error message shown is specific, not generic (post-T29 on
   Flutter).
10. Let a scheduled change actually reach its renewal boundary (needs a Stripe test clock, not real time) —
    confirm `pendingTier` clears and the new price takes effect.
11. Fail a card at the scheduled renewal boundary (Stripe test clock) — confirm whatever T7 dunning policy
    was chosen actually fires.
12. Issue a refund from the Stripe test-mode dashboard — confirm the ledger and access both update (T16).

---

## 6. Queue for next phase / explicitly out of scope

- Real multi-currency Stripe Price setup, if §3.1 resolves toward option (b) instead of (a) — sized like
  its own phase, not a task inside this one.
- A real trial-period or pause-subscription feature — `trial_will_end`/`subscription.paused` webhook
  support was checked and confirmed genuinely unused/not-a-feature today (not a bug, just not built); out
  of scope unless Berkay wants to add the feature itself, not just the webhook plumbing for it.
- `convert-frontend-10`'s still-open infra items (T78 MinIO/openresty route, live MFA round-trip) — tracked
  in that doc, not duplicated here.
- A scheduled reconciliation job (e.g., nightly sweep for stuck `pendingTier`/past-due subscriptions) — T7's
  smallest-scope option avoids needing this, but if Berkay picks a grace-period dunning policy in §3.2, this
  becomes required infrastructure and deserves its own design pass, not a bullet inside T7.
