# Phase 17 — Subscriptions & pricing: mock checkout, per-tier page views, WS tier gate

> Execution tracker for the seventeenth phase of the [stack roadmap](../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-05 · Status: **planning only — no code written for this tracker yet**,
> per the project's "plan phase N = write only phaseN.md" convention.

Re-scope note (2026-07-05): phase 17 was queued as the cross-stack e2e suite
([phase16.md](phase16.md) queue). Berkay re-prioritized to **subscriptions & pricing**:
scenarios for which page renders differently per `SubscriptionTier`, a mock payment
page (test-card checkout, no real provider yet — "later we will do real provider"),
and backend HTTP **and** WS enforcement to match. The e2e suite moves down the queue
again (now 18) — same pattern Phase 4/14/15/16 each used when re-scoping away from it.

## Relationship to Phase 16

`phase16.md` (Status header still reads **"NOT gate-clean"**, its own punch list of 10
lettered findings) is **not actually still broken** — checked `git log` for the range
after that control run was written: commit `957a4e9` ("fix: resolve 10 blocking bugs
from Phase 16 control run") addresses all 10 punch-list items by name in its message
(T22 `Boolean!`/`Promise<void>`, T15 truncated collision suffix, T1/T7
`MockTokenStore.updateFields`, T3 `prisma.session` sweep across 4 e2e specs, T31
`SMTP_HOST=mailpit` default, T27 `/auth` link prefix, T26 i18n key + redirect, T11
`console.error` object-passing, T17/T18/T20/T21 missing tests backfilled), and a
follow-up commit `9d3448c` hardened SMTP to implicit-TLS port 465. This is the
**fourth** occurrence of this project's recurring "commit lands, tracker untouched"
pattern (after phases 2, 12, 13, 15) — flagging it once per the established lesson
rather than assuming either "still broken" or "silently fine". Stage A below re-verifies
and closes the tracker before Stage B's new scope starts, mirroring how Phase 16 itself
absorbed Phase 15's carried debt into its own Stage A.

## Survey (2026-07-05) — tier RBAC infrastructure as it exists today

This is **not greenfield**. Two prior phases already built the tier system this phase
extends:

- **`SubscriptionTier` enum is real**: `FREE | BASIC | MEDIUM | PREMIUM`
  (`nest-js-boilerplate/prisma/schema.prisma:51-56`), `User.subscriptionTier`
  (`:259`, `@default(FREE)`, indexed). Four tiers, not three.
- **Tier lives in the Redis session hash**, not the JWT (`token-store.service.ts`),
  and is rewritten live across every session in `user:{userId}:sessions` via
  `TokenStoreService.rewriteFieldsForUser()` when it changes — no forced logout, the
  client's next 401 triggers exactly one silent-refresh round-trip
  (`docs/backend/AUTH.md` "Tier change semantics"). `SessionAuthGuard` re-derives
  `rbacToken` from the **live** Redis tier on every request.
- **Backend RBAC primitives already exist** in `nest-js-boilerplate/src/authorization/`:
  `@MinTier(SubscriptionTier.X)` decorator + `TierGuard` (run after `SessionAuthGuard`),
  demoed today by `AdminResolver.premiumStats` (`@MinTier(BASIC)`) and
  `AdminResolver.setUserTier` (admin-only, propagates to Redis). **Gap found, not
  fixed here to avoid scope creep**: `setUserTier` has no `CsrfGuard`, unlike
  `logoutOtherSessions`'s equivalent mutation — fixed in Stage B alongside the new
  self-serve mutation since it's the same file/pattern (D-note below).
- **Frontend primitives already exist**: `src/lib/tier.ts` (`TIER_ORDER`,
  `tierAtLeast`, `tierLabel`), `src/hooks/useMinTier.ts`, `src/components/TierGate.tsx`
  (render-only; real enforcement is always the backend guard). `/premium`
  (`v1/[lang]/premium/page.tsx`) demos `<TierGate min="BASIC">` inline. `/pricing`
  (`(marketing)/pricing/page.tsx`) is a static 4-card stub — hardcoded English, no
  i18n, no click handlers, `current`/`cta` logic only.
- **No `page.tsx` + separate `{Tier}PageView.tsx` split exists anywhere yet** — every
  page today is one file. This phase introduces that convention from scratch.
- **WS gateway does not gate by tier at all today.** `realtime.gateway.ts:348` reads
  `hash.tier` only to re-derive the rbacToken for handshake integrity, not to
  authorize any action. `messaging-ws.gateway.ts`'s `handleJoinRoom`/
  `handleClaimJoinRoom` accept any client-supplied `room` string with no ownership or
  tier concept — one active room per socket, no per-user room cap.
- **No payment/billing code exists** — no Stripe/iyzico, no `Payment`/`Invoice`/`Plan`
  Prisma model. But the schema already has two unused hooks seeded for exactly this:
  `Wallet`/`WalletTransaction` (balance ledger, `WalletTxnType` incl. `FEE`/
  `ADJUSTMENT`/`REFUND`, `idempotencyKey`, `metadata Json`) and
  `NotificationType.BILLING` — both present in `schema.prisma` since the initial
  commit, **zero application code references either today** (grepped, only
  `@generated/*` hits). This phase is the first thing to actually use them.
- **Berkay's direction for this phase** (from the pre-planning Q&A): (1) mock payment
  only — a real provider (Stripe/iyzico, undecided) comes later; (2) `BASIC` gets its
  own `BasicPageView.tsx`, not folded into `FreePageView` — four view files per page,
  matching the enum 1:1; (3) roll the `page.tsx` + `{Tier}PageView.tsx` split out
  across all main app pages now, not just `/pricing` + `/premium`.

## Decisions

- **D1 — Reuse `Wallet`/`WalletTransaction`/`NotificationType.BILLING` instead of new
  `Payment`/`Invoice`/`Plan` tables.** They've sat unused in the schema since the first
  commit and model exactly this (a ledger + a billing notification type) — no Prisma
  migration needed this phase. A subscription charge/downgrade is one
  `WalletTransaction` row (`type: FEE` for a charge, `ADJUSTMENT` for a free
  downgrade, `status: COMPLETED|FAILED`, `metadata: {tier, provider:"mock", last4}`,
  `reference: "subscription:<TIER>"`); every user gets a lazily-created primary USD
  `Wallet` on first checkout attempt.
- **D2 — `PaymentProvider` interface + `MockPaymentProvider` now; real provider is a
  second class later, not a rewrite.** New `nest-js-boilerplate/src/billing/` module:
  `payment-provider.interface.ts` (`charge(input): Promise<{ approved: boolean;
  reason?: string; providerRef: string }>`), `mock-payment.provider.ts` as the only
  implementation, injected behind the interface token so swapping to
  `StripePaymentProvider`/`IyzicoPaymentProvider` later touches one binding, not the
  resolver or schema.
- **D3 — Mock test-card table mirrors real Stripe test cards.** Last four digits
  `4242` → approved; `0002` → declined (`generic_decline`); `9995` → declined
  (`insufficient_funds`); any other number that passes a Luhn check → approved
  (so the demo isn't limited to 3 magic numbers). If Stripe is the eventual real
  provider, none of the "try this test card" UX/docs need to change.
- **D4 — Full card number never crosses the wire to the backend, even in mock mode.**
  The frontend validates Luhn + expiry client-side and sends only `{ last4,
  expMonth, expYear, tier }` — the `MockPaymentProvider` decides approve/decline from
  `last4` alone. Mirrors how real tokenized-card flows (Stripe Elements etc.) work,
  so the habit is already correct before a real provider is wired in.
- **D5 — Only upgrades call the payment provider.** Moving to a lower tier (or to
  FREE) never touches `MockPaymentProvider` — no card required, tier flips
  immediately via the same `TokenStoreService.rewriteFieldsForUser` path
  `setUserTier` already uses, logged as a zero-amount `ADJUSTMENT` transaction.
- **D6 — Tier-view split is strictly additive, never a regression.** `FreePageView`
  for every page is today's existing, already-shipped behavior, unchanged. Each
  higher tier adds one bounded extra panel/action; nothing is removed from a lower
  tier that already has it. **When a tier has no new content for a given page, its
  view file re-exports the next-lower tier's** (e.g. `export { default } from
  "./FreePageView"`) rather than duplicating JSX — keeps the four-file shape uniform
  everywhere without inventing filler content.
- **D7 — Exactly one new WS-level tier gate this phase**, not a redesign of the
  realtime protocol: room names prefixed `vip-` require `MEDIUM+` in
  `handleJoinRoom`/`handleClaimJoinRoom` (`messaging-ws.gateway.ts`) — reject with the
  same `{type:"error", message}` frame shape already used for `isValidRoom` failures.
  Proves server-side WS enforcement end-to-end (same story `/premium` already proves
  over HTTP); more gates can follow the identical pattern later.
- **D8 — Pricing and checkout are comparison/transactional pages, not part of the
  `{Tier}PageView` pattern.** They must show all four tiers to every viewer regardless
  of the viewer's own tier — that's a different shape than a content page whose own
  rendering depends on the viewer's current tier. `/pricing` keeps one file (rebuilt
  for real: i18n, tier-aware CTA state); checkout is a new one-file-per-visit page at
  `v1/[lang]/checkout/[tier]`.
- **D9 — `(marketing)/pricing` stays outside the `[lang]` locale group** (pre-existing
  structural fact, not fixed here — it has no `[lang]` segment and never has). It gets
  real copy via the root layout's default-locale message loader; full per-locale
  marketing routing is out of scope for this phase.
- **D10 — Stage A closes Phase 16's tracker before any new-scope work starts**, same
  "close the predecessor's gaps first" convention Phase 14/15/16 each used — a
  static+live re-check of the 10 punch-list items, then flip `phase16.md`'s
  checkboxes based on what's actually true, not what the commit message claims.

## Tasks

Sizes: S ≈ ≤2h, M ≈ ≤half day, L ≈ ≥1 day. Stage A gates Stage B+ (D10). Stage B gates
C/D (needs the provider + mutation). Stage E depends on B (self-serve tier change,
so the pricing/premium views have something real to hit) and D (checkout page must
exist before pricing's CTA can link to it). Stage F can land alongside each of C/D/E
as their own namespaces are added, or as one sweep after. Stage G is last.

### Stage A — Phase 16 close-out (blocking prerequisite)

- [ ] **T1 (S) — Re-verify Phase 16's 10 punch-list items against `957a4e9`/
  `9d3448c`.** For each of T22/T15/T1-T7/T3/T31/T27/T26/T11/T17/T18/T20/T21: read the
  actual current file state (not just the commit message) and confirm the fix matches
  what `phase16.md`'s "Fix:" note asked for. Run `pnpm test`, `pnpm test:e2e`,
  `pnpm lint`, `tsc --noEmit` in both packages.
  *Verify:* every item confirmed fixed in the live tree, or a fresh finding is
  recorded if one isn't.
- [ ] **T2 (S) — Flip `phase16.md`'s checkboxes and Status line to match T1's
  findings.** Update the header Status string, check every task box that's
  confirmed, and append a short "Closed 2026-07-XX" note referencing `957a4e9`/
  `9d3448c` rather than leaving the stale "NOT gate-clean" framing in place.
  *Verify:* `phase16.md` accurately reflects reality; no box is checked that T1
  didn't confirm.

### Stage B — Backend billing foundation

- [ ] **T3 (M) — `nest-js-boilerplate/src/billing/` module: `PaymentProvider`
  interface + `MockPaymentProvider`.** `charge({ userId, tier, last4, expMonth,
  expYear }): Promise<{ approved: boolean; reason?: string; providerRef: string }>`.
  Decision table per D3 (`4242`→approved, `0002`→`generic_decline`,
  `9995`→`insufficient_funds`, else Luhn-valid→approved, Luhn-invalid→approved:false
  reason `invalid_card`). Bound behind an injection token (`PAYMENT_PROVIDER`) so a
  real provider is a second class later, not a rewrite.
  *Verify:* unit tests for all 4 table rows + the Luhn-fallback branch.
- [ ] **T4 (M) — `BillingService.subscribeToPlan(userId, targetTier, card?)`.**
  Upgrade path (`targetTier` rank > current): requires `card`, calls
  `provider.charge()`; on approval, updates `User.subscriptionTier`, calls the
  existing `TokenStoreService.rewriteFieldsForUser`, writes a `WalletTransaction`
  (`type: FEE`, `status: COMPLETED`, `metadata: {tier, provider:"mock", last4}`,
  `idempotencyKey` derived from userId+tier+minute-bucket to make retries safe), and
  a `Notification` (`type: BILLING`). On decline: `WalletTransaction`
  `status: FAILED`, no tier change, no notification, return the decline reason.
  Downgrade/FREE path (D5): no `card`/provider call, straight to the tier-rewrite +
  a zero-amount `ADJUSTMENT` transaction + notification. Lazily creates the user's
  primary USD `Wallet` if none exists yet.
  *Verify:* unit tests — upgrade+approved card flips tier and writes `COMPLETED`;
  upgrade+declined card leaves tier untouched and writes `FAILED`; downgrade never
  calls the provider mock (spy assertion) and still flips tier.
- [ ] **T5 (S) — `BillingResolver`: `subscribeToPlan` mutation + `myBillingHistory`
  query.** `@UseGuards(SessionAuthGuard, CsrfGuard)`, self-serve (any authenticated
  user acting on their own account, no `@Roles` needed). `myBillingHistory` returns
  the caller's own `WalletTransaction` rows only (own-wallet filter, no cross-user
  leakage).
  *Verify:* e2e — authenticated user calls `subscribeToPlan(PREMIUM, {last4:"4242",
  ...})` → tier flips, next request's silent-refresh picks it up (same mechanism
  `setUserTier` already proves); forged `userId`/another user's wallet never appears
  in `myBillingHistory`.
- [ ] **T6 (S) — Add `CsrfGuard` to `AdminResolver.setUserTier`.** Same
  state-mutating-without-CSRF gap `logoutOtherSessions` already fixed elsewhere,
  found while building the new self-serve mutation right next to it — fix alongside
  rather than leave untracked (same reasoning Phase 16's D8 used for the
  `RESEND_*`/`SMTP_*` env fix).
  *Verify:* an admin request missing the CSRF header/token now gets rejected;
  existing e2e coverage for `setUserTier` still passes with the header included.
- [ ] **T7 (S) — `myPostStats`/`reactionBreakdown`/`whoReacted` resolver fields
  (feed + post-detail bonuses).** `myPostStats` (own posts' view/reaction counts,
  `@MinTier(MEDIUM)`) on the feed resolver; `reactionBreakdown(postId)`
  (`@MinTier(MEDIUM)`) and `whoReacted(postId)` (`@MinTier(PREMIUM)`) on the post
  resolver — grouped `Reaction` counts/rows, own+others' posts readable the same as
  today's existing post queries.
  *Verify:* FREE/BASIC caller gets a 403 on all three; MEDIUM gets the first two but
  403s on `whoReacted`; PREMIUM gets all three; unit + e2e per field.
- [ ] **T8 (S) — `suggestedFriends`/`growthStats` resolver fields (find-friends +
  premium bonuses).** `suggestedFriends` (`@MinTier(MEDIUM)`, simple
  friends-of-friends-not-already-connected query bounded to e.g. 10 rows) on the
  friendship resolver; `growthStats` (`@MinTier(MEDIUM)`, alongside the existing
  `premiumStats`) on `AdminResolver`.
  *Verify:* same 403-below/200-at-or-above pattern as T7, unit + e2e.

### Stage C — WS tier gate: VIP chat rooms

- [ ] **T9 (S) — Reject `vip-`-prefixed room joins below `MEDIUM`.** In
  `handleJoinRoom`/`handleClaimJoinRoom` (`messaging-ws.gateway.ts`), after the
  existing `isValidRoom` check: if `data.room`/`params.room` starts with `vip-` and
  the connection's tier rank < `MEDIUM`, send the same
  `{type:"error", message:"..."}` frame shape used for invalid rooms and do not
  join. Confirm the socket already has the authenticated tier available from the
  handshake (`realtime.gateway.ts:348`'s `hash.tier`) — thread it onto `AuthWs` if
  it isn't already there.
  *Verify:* a scripted WS client forging a `join-room` for `vip-lounge` on a FREE
  session gets the error frame and never appears in `getRoomCounts()`/broadcasts; a
  MEDIUM+ session joins normally. Live-probed, not just unit-tested (per this
  project's convention that WS behavior needs a real socket, not just a mock).
- [ ] **T10 (S) — Unit test for the gate.** Cover FREE/BASIC (rejected),
  MEDIUM/PREMIUM (allowed), and non-`vip-` rooms (unaffected, all tiers) in
  `messaging-ws.gateway.spec.ts`.
  *Verify:* all four cases green.

### Stage D — Frontend: mock checkout + pricing rebuild + shared dispatcher

- [ ] **T11 (S) — `src/lib/tier-view.ts`: shared per-page dispatcher helper.** One
  small function/component (`getTierView(tier, views)` or `<TierView tier={...}
  views={{FREE, BASIC, MEDIUM, PREMIUM}} />`) so all 9 pages in Stage E share one
  lookup instead of nine copy-pasted switches; falls back to `FREE` for a
  null/unknown tier (logged-out/loading states stay each page's own existing
  `loading`/`!user` early-return, unchanged).
  *Verify:* unit test — each of the 4 tiers resolves to its own view; unknown/undefined
  falls back to `FREE`.
- [ ] **T12 (M) — `MockCardForm` component** (`src/components/billing/
  MockCardForm.tsx`): card number, expiry (MM/YY), CVC, cardholder name inputs;
  client-side Luhn check + expiry-not-in-past validation before any network call;
  on submit, sends only `{ last4, expMonth, expYear }` (D4) via a new BFF route.
  Displays the 3 documented test numbers (D3) as on-page hints, same spirit as
  Stripe's own test-mode checkout UIs.
  *Verify:* component test — invalid Luhn/expired date blocked client-side with no
  fetch call; valid input calls the route with only the masked fields, never the
  full PAN.
- [ ] **T13 (S) — BFF routes: `api/billing/subscribe/route.ts` (POST),
  `api/billing/history/route.ts` (GET).** Same `graphqlFetch` +
  `sessionTokenHeaders()` + CSRF-echo pattern as `api/admin/set-tier/route.ts`/
  `api/auth/logout/route.ts`; real HTTP status passthrough (`{status:
  body.statusCode}` on error — the exact gap phase13 found missing on 5 other BFF
  routes, don't repeat it here).
  *Verify:* declined-card response reaches the browser as a real non-200 with the
  structured `{statusCode,exc,msg,key}` body `exceptionHandler` already knows how to
  render.
- [ ] **T14 (M) — `v1/[lang]/checkout/[tier]/page.tsx`.** Authenticated-only
  (existing `LoadingAuth`/`UnauthenticatedMessage` pattern); shows the target plan's
  price/features, `MockCardForm` for upgrades, a one-click confirm (no card) for
  downgrades/FREE (D5); success → toast + redirect to `/pricing`; decline → inline
  error via `exceptionHandler`, form stays filled for retry.
  *Verify:* live click-through — upgrade with `4242...` succeeds and the shell's
  tier badge updates on next action (no re-login); `0002...` shows a decline with a
  clear reason and no tier change.
- [ ] **T15 (M) — Rebuild `(marketing)/pricing/page.tsx` for real.** Real i18n copy
  (new `pricing` namespace, D9), CTA per viewer state: logged-out → links to login;
  logged-in + already at/above the tier → "Included" (disabled); logged-in + below →
  "Upgrade" linking to `checkout/[tier]`.
  *Verify:* all 4 CTA states exercised live (logged-out, current-tier, above,
  below); page renders in both `en`/`tr`.
- [ ] **T16 (S) — `PRICING_PATH`/new `CHECKOUT_PATH` route constants + nav
  entries.** `PRICING_PATH` already exists (`constants/routes.ts`) — add
  `CHECKOUT_PATH` builder (`(tier: Tier) => \`/v1/${lang}/checkout/${tier}\`` shape,
  matching existing localized-path helpers) and wire the pricing page's CTAs through
  it instead of a hand-built string.
  *Verify:* `git grep` shows no hardcoded `/checkout/` string outside this helper.

### Stage E — Per-page `{Tier}PageView.tsx` rollout

Each item: split `page.tsx` into a thin dispatcher (auth/loading guards unchanged,
tier read from `useAuth().user.tier`, rendered via T11's helper) + up to 4 sibling
view files. Per D6, a tier with nothing new re-exports the next-lower tier's file —
noted explicitly below where that applies.

- [ ] **T17 (M) — `/premium` (flagship — do this one first as the reference
  implementation).** `FreePageView`/`BasicPageView`: today's locked-`AccessDenied`
  state below `BASIC` (`BasicPageView` is the first tier with real content — the
  existing `premiumStats` panel). `MediumPageView`: `BasicPageView`'s content + a
  new "growth trend" panel from T8's `growthStats`. `PremiumPageView`:
  `MediumPageView`'s content + a mock "export CSV" button (client-side only, no
  new endpoint).
  *Verify:* live click-through as FREE (locked), BASIC (stats only), MEDIUM
  (stats+trend), PREMIUM (stats+trend+export) — matches this exact tier ladder.
- [ ] **T18 (M) — `/feed`.** `FreePageView`: today's feed, unchanged.
  `BasicPageView`: re-exports `FreePageView` (D6 — no delta yet).
  `MediumPageView`: adds T7's `myPostStats` sidebar (own posts' view/reaction
  counts). `PremiumPageView`: `MediumPageView`'s content + a cosmetic "Premium"
  badge next to the user's own posts.
  *Verify:* FREE/BASIC see identical markup (same component); MEDIUM sees the new
  sidebar and a FREE-tier forced API call to `myPostStats` gets a real 403.
- [ ] **T19 (M) — `/posts/[uuid]` (post detail).** `FreePageView`/`BasicPageView`:
  today's page (reaction **count** only, unchanged). `MediumPageView`: adds T7's
  `reactionBreakdown` chart. `PremiumPageView`: adds T7's `whoReacted` list on top
  of Medium's chart.
  *Verify:* same 3-rung ladder confirmed live + backend 403 below each rung.
- [ ] **T20 (S) — `/messages`.** No tier differentiation planned (1:1 DMs are core,
  not a monetization axis) — all four views re-export the same existing content
  (D6). Establishes the dispatcher plumbing uniformly even where content doesn't
  differ yet.
  *Verify:* page still renders/behaves identically to today for all 4 tiers; no
  regression in the existing messages e2e coverage.
- [ ] **T21 (M) — `/chat-room`.** `FreePageView`/`BasicPageView`: today's page,
  unchanged, no "VIP Lounge" entry point shown. `MediumPageView`: adds a "Join VIP
  Lounge" button that joins the `vip-lounge` room (T9's gate). `PremiumPageView`:
  `MediumPageView`'s content + a small crown badge next to the user's own name in
  any room.
  *Verify:* live click-through — FREE/BASIC never see the VIP button (and a forced
  WS join attempt is rejected per T9); MEDIUM/PREMIUM join successfully.
- [ ] **T22 (S) — `/notification`.** No tier differentiation planned — same
  re-export-everywhere shape as T20.
  *Verify:* unchanged behavior for all 4 tiers.
- [ ] **T23 (M) — `/find-friends`.** `FreePageView`/`BasicPageView`: today's page,
  unchanged. `MediumPageView`/`PremiumPageView`: adds T8's `suggestedFriends` panel
  (Premium re-exports Medium — D6, no further delta identified for this page).
  *Verify:* FREE/BASIC unchanged; MEDIUM/PREMIUM show suggestions; below-MEDIUM
  forced API call 403s.
- [ ] **T24 (S) — `/users/list` + `/users/detail`.** No tier differentiation
  planned (browsing users is core) — re-export shape, same as T20/T22.
  *Verify:* unchanged behavior for all 4 tiers.
- [ ] **T25 (S) — `/settings` (+ `/settings/sessions`).** No tier differentiation
  planned (account settings are the same for everyone) — re-export shape.
  *Verify:* unchanged behavior for all 4 tiers.

### Stage F — i18n

- [ ] **T26 (M) — New locale namespaces for every page touched above.** At minimum:
  `pricing`, `checkout`, `premium` (retrofit — today's page has zero i18n),
  `feed`/`posts`/`chat-room`/`find-friends` additions for the new panels' copy (only
  the *new* strings need namespaces if the page already has one; `pricing`/
  `checkout`/`premium` need namespaces created from scratch, using
  `messages/{en,tr}/messages/messages.json` as the structural template per
  `useMessages()`'s existing convention). Run `pnpm generate-i18n-types` after.
  *Verify:* `en` and `tr` both render with no fallback/missing-key warnings; the
  generated `I18nMessages` type includes every new namespace.

### Stage G — Tests + verify loop

- [ ] **T27 (M) — Backend + frontend unit/e2e suites green.** `pnpm test`/
  `test:e2e` (backend), frontend unit tests for `MockCardForm`/`tier-view` helper/
  every new resolver field; no regression in Stage A's re-confirmed Phase 16
  surface.
- [ ] **T28 (L) — Live control run against rebuilt containers** (same recipe as
  Phase 3/16: `docker compose --profile all up -d --build`, real HTTP/GraphQL/WS
  traffic, not just mocks). Script: register/login a fresh FREE user → attempt
  `vip-` room join (rejected) → attempt `whoReacted` (403) → checkout PREMIUM with
  `4242...` (approved, tier flips, WS join now allowed, `whoReacted` now 200) →
  checkout with `0002...` on a second user (declined, tier unchanged) → downgrade
  back to FREE (no card, immediate). Confirm zero full-PAN bytes ever appear in
  backend logs/Postgres (`WalletTransaction.metadata` contains only `last4`).

## Verify loop (phase gate)

- [ ] **Phase 16 actually closed:** Stage A's re-verification is real (not just
  trusting the commit message), `phase16.md` reflects it.
- [ ] **Mock payment is provider-swappable in practice, not just in theory:** the
  resolver/schema/frontend never reference `MockPaymentProvider` directly outside
  its own binding — grep confirms the only import site is the DI wiring.
- [ ] **No full card number ever reaches the backend or a log line** — confirmed via
  the same `log_statement='all'`-style Postgres spot check this project has used
  since Phase 3, plus a source grep for anywhere a full PAN variable could leak.
- [ ] **Every `@MinTier`-gated field enforces server-side**, proven by a forced
  below-tier call getting a real 403 — not just the frontend `TierGate` hiding UI.
- [ ] **The one new WS gate (`vip-` rooms) rejects live**, proven with a real socket
  client forging the join, not a mock.
- [ ] **Zero regressions**: FREE-tier behavior on every touched page is byte-for-byte
  the same as before this phase (D6) — this is the thing most likely to quietly
  break given 9 pages are being touched at once.
- [ ] **`pnpm generate-i18n-types` run and committed**, both locales render with no
  missing-key fallback.
- [ ] **Live control run (T28) passes** before this phase is marked complete —
  static/unit-only verification is not sufficient per this project's established
  lesson (phases 2/12/15/16 all shipped real bugs that only a live rebuilt-container
  pass caught).

## Phase queue (updated 2026-07-05)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1–4 (done) | See [phase4.md](phase4.md) queue table | — |
| 5 (skipped-renumbered) | — reserved — | — |
| 6 (done, re-scoped) | Realtime consolidation: socket, renew protocol, emit points | [phase6.md](phase6.md) |
| 7 (done) | Page-claim realtime: presence in Redis, page-scoped push, transport fixes, hardening | [phase7.md](phase7.md) |
| 8 (done) | Realtime close-out: bounded conversations SQL, notification index, find-friends cache | [phase8.md](phase8.md) |
| 9 (done, 14/15 code tasks) | Realtime UX close-out: transport deadlock, claim keying, thread order, receipts, header routing, chat-room switching, push completion | [phase9.md](phase9.md) |
| 10 (mostly landed) | Realtime UX round 2: DM unread everywhere, live feed renew, chat-room presence + stability, transport-state UX — T11 broken, T4/T15 carried to 11 | [phase10.md](phase10.md) |
| 11 (parked — plan only, tasks open) | Phase 10 remediation: post-detail live-renew fix (allowlist + context churn), close-out bookkeeping, verification gate, residual UX — deferred in favor of Phase 12, resume after | [phase11.md](phase11.md) |
| 12 (implemented, not gate-clean until Phase 14/T4) | Exception handling: unified backend error contract, frontend `exceptionHandler` + i18n resolver, dedicated connection-unstable + access-denied pages, loading skeletons, real auth forms | [phase12.md](phase12.md) |
| 13 (implemented, not gate-clean until Phase 15/T15) | Phase 12 remediation + notification/DM unread count renewal hardening + sender display-name consistency + chat scroll-to-bottom button | [phase13.md](phase13.md) |
| 14 (implemented, not gate-clean until Phase 15) | Phase 13 close-out + comprehensive Kibana activity logging: session/page/exception categories — 7 of 20 tasks confirmed broken live, remediated in Phase 15 | [phase14.md](phase14.md) |
| 15 (Stage G/T15 done, Stages A–F not started) | Phase 14 remediation: IP-change unification, WS close codes, frontend event pipe, Kibana saved searches, docs accuracy, Phase 12/13 live control run, test debt — Stages A–F carried whole into Phase 16's Stage A | [phase15.md](phase15.md) |
| 16 (implemented 2026-07-05, pending Stage A re-verify above) | Phase 15 close-out + welcome-email & password-reset for social signups: username generation, SMTP (mxroute) transport, real mail templates, generic password-reset flow, frontend set-password/verify-email pages, env/compose/docs cleanup | [phase16.md](phase16.md) |
| **17 (this file)** | Subscriptions & pricing: mock payment provider (Wallet/WalletTransaction ledger), self-serve tier checkout, `{Tier}PageView` split across 9 main pages, one WS-level tier gate (VIP rooms), real i18n'd pricing page | this file |
| 18 (was 17) | Cross-stack e2e: `STACK=1` Playwright — incl. phase 6+7+9+10 realtime loops, plus this phase's checkout/tier-gate flows | [todo/01](../todo/01-stack-integration.md) |
| 19 (was 18) | Root CI: path-filtered app checks + compose smoke + stack e2e | [todo/01](../todo/01-stack-integration.md) |
| 20 (was 19) | Backend warts + compose hardening + k8s | [todo/02](../todo/02-backend.md), [todo/04](../todo/04-devops.md) |
| 21 (was 20) | Backlog: OTel/metrics, remaining push polish, seed, publishing, backups; **real payment provider swap (Stripe/iyzico, undecided) once Berkay picks one** — added here per this phase's own D2 | [todo/02](../todo/02-backend.md)–[05](../todo/05-docs-maintenance.md) |

<!-- Downstream phases 17-20 (from phase16.md's own queue table) were renumbered +1
(now 18-21) to insert this subscriptions/pricing phase, same pattern Phase 14/15/16
each used. The real-payment-provider follow-up was added as an explicit backlog line
in phase 21 rather than left implicit, since Berkay named it as a known next step. -->
