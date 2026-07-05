# Enhancements 1 — Full-stack senior code review

> Not a phase tracker — a point-in-time code review across both apps, written 2026-07-06.
> Scope: the **real product** (auth, billing/subscriptions, social feed, messaging,
> notifications, realtime) in both `nest-js-boilerplate` and `next-js-boilerplate`.
> Explicitly out of scope: the ~65 NestJS documentation-feature demo modules that also
> live in the backend (`caching/`, `cqrs/`, `grpc/`, `mongoose/`, `sequelize/`, `typeorm/`,
> `microservices/`, etc.) — these exist to fulfill this repo's separate "implement every
> NestJS doc feature" goal and aren't part of the app a user actually interacts with.
> A few of them (`throttle/`, `health/`, `outbox/`, `csrf/`) are dual-purpose — genuinely
> wired into the real app — and are reviewed here on that basis.
>
> Findings are grouped by area; each carries a severity tag. Two findings (0a/0b) are
> called out ahead of the rest because they're cross-cutting and higher-impact than
> anything found within any single module.
>
> **Update (2026-07-06):** added a "Frontend design system & custom UI components"
> section after researching current (2026) frontend-design and component-library
> engineering guidance — since this project *is* a stack boilerplate, its
> `components/ui/` primitives are the product, held to a higher bar than a one-off app
> screen. See findings #30-32.
>
> **Verification pass (2026-07-06, commit `0b6ade5`):** Berkay implemented most findings
> in one large commit. Re-verified every claim against the live code (not the commit
> message) and by running `pnpm test`. Most fixes are genuinely correct — see the ✅/⚠️/❌
> markers added throughout below — but the pass surfaced **two real regressions** the
> commit introduced, plus a broken test suite (15 of 220 backend tests now fail, mostly
> stale mocks rather than bad code — detail in "Verification results" below).
>
> **Regressions fixed (2026-07-06, same day):** both real regressions (VIP rooms fully
> broken, session-revoke fully broken), the `isGraphQLMutation` null-safety bug, and all
> 15 failing tests are now closed — `pnpm test` is 220/220 again in
> `nest-js-boilerplate` and 77/77 in `next-js-boilerplate`. See "Regressions fixed"
> below for exactly what changed and why. This phase's backend/security findings are now
> gate-clean; the remaining open items are the ones already marked ❌/⚠️ for reasons
> unrelated to these regressions (Select's mobile-viewport gap, the partial aria-label
> sweep, D5-blocked Privacy scope, and the low-priority items never claimed as fixed).

## At a glance

Status column added 2026-07-06 after verifying commit `0b6ade5` line-by-line (not just
reading its commit message) and running the backend test suite. ✅ = verified genuinely
fixed. ⚠️ = fixed but incompletely, or the fix itself introduced a new problem. ❌ = not
addressed. 🆕 = a new regression the fix commit introduced, not present before it.

| # | Severity | Area | Finding | Status |
| - | --- | --- | --- | --- |
| 0a | 🔴 Critical | Infra (cross-cutting) | Almost every mutation is CSRF-exposed — wide-open CORS+credentials, CSRF guard applied to only 3 of ~15 mutation resolvers | ✅ Fixed (the null-safety bug + BFF regression it shipped with are now also fixed — see "Regressions fixed") |
| 0b | 🔴 Critical | Infra (cross-cutting) | Global rate limiter silently skips all GraphQL traffic — login/register/password-reset are fully unthrottled | ✅ Fixed |
| 28 | 🔴 Critical | Frontend billing | Checkout form's expiry check always fails (2-digit-year `Date` bug) — mock checkout is unusable client-side | ✅ Fixed (also fixed a second latent month-indexing bug in the same line) |
| 1 | 🟠 High | Backend auth | `setUserTier` uses a revocation-blind guard (`JwtAuthGuard`), unlike its sibling tier-gated queries | ✅ Fixed |
| 2 | 🟠 High | Backend auth | Password reset never revokes existing sessions (`revokeAllForUser` exists, is never called) | ✅ Fixed |
| 9 | 🟠 High | Backend billing | Mock payment's "Luhn fallback" Luhn-checks a fabricated string — meaningless, unpredictable accept/decline | ✅ Fixed |
| 10 | 🟠 High | Backend billing | Idempotency key is checked too late — a race can double-charge before the DB constraint ever fires | ✅ Fixed |
| 14 | 🟠 High | Backend social | `Reaction`'s DB unique constraint doesn't match the app's own toggle invariant — a race can create duplicate reactions | ✅ Fixed |
| 30 | 🟠 High | Frontend design system | `Select`'s keyboard arrow-navigation can never fire — nothing moves focus into the listbox on open | ⚠️ Fixed for desktop only — mobile/narrow-viewport variant still unreachable |
| 31 | 🟠 High | Frontend design system | Toast notifications have no `aria-live`/`role="status"` — invisible to screen readers | ✅ Fixed |
| 3 | 🟡 Medium | Backend auth | Login has a timing side-channel that undermines its own anti-enumeration design | ✅ Fixed |
| 4 | 🟡 Medium | Backend/Frontend | Session management is half-built — backend primitives exist, unwired; `/settings/sessions` is a static stub | ⚠️ Fixed, but its own new BFF routes are broken by 0a — see below |
| 5 | 🟡 Medium | Backend auth | Password reset doesn't clear account lockout despite proving identity | ✅ Fixed |
| 11 | 🟡 Medium | Backend billing | Tier-flip + ledger write aren't atomic — a partial failure silently breaks billing history | ✅ Fixed |
| 15 | 🟡 Medium | Backend social | Reaction input allows both `postId` and `commentId` set simultaneously — no mutual-exclusivity validation | ✅ Fixed |
| 17 | 🟡 Medium | Backend social | One-reply-per-comment-thread rule is unusual — confirm intentional | ❌ Not addressed |
| 22 | 🟡 Medium | Backend realtime | `handleJoinRoom` is missing the room-allowlist check its sibling handlers both have | ✅ Fixed (the VIP-room regression it shipped with, and the identical pre-existing bug in `handleClaimJoinRoom`, are now also fixed — see "Regressions fixed") |
| 26 | 🟡 Medium | Frontend UX | Icon-only buttons are missing `aria-label` fairly systemically | ⚠️ Partial — the 5 buttons named in the original finding are fixed; the broader systemic gap (e.g. `find-friends`, `feed`) is not |
| 6,7,8,12,13,16,18,19,20,21,23,24,25,27,29,32 | 🟢 Low | Various | See detail below | 6,7,8,12,16 ✅ fixed; 13,18,19,20,21,23,24,25,27,29,32 ❌ not addressed (all reasonable to defer) |

## Backend infra (cross-cutting)

These two are listed first because they undermine security invariants that individual
modules otherwise rely on — fixing them raises the effective security level of everything
below more than any single module fix would.

### 0a. 🔴 Almost every state-changing GraphQL mutation is CSRF-exposed

`main.ts:31`: `app.enableCors({ origin: true, credentials: true })` — reflects *any*
requesting `Origin` back as allowed, with credentials (cookies) enabled. Combined with
`SessionAuthGuard`'s cookie-fallback authentication (extracts access/rbac/device/user
tokens from cookies when no `Authorization: Bearer` header is present —
`session-auth.guard.ts:172-211`), any resolver guarded only by
`@UseGuards(SessionAuthGuard)` (no `CsrfGuard`) can be invoked from an arbitrary
third-party page: the browser auto-attaches httpOnly cookies to cross-origin credentialed
requests regardless of CORS (CORS governs whether JS can *read* the response, not whether
the browser *sends* the request).

Confirmed via a guard-decorator sweep across every resolver:

- `post.resolver.ts:67-68` (`createPost`/`updatePost`/`deletePost`) — `SessionAuthGuard`
  only, **no CsrfGuard**. A forged cross-site request can delete or edit any user's post.
- `comment/comment.resolver.ts:11-12` (`createComment`/`updateComment`/`deleteComment`) —
  same gap.
- `reactions/reactions.resolver.ts:11-12` (`createReaction`) — same gap.
- `notification/notification.resolver.ts:9-10` (`markRead`/`markAllRead`) — same gap.
- `messaging/messaging.resolver.ts:13-14` (`sendMessage` + one more mutation) — same gap
  (a forged request could send messages as the victim).

Only 3 places actually add `CsrfGuard`: `auth.resolver.ts`'s `logout` (line 43),
`admin.resolver.ts`'s `setUserTier` (line 85), and `billing.resolver.ts`'s whole class
(line 53). `CsrfGuard`'s own doc-comment (`csrf/csrf.guard.ts:11-15`) states it's "applied
only to the cookie-driven mutations (refresh/logout) — the exact CSRF-sensitive surface" —
that premise is the bug: *every* mutation reachable through `SessionAuthGuard`'s cookie
fallback is equally CSRF-sensitive, not just logout/tier/billing.

**Fix:** either add `CsrfGuard` to every `SessionAuthGuard`-only mutation resolver
(tedious, easy to keep missing new ones), or — better — fold the CSRF check into
`SessionAuthGuard` itself for mutations (skip for queries), so the protection is
structural rather than opt-in per resolver.

### 0b. 🔴 The global rate limiter never actually applies to GraphQL traffic

`HttpThrottlerGuard` (`throttle/http-throttler.guard.ts:9-14`) explicitly does
`if (context.getType() !== 'http') return true;` before delegating to `ThrottlerGuard` —
and NestJS classifies a GraphQL-resolver execution context's type as `'graphql'`, not
`'http'`, even though the request physically arrives over HTTP POST to `/graphql`. This
guard is bound globally via `APP_GUARD` (`app.module.ts:192`) and is the **only**
rate-limiting mechanism in the app (confirmed by grep: the sole other `@Throttle()` usage
anywhere is on `ThrottleController`, the unrelated NestJS-rate-limiting-docs demo
controller — no resolver has ever added its own `@Throttle()`).

Net effect: `login`, `register`, `requestPasswordReset`, `resetPassword`,
`loginWithOAuth`, `subscribeToPlan`, and literally every other mutation/query are
**completely unthrottled** by IP. The only brute-force mitigation that exists at all is
`login`'s own per-account lockout (5 failed attempts → 15min lock,
`auth.service.ts:450-471`) — which doesn't stop distributed/multi-account credential
stuffing, and doesn't cover `requestPasswordReset` (could be spammed to flood any
victim's inbox — always returns `true` so it's not an oracle, but has zero rate limit) or
`register` (could be spammed to flood the mail queue / create junk accounts).

**Fix:** add a GraphQL-aware throttler (key by IP from the underlying request, not by
transport type) and/or explicit `@Throttle()` limits on
`login`/`register`/`requestPasswordReset`/`resetPassword` specifically.

### Other infra notes

- **23. 🟢 Low — no fail-fast env validation.** The real `ConfigModule.forRoot({isGlobal:
  true})` (`app.module.ts:71`) passes no `validationSchema` — missing/malformed env vars
  only surface lazily, whenever some `config.getOrThrow(...)` happens to run. A Joi schema
  already exists (`config/env.validation.ts`) but is only wired into the NestJS-docs
  config demo, never the real app. Cheap fix: pass it into the real `ConfigModule.forRoot()`
  call (extended to cover the vars this app actually needs) so a bad deploy fails at boot.
- **24. 🟢 Note — two demo WS gateways use `cors: { origin: '*' }`**
  (`ws-enhancers/enhancers.gateway.ts:27`, `ws/chat.gateway.ts:21`). Not the real chat path
  (that's `RealtimeGateway`/`MessagingWsGateway`), so out of scope as "the app," but flagging
  in case they're ever exposed outside dev.

## Backend auth & authorization

### 1. 🟠 High — `setUserTier` uses a revocation-blind guard

`setUserTier` (`authorization/admin.resolver.ts:86-101`) — a highly privileged mutation
(lets an admin change *any* user's subscription tier) — is guarded only by
`@UseGuards(JwtAuthGuard, RolesGuard)` (class-level, line 64), not `SessionAuthGuard`.
`JwtAuthGuard` (`auth/jwt-auth.guard.ts`) only verifies the JWT signature/expiry — it
never consults `TokenStoreService`/Redis, so it has no concept of logout/revocation.
Contrast with `premiumStats`/`growthStats` in the *same* resolver, which correctly use
`SessionAuthGuard` + `TierGuard` (revocation-aware).

Concrete exposure: an admin's stolen/logged-out access token remains fully valid to call
`setUserTier` for up to `JWT_ACCESS_TTL` (default 900s/15min, `auth.module.ts:28-31`)
after logout — bypassing the Redis-revocation model the rest of the app relies on. Root
cause: `AdminResolver`'s own doc-comment says it "Demonstrates the RBAC pipeline" from the
NestJS Authorization docs tutorial (`roles.guard.ts:9-19` confirms: "RBAC guard from the
Authorization docs") — `setUserTier` was bolted onto this docs-demo resolver during phase
16/17 instead of a properly `SessionAuthGuard`-protected one.

**Fix:** move `setUserTier` (and any other real admin mutations) to
`@UseGuards(SessionAuthGuard, RolesGuard)` (or a new dedicated resolver), so admin
privilege checks share the same revocation-aware guard as tier-gated user queries.

### 2. 🟠 High — password reset doesn't revoke existing sessions

`resetPassword` (`auth/auth.service.ts:276-319`) never calls
`TokenStoreService.revokeAllForUser(userId)`. The method already exists and does exactly
this (`token-store.service.ts:174-185`) but is **never called anywhere in the codebase**
(grepped, zero call sites). Net effect: if an account is compromised and the legitimate
owner resets their password via email, the attacker's existing session tokens remain
valid — password reset doesn't actually evict anyone.

**Fix:** call `tokenStore.revokeAllForUser(userId)` inside/after the transaction in
`resetPassword`.

### 3. 🟡 Medium — login timing side-channel undermines its own anti-enumeration design

`login()` (`auth/auth.service.ts:131-182`) deliberately returns an identical "Invalid
credentials" message whether the email doesn't exist or the password is wrong — but
"email doesn't exist" returns immediately (line 135-141) while "wrong password" first
runs `argon2.verify()` (~50-200ms). This timing gap lets an attacker enumerate valid
emails via response-time measurement even though the message is identical.

**Fix:** run a dummy `verify()` against a fixed/precomputed hash when the user doesn't
exist, so both paths take comparable time.

### 4. 🟡 Medium — session management is half-built (backend + frontend)

`TokenStoreService.listSessionsForUser`/`.revokeAllForUser`
(`token-store.service.ts:166-185`) use the Redis reverse-index (`user:{userId}:sessions`)
correctly, but neither is exposed through any GraphQL query/mutation — no
"sessions"/"devices" resolver exists anywhere. The frontend's `/settings/sessions` page
(`next-js-boilerplate/.../settings/sessions/views/FreePageView.tsx`) is a 23-line static
stub: *"Sessions are managed automatically. You'll be logged out after 15 minutes of
inactivity."* — no list, no per-session revoke, no "log out everywhere," despite the
backend having exactly the primitives needed. `logout()` itself only revokes the one
compound key presented in the request — there is no way for a user to end a session on a
device they no longer have access to.

**Enhancement:** wire up `mySessions`/`revokeSession`/`revokeAllOtherSessions` resolvers
and build the real UI — a normal, expected account-security feature that's currently
entirely absent despite the groundwork existing since early phases.

### 5. 🟡 Medium — password reset doesn't clear account lockout

`resetPassword` doesn't reset `failedLoginCount`/`lockedUntil`. If an account is locked
(5 failed attempts, 15min lock, `auth.service.ts:450-471`) and the real owner proves
identity via emailed reset token — a strong proof — they're still locked out for the
remainder of the 15 minutes even after demonstrating ownership.

**Fix:** reset `failedLoginCount: 0, lockedUntil: null` alongside `passwordHash` in the
same transaction.

### 6. 🟢 Low — inconsistent error contract on two auth flows

`resetPassword`/`verifyEmail` throw a bare `UnauthorizedException('Invalid or expired
token')` instead of this codebase's structured `{exc, msg, key}` contract used everywhere
else (e.g. `EX_AUTH_EMAIL_TAKEN`). Breaks the frontend's `exceptionHandler`/i18n-key
resolution for these two flows specifically. **Fix:** give both a proper `exc`/`key` pair.

### 7. 🟢 Low — password-reset token TOCTOU race

The token lookup (`findUnique`) happens outside the `$transaction` in `resetPassword`, so
two concurrent requests presenting the same not-yet-consumed token could both pass
validity and both execute their own transaction (last write wins, two audit events fire).
Low real-world severity; a row-locked lookup inside the transaction would close it.

### 8. 🟢 Low — device-claim race on first login

`DeviceService.resolveForLogin`'s "landing token, no existing Device row" branch
(`device.service.ts:96-107`) does a `findUnique` then `create` with no lock; two
concurrent logins presenting the same fresh device cookie could both pass `!existing` and
both attempt `create` with the same token, throwing an unhandled unique-violation on the
second instead of gracefully falling back to reuse. Minor/rare.

## Backend billing & payments

### 9. 🟠 High — mock payment's "Luhn fallback" is meaningless

`MockPaymentProvider.charge()` (`billing/mock-payment.provider.ts:49`) does
`luhnCheck('4242' + input.last4)` — prepends a hardcoded `"4242"` to the submitted last4
and Luhn-checks the resulting fake 8-digit string. Luhn is only meaningful over a full
PAN; you can't validate "the last 4 digits" in isolation, so this produces an arbitrary
approve/decline for any last4 other than the 3 documented magic numbers — contradicting
D3's stated intent ("any Luhn-valid card approves, so the demo isn't limited to 3 magic
numbers"). A test user typing a card ending in e.g. `4241` gets a deterministic but
unexplainable accept/decline.

**Fix:** either drop the Luhn-fallback branch entirely, or replace it with a rule that
doesn't misuse Luhn (e.g. "any last4 not in the decline list approves").

### 10. 🟠 High — idempotency key is checked too late to prevent a double charge

`subscribeToPlan`'s idempotency key (`sub:${userId}:${tier}:${minuteBucket}`) is backed
by a real DB `@unique` constraint (`WalletTransaction.idempotencyKey`,
`schema.prisma:808`) — but the uniqueness is only discovered when
`walletTransaction.create()` runs, *after* `this.provider.charge()` already executed
(`billing.service.ts:59-65`, before the guarded insert at line 70/93). Two concurrent
identical upgrade requests both read the pre-upgrade tier, both pass the "already on this
tier" guard (neither has committed yet), and **both call the payment provider** — with a
real provider this means charging the card twice. Only the second `WalletTransaction`
insert then fails (unhandled `P2002` — raw 500 even though the card *was* charged).

**Fix:** check for an existing `WalletTransaction` with the computed key *before* calling
`provider.charge()`, short-circuiting with the prior result if found; also catch `P2002`
around the insert as a defense-in-depth fallback.

### 11. 🟡 Medium — tier flip and ledger write aren't atomic

`subscribeToPlan`'s upgrade path does the tier flip (Postgres + Redis), the
wallet-transaction insert, and the notification as three separate un-transacted awaits.
If the transaction insert throws after the tier flip already committed, the user's tier
is upgraded with **no ledger entry** — silently breaking `myBillingHistory`'s ability to
show the charge phase 17 specifically built this ledger to prove.

**Fix:** wrap the two DB writes (tier flip + wallet-transaction insert) in one
`$transaction`.

### 12. 🟢 Low — notification failure can fail an already-successful payment

`sendBillingNotification` is directly awaited inside `subscribeToPlan` with no try/catch
— if it throws, the whole mutation fails even though the payment/tier-flip already
succeeded. **Fix:** wrap in try/catch, log-on-failure.

### 13. 🟢 Low — mock provider ignores expiry (forward-looking note)

`MockPaymentProvider.charge()` receives `expMonth`/`expYear` but never uses them —
expiry validation only happens client-side. Not a bug today, but a guardrail note for
whoever swaps in a real provider later (D2's stated plan): make sure server-side expiry
re-validation isn't accidentally skipped just because the mock never modeled it.

## Backend social domain (post/comment/reactions/friends/notification)

### 14. 🟠 High — `Reaction`'s DB constraint doesn't match the app's toggle invariant

Schema (`schema.prisma:698`): `@@unique([userId, postId, commentId, type])` — `type` is
part of the key. But `ReactionsService.create()` (`reactions.service.ts:19-26`) looks up
"the existing reaction" by `{userId, postId, commentId}` **without** `type` — the app's
intended rule is "one active reaction per user per target, of any type" (toggle same type
off, switch to a different type). The DB constraint doesn't enforce that; it only blocks
an exact `(user, target, type)` duplicate. Under a race (two near-simultaneous reactions
on a fresh target with two different types, e.g. a fast double-tap landing on LIKE then
LOVE before the first commits), neither insert violates the constraint, so the user ends
up with **two live reaction rows on the same target** — breaking `whoReacted` (duplicate
entries), `reactionBreakdown` counts, and the UI's "your reaction" state.

**Fix:** change the constraint to `@@unique([userId, postId, commentId])` (drop `type`)
so the DB actually enforces "one reaction per user per target," matching the service's
own toggle logic.

### 15. 🟡 Medium — reaction input allows both `postId` and `commentId` set

`CreateReactionInput` validates `postId`/`commentId` as independently-optional UUIDs with
no validator enforcing "exactly one." A request supplying both passes validation, then
the existence lookup never matches a real prior reaction, so it always creates — a
`Reaction` row attached to both a post and a comment simultaneously, corrupting both
lists.

**Fix:** add a custom validator (e.g. a class-validator `@Validate` requiring exactly one
of the two fields).

### 16. 🟢 Low — same idempotency-surfacing gap, smaller blast radius

Because of #14, a legitimate race on an identical `(user, target, type)` reaction *would*
hit the DB constraint, but `ReactionsService.create()` has no try/catch around the
insert — a double-tap "like" on a slow connection surfaces as an unhandled `P2002` (raw
500) instead of a harmless no-op.

### 17. 🟡 Medium — one-reply-per-comment-thread rule is unusual

`CommentService.create()` blocks a user from replying to the same parent comment more
than once ("You have already replied to this comment"). Real comment systems routinely
let users reply multiple times to the same thread. **Confirm this is an intentional
anti-spam rule**, not an accidental over-restriction; if intentional, surface it in the UI
before submit rather than only as a post-submit conflict error.

### 18. 🟢 Low — replying to a deleted comment is allowed

`CommentService.create()` doesn't check whether the target `parentId` comment is itself
soft-deleted before allowing a reply — creates a reply orphaned under hidden content.

### 19. 🟢 Low — unbounded notification fan-out on post create

`PostService.create()` fans out one `NotificationService.create()` call per friend
(`Promise.all`) with no batching/cap. Fine at demo scale; a user with a very large friend
list would generate a proportional write burst per post. The app already has BullMQ wired
in — worth a queued fan-out if friend-list sizes are expected to grow.

### 20. 🔵 Enhancement — post images belong in object storage, not Postgres

`PostService.create()`/`update()` store `coverImage` as a raw `Buffer` directly in
Postgres, re-encoding to base64 on every fetch. The repo already provisions MinIO
(S3-compatible storage, `src/upload/minio.service.ts`) but posts don't use it — bloats the
primary DB and duplicates work the object-store integration already exists to avoid.
**Enhancement:** store post/comment images in MinIO, keep only the object key/URL in
Postgres (mirroring how `imageUrl` already works for externally-hosted images).

### 21. 🟢 Low — two sources of truth for unread count

`NotificationService.create()` maintains an optimistic Redis increment
(fire-and-forget, silently swallowed on failure) alongside a fresh Postgres count used for
the value actually emitted to the client. A silently-failed Redis increment lets the
cached `unread` field (used elsewhere, e.g. session hydration) drift from the real count.

## Backend realtime & messaging

### 22. 🟡 Medium — `handleJoinRoom` is missing the room-allowlist check its siblings have

`handleJoinRoom` (`messaging-ws.gateway.ts:175-214`) is missing the `isValidRoom()` check
that its two sibling handlers both have (`handleRoomMessage` line 236,
`handleClaimJoinRoom` line 274 both reject invalid rooms; `handleJoinRoom` goes straight
from the VIP-tier check to joining). `isValidRoom` checks membership in a fixed
`CHAT_ROOMS` list that the whole room-tracking system implicitly assumes. Net effect: a
client sending a raw `join-room` frame can join/create an arbitrary, unbounded room name —
polluting `getRoomCounts()` and growing in-memory room-tracking maps without bound. This
is the same class of gap Phase 17's own T9 built the VIP-tier check to close, but that
phase's verification only re-confirmed the tier-rank check, not `isValidRoom`'s
consistency.

**Fix:** add the same `isValidRoom` guard at the top of `handleJoinRoom`.

## Frontend auth/session & BFF routes

Lighter pass — this area was already fairly solid; most effort went to the backend per
the "senior backend developer" framing of the request.

### 25. 🟢 Low — global logout-on-401 could be too broad someday

`AuthProvider`'s `apiFetch` 401 handling dispatches a global `auth:logout` event on *any*
401 from anywhere in the app. Safe today since all fetches go through the same BFF, but
worth a guard if a fetch is ever added that can legitimately 401 without meaning "your
session is invalid" (e.g. a third-party embed).

## Frontend core pages (UI/UX + accessibility)

### 26. 🟡 Medium — icon-only buttons are missing `aria-label` fairly systemically

Sampled `aria-*` attribute counts vs `<button>` counts across 6 core pages'
`FreePageView.tsx`: `feed` (0 aria / 1 button), `find-friends` (0/6), `messages` (1/8),
`chat-room` (1/4), `notification` (3/5), `posts/[uuid]` (0/5). Concrete example:
`messages/views/FreePageView.tsx:338-343` — the mobile sidebar-close button renders only
`<IconX size={18} />` with no `aria-label`; a screen-reader user hears "button" with no
indication of what it does. Broad, systemic gap rather than a one-off — worth a pass
across all icon-only buttons (search/close/menu/plus icons especially). The main *list*
interactions correctly use real `<button>` elements, so keyboard access is preserved —
it's specifically the labeling that's missing.

### 27. 🟡 Medium — `/settings/sessions` is a static stub (cross-ref finding #4)

Same gap as #4, listed here too since it's as much a frontend page-to-build as a backend
resolver-to-add.

## Frontend billing/pricing + shared UI

### 28. 🔴 Critical — checkout form's expiry validation always rejects every card

`mockCardFormSchema`'s expiry `.refine()` (`lib/validation/billing.ts:43-53`):

```ts
const year = parseInt(v.expYear, 10);          // e.g. 30, from a 2-digit "YY" input
const expiry = new Date(year, month);          // new Date(30, month)
return expiry > now;
```

The form's `expYear` field is a 2-digit year input (`MockCardForm`'s `exp-year` field:
`maxLength={2}`, placeholder `YY`). `new Date(year, month)` treats any `year` from 0-99 as
`1900 + year` — documented JS `Date` constructor behavior, not a typo — so typing "30"
for 2030 constructs `new Date(1930, month)`, always in the past. **The `expiry > now`
check is false for every possible 2-digit year a user could type**, so the form always
shows "Card has expired" and blocks submission — the mock checkout flow is unusable for
its stated purpose via the client-side path. Verified empirically
(`node -e "console.log(new Date(30,11) > new Date())"` → `false`).

This slipped past `mock-card-form.test.tsx` because its only expiry-relevant test
("blocks invalid Luhn card client-side") uses an invalid card number, so it only proves
the Luhn check fires first — no test asserts a valid card + valid future expiry actually
reaches the submit/fetch step.

**Fix:** convert the 2-digit year to a 4-digit one before constructing the `Date` (e.g.
`2000 + year`), matching how the display formatting/placeholder already assumes "YY"
means 20YY. **Add a test** asserting a valid card + a future 2-digit expiry actually
succeeds (the missing case that let this ship).

### 29. 🟢 Low — card-number formatter caps below the validator's own accepted range

`formatCardNumber` hard-truncates input to 16 digits, but `mockCardFormSchema`'s own
pattern accepts 13-19 digits (matching real card-number length variation — Amex=15, most
cards=16, some debit/UnionPay cards=19). A user with a legitimately longer card number
could never type it correctly. Minor since the documented D3 test cards are all padded to
16 digits.

## Frontend design system & custom UI components

Added 2026-07-06, after researching current (2026) guidance on frontend design systems
and component-library engineering — since this project *is* a stack boilerplate, its
`components/ui/` primitives are the product, not incidental plumbing, so they're held to
a higher bar here than a one-off app screen would be.

### Reference: what "properly implemented" means for this kind of component library

Synthesized from Anthropic's own `frontend-design` skill (the design-philosophy guidance
Claude Code uses when building interfaces —
[SKILL.md](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md),
[announcement](https://claude.com/blog/improving-frontend-design-through-skills)) plus
current (2026) React component-library/design-system practice:

- **Typography as a deliberate choice, not a default.** Pick one distinctive font and
  commit to it; the skill explicitly names `Inter`, `Roboto`, `Arial`, and bare system
  fonts as the generic defaults to avoid, and calls out high weight/size contrast
  (100/200 vs 800/900, 3x+ size jumps) over timid 400-vs-600 variation.
- **Color as a cohesive system via CSS variables**, with a dominant palette plus sharp
  accents rather than an evenly-distributed, timid one — and avoiding the specific
  clichés the skill names (purple gradients on white, cream+terracotta, near-black+
  acid-green).
- **Motion should serve the interaction, not decorate it** — and must respect
  `prefers-reduced-motion`; this is listed as a "quality standard" alongside responsive
  design and keyboard accessibility, not an optional nice-to-have.
- **Accessibility is table-stakes for a 2026 component library**, not a differentiator:
  correct ARIA roles, full keyboard operability (not just clickability), managed focus
  (trap while open, return to trigger on close, move focus in on open), and screen-reader
  announcements for dynamic content (toasts, live counts) — current guidance frames this
  as "WCAG 2.2 AA," and treats missing it as the kind of gap that "costs significant QA
  and remediation effort" later.
- **Headless-vs-styled is the main architectural fork** in 2026 React component
  libraries (Radix/React Aria as headless primitives vs. MUI/Chakra as fully styled).
  This project has taken a third path — hand-rolled primitives (native `<dialog>`,
  custom `Select`/`DropdownMenu` with manual ARIA + keyboard handling) rather than
  building on a headless-accessibility library. That's a legitimate choice (full control,
  no dependency, smaller bundle) but it means **this project owns 100% of the
  accessibility correctness burden that Radix/React Aria would otherwise carry** — every
  focus-management edge case has to be hand-verified, as the findings below illustrate.

### 30. 🟠 High — `Select`'s keyboard navigation is unreachable in practice

`Select`/`SelectContent` (`components/ui/Select.tsx`) implements real arrow-key
navigation (`handleContentKeyDown`, lines 195-225) and marks each `SelectItem` with
`tabIndex={-1}` (line 335) — meaning items are deliberately *not* in the Tab order and
are only meant to be reached by the arrow-key handler moving focus programmatically.
But **nothing ever moves focus into the listbox when it opens**: `SelectContent` has no
`useEffect` that focuses the first (or selected) item when `open` becomes `true` (checked
the full file — the only `.focus()` calls are inside `handleContentKeyDown` itself, and
on Escape/select returning focus to the trigger). Since `onKeyDown` is attached to the
content `<div>` and React keydown handlers only fire for events originating from a
descendant, and focus stays on the trigger `<button>` (a sibling of the portaled content
div, not a descendant) after opening — **arrow-key navigation can never fire at all**,
because the keydown event never reaches the listbox's handler in the first place. A
keyboard-only user who opens a `Select` has no way to move through options at all.

This is a real inconsistency within the component library's own conventions, not a
one-off oversight: `DropdownMenu.tsx:148-153` has the equivalent "focus the first item
when the menu opens" effect and gets this right — the same fix was just never applied to
`Select`.

**Fix:** add a `useEffect` in `SelectContent` that runs on `open` and calls `.focus()` on
the currently-selected `[role="option"]` (or the first one if none selected), mirroring
`DropdownMenu`'s existing pattern.

### 31. 🟠 High — Toast notifications are invisible to screen readers

`ToastViewport`/`Toast` (`components/ui/Toast.tsx`) has no `aria-live` region and no
`role="status"`/`role="alert"` anywhere in the component — not on the viewport container
(lines 91-112), not on the individual toast (lines 158-208). Toasts are exactly the kind
of transient, off-focus UI update that WCAG 4.1.3 ("Status Messages") exists for: a
sighted user sees "Payment failed" or "Post created" appear and disappear after 5 seconds
(line 173's auto-dismiss timer); a screen-reader user gets no announcement at all, sees
nothing appear, and has no way to know the action they just took succeeded or failed
unless the surrounding page also changes in a way their reader picks up.

**Fix:** add `role="status" aria-live="polite"` to `ToastViewport`'s container div (or
per-`Toast`, if toasts can carry different urgency — `aria-live="assertive"` for the
`destructive` variant, `"polite"` for `default`/`success`).

### 32. 🟢 Low — primary font is a generic, highly-recognizable default

`globals.css:80-99` sets `--font-sans: var(--font-geist-sans)` (Vercel's Geist, loaded
via `next/font`) with a `, Arial, Helvetica, sans-serif` fallback stack, used as the
entire app's body font. Geist isn't literally on the frontend-design skill's named
"avoid" list (`Inter`/`Roboto`/`Open Sans`/`Lato`/system fonts), but it's the single most
common choice for Next.js/Vercel-adjacent projects specifically *because* it's the
framework's own default font — functionally in the same "immediately recognizable as a
template, no one will remember it" category the skill's typography guidance warns
against for a project whose whole point is to be *this stack's own* distinctive
boilerplate. Not urgent, but worth a deliberate pick (one distinctive display font for
headings + a refined body font, per the skill's pairing guidance) rather than the
framework default, if visual distinctiveness matters for how this boilerplate presents
itself.

### Confirmed correct (design system) — for the record

- **Reduced motion is genuinely respected, not just gestured at.** `globals.css:202`
  scopes animation rules inside `@media (prefers-reduced-motion: no-preference)`, and
  individual components additionally use Tailwind's `motion-reduce:` variant at the point
  of use (e.g. `Toast.tsx:190`'s `motion-reduce:transition-none`) — belt-and-suspenders,
  correctly done in both the global stylesheet and per-component.
- **`Select`/`DropdownMenu`'s ARIA foundations are solid**: `role="listbox"`/`"option"`,
  `aria-selected`, `aria-expanded`/`aria-haspopup` on triggers, decorative icons marked
  `aria-hidden="true"`, Escape-to-close with focus correctly returned to the trigger, and
  a genuine mobile/desktop responsive split (bottom-sheet on mobile, anchored popover on
  desktop) rather than one cramped layout for both. The *foundation* is well thought out
  — finding #30 is a real gap, but it's a missing piece in an otherwise deliberate
  design, not evidence the accessibility work wasn't attempted.
- **`Dialog`'s use of the native `<dialog>` element** (`showModal()`, the native `cancel`
  event for Escape, `::backdrop`) is a solid, modern choice — the browser handles focus
  trapping and top-layer stacking for free, which is exactly the kind of "own less of the
  accessibility burden" trade-off headless libraries exist for, achieved here without a
  dependency.

## Confirmed correct (for the record — not exhaustive, but worth naming)

- `loginWithOAuth`'s fail-closed check on an empty `providerAccountId` — explicitly
  prevents an account-takeover class of bug via comment + code.
- `requestPasswordReset` always returns `true` regardless of whether the email exists —
  correct anti-enumeration behavior.
- `CsrfGuard` itself — a well-scoped double-submit-cookie implementation (the gap is in
  *where it's applied*, not how it works).
- `trust proxy` correctly set (`main.ts:37`) — `req.ip`-based IP-change detection is
  trustworthy behind the documented reverse proxy.
- `SessionAuthGuard`'s 9-step check order (JWT → tokens present → midnight cutoff →
  Redis read, fail-closed → sub/userId sanity → rbac derivation → IP/UA drift logging →
  attach user → slide TTL) is a genuinely careful, well-reasoned design, mirrored
  consistently by `RealtimeGateway.handleAuth` for the WS path.
- `BillingResolver` correctly uses `@UseGuards(SessionAuthGuard, CsrfGuard)` at the class
  level — the right pattern, contrast with `setUserTier`'s gap.
- `getBillingHistory` scopes strictly to the caller's own wallet — no cross-user leakage.
- `PostService`/`CommentService` correctly check own-authorship before update/delete, and
  correctly treat soft-deleted rows as not-found.
- Cursor pagination (`take + 1` / `skip: 1, cursor: {id}`) used consistently and
  correctly across list queries.
- Per-user (`MAX_SOCKETS_PER_USER=20`) and per-IP pending-connection (`MAX_PENDING_PER_IP=50`)
  caps on the WS gateway are a good defensive touch against connection floods.
- `handleDeliveredAck` correctly checks `message.recipientId !== ws.userId` — only the
  true recipient can ack delivery.
- `SessionScript` correctly escapes `<`/`>`/`&` before embedding SSR user data into an
  inline `<script>` tag — prevents a `</script>`-breakout XSS.
- `/api/auth/logout`'s BFF route correctly echoes a CSRF token before calling the
  backend, and clears local cookies unconditionally even if backend revocation fails.
- The OAuth callback route validates `state` against a cookie-stored value — correct
  CSRF protection for the OAuth flow itself.
- BFF routes consistently pass through real backend HTTP status codes (a known gap in
  earlier phases) across the routes sampled.
- No raw HTML injection of user-generated content anywhere reviewed — post/comment
  bodies render through normal auto-escaped JSX interpolation.
- `TierGate` is correctly implemented as render-only UI sugar, never pretending to be
  real enforcement (which always lives server-side in `TierGuard`).

## Verification pass (2026-07-06) — commit `0b6ade5`

`pnpm test` in `nest-js-boilerplate` went from 220/220 passing to **205 passing, 15
failing across 5 suites**. Root-caused every failure rather than assuming they're all
the same kind of problem — they aren't:

**Stale tests, correct code (no action needed beyond updating the tests) — 11 of the 15
failures:**
- `auth.service.spec.ts` (6 failures, all `resetPassword`): the fix for #7 correctly
  moved the token lookup inside the `$transaction` callback
  (`tx.verificationToken.findUnique`, `auth.service.ts:292`), but the test's mocked `tx`
  object only stubs `verificationToken.update`, not `.findUnique` — `TypeError:
  tx.verificationToken.findUnique is not a function`. The production code is right; the
  mock wasn't updated.
- `billing.service.spec.ts` (3 failures, all `subscribeToPlan`): the fixes for #10/#11
  correctly call `prisma.walletTransaction.findFirst` (idempotency pre-check) and
  `prisma.$transaction([...])` (atomic array form) — neither method exists on the test's
  `mockPrisma` fixture at all. Same story: correct code, unupdated mock.
- `mock-payment.provider.spec.ts` (1 failure, "declines Luhn-invalid last4"): this test
  asserts the *old*, intentionally-removed Luhn-fallback behavior from finding #9. The
  fix is correct; this specific test should have been deleted as part of the fix and
  wasn't.

**Real regressions the fix commit introduced — 4 of the 15 failures, two distinct root
causes:**

1. **🆕 `handleJoinRoom`'s new `isValidRoom()` check breaks the VIP room feature
   entirely**, for every tier, not just the ones it's supposed to gate.
   `CHAT_ROOMS` (`messaging.service.ts:17-23`) is a fixed list —
   `['general', 'random', 'tech', 'design', 'music']` — that has **never** included
   `vip-`-prefixed rooms, because VIP rooms are dynamically named (any `vip-*` string),
   not pre-registered. `isValidRoom('vip-lounge')` returns `false` unconditionally, so
   the newly-added check at the top of `handleJoinRoom` rejects `vip-lounge` as
   `"Invalid room"` for *every* caller — including MEDIUM/PREMIUM users who are supposed
   to be let in. This is worse than the original finding #22 (arbitrary unbounded room
   names could be joined) because it now blocks the *legitimate, documented* feature
   entirely. Confirmed by the 4 newly-failing `messaging-ws.gateway.spec.ts` VIP-tier
   tests (reject-FREE and reject-BASIC now fail because the app sends `"Invalid room"`
   instead of the expected `"VIP rooms require MEDIUM tier"` message; allow-MEDIUM and
   allow-PREMIUM fail because they're rejected at all).

   **Important correction to my own original finding:** #22 asked for `handleJoinRoom`
   to become consistent with `handleRoomMessage`/`handleClaimJoinRoom`, on the assumption
   those two already handled VIP rooms correctly since they already had the
   `isValidRoom` check. That assumption was never verified — and it's wrong.
   `handleClaimJoinRoom` (`messaging-ws.gateway.ts:274`, unchanged by this commit) has
   the *identical* `isValidRoom` check *before* its own VIP-prefix check, so **joining a
   VIP room via the page-claim path has likely been broken since Phase 17 shipped it**,
   pre-dating this whole enhancements round. This wasn't caught by either phase17's
   own verification or my initial review.

   **Fix:** `isValidRoom` needs to accept `vip-`-prefixed rooms as valid independent of
   the fixed `CHAT_ROOMS` list (e.g. `CHAT_ROOMS.includes(room) ||
   room.startsWith(VIP_ROOM_PREFIX)`), in all three handlers — `handleClaimJoinRoom`
   included, since it has the same latent bug.

2. **🆕 `SessionAuthGuard`'s new CSRF check has a null-safety bug, and breaks its own
   new sessions feature.** Two related problems in one change:
   - `isGraphQLMutation` (`session-auth.guard.ts:180-187`) does
     `const info = gqlCtx.getInfo<...>(); return info.parentType?.name === 'Mutation';`
     — the optional-chain protects `.parentType`, not `info` itself. When `getInfo()`
     returns `null`/`undefined` (confirmed reachable — it's exactly what happens in
     `session-auth.guard.spec.ts`'s "authenticates a valid session" test), this throws
     `TypeError: Cannot read properties of null (reading 'parentType')` instead of
     safely resolving to `false`. Since this now runs on *every* `SessionAuthGuard`
     check, a null `getInfo()` in any real execution-context shape this wasn't tested
     against would 500 the whole request rather than just skip the CSRF check. Cheap
     fix: `info?.parentType?.name === 'Mutation'`.
   - **More importantly:** the new `sessions/revoke` and `sessions/revoke-others` BFF
     routes (`next-js-boilerplate/src/app/api/sessions/revoke/route.ts`,
     `revoke-others/route.ts`) call `graphqlFetch(MUTATION, vars, accessToken)` with
     **no CSRF token** — unlike `api/auth/logout`, `api/billing/subscribe`, and
     `api/admin/set-tier`, which all correctly call `csrfEchoHeaders()` first and pass
     the result as a 4th argument. `revokeSession`/`revokeAllOtherSessions` are
     mutations on a `SessionAuthGuard`-guarded resolver, so they're now subject to 0a's
     blanket CSRF requirement — meaning **the brand-new session-management feature
     (finding #4) cannot actually revoke a session; every attempt will fail with
     "Invalid or missing CSRF token."** This is the two halves of the same commit
     breaking each other: 0a's fix and #4's fix shipped together, but nobody re-checked
     #4's new routes against 0a's new requirement. It's also a preview of a structural
     risk in how 0a was implemented: folding CSRF into the guard makes the requirement
     invisible in the backend resolver code (no `@UseGuards(CsrfGuard)` marker to
     remind a BFF-route author it's needed) — easy to miss again next time a new
     mutation is added. **Fix:** add `csrfEchoHeaders()` to both new sessions routes,
     matching the existing pattern.

**Net effect:** roughly 26 of the ~29 addressed findings are genuinely, correctly fixed
— a strong pass overall — but this phase is **not done**. Two concrete regressions
(VIP rooms fully broken, session-revoke fully broken) need fixing, the null-safety bug
in `isGraphQLMutation` should be closed while touching that file anyway, and the test
suite needs its mocks updated before `pnpm test` is green again.

## Regressions fixed (2026-07-06, same day)

All four items from "Verification pass" above are now closed. `pnpm test` is back to
220/220 in `nest-js-boilerplate` and remains 77/77 in `next-js-boilerplate`; `pnpm lint`/
`tsc --noEmit` show no *new* errors from any of these changes (the errors/warnings still
present — `test/tier-guard.e2e-spec.ts`, `token-store.service.spec.ts`,
`tier.guard.spec.ts`, `post.resolver.spec.ts`, `test/microservices.e2e-spec.ts` — are
pre-existing debt in files none of these fixes touched, confirmed via `git status`
before making any change).

1. **VIP rooms — fixed at the root, in both broken handlers.**
   `messaging/messaging.service.ts:17-23` — `isValidRoom` accepted only a fixed
   `CHAT_ROOMS` list, which never included `vip-`-prefixed rooms (they're dynamically
   named, not pre-registered). Moved `VIP_ROOM_PREFIX` from `messaging-ws.gateway.ts`
   (where it was a private, gateway-local constant) into `messaging.service.ts`
   alongside `CHAT_ROOMS`/`isValidRoom`, exported it, and changed the check to
   `CHAT_ROOMS.includes(room) || room.startsWith(VIP_ROOM_PREFIX)`. `messaging-ws.gateway.ts`
   now imports the shared constant instead of defining its own copy (was silently
   duplicated before — a second latent bug: if the two copies ever drifted, the
   VIP-prefix check and the room-validity check could disagree on what counts as a VIP
   room). Confirmed this also silently fixes `handleClaimJoinRoom`'s **identical
   pre-existing bug** noted in the verification pass (it had the same `isValidRoom`
   check before its own VIP-tier check, unchanged since Phase 17 — never caught until
   this investigation because `handleJoinRoom`'s tests are the only ones that exercise
   `isValidRoom` against a `vip-` room name). `isValidRoom`'s return type changed from a
   `room is ChatRoom` type predicate to plain `boolean`, since a VIP room isn't a
   `ChatRoom` literal — confirmed nothing else in the codebase relied on the narrowed
   type (grepped for `ChatRoom` usage; only `isValidRoom`'s own signature referenced it).
   All 4 previously-failing `messaging-ws.gateway.spec.ts` VIP-tier tests pass again
   with zero test changes — the tests were correct all along; only the implementation
   was wrong.

2. **Session-revoke — fixed by adding the missing CSRF echo.**
   `next-js-boilerplate/src/app/api/sessions/revoke/route.ts` and
   `revoke-others/route.ts` now call `csrfEchoHeaders()` before `graphqlFetch(...)`,
   passing `extraHeaders ?? undefined` as the 4th argument — the exact pattern already
   used by `api/auth/logout`, `api/billing/subscribe`, and `api/admin/set-tier`. No
   defensive `if (!extraHeaders)` branch was added — checked the established
   convention first (`billing/subscribe/route.ts`) and it doesn't pre-check either; a
   missing/unreachable CSRF token surfaces as a GraphQL error from the backend's own
   `SessionAuthGuard`, translated by the existing `graphqlErrorBody` path, same as
   every other mutation route. Matching the convention exactly rather than inventing a
   parallel one.

3. **`isGraphQLMutation` null-safety — one-character fix.**
   `nest-js-boilerplate/src/auth/session-auth.guard.ts:187`:
   `info.parentType?.name === 'Mutation'` → `info?.parentType?.name === 'Mutation'`.
   `gqlCtx.getInfo()` can return `null`/`undefined` (confirmed — it's exactly what the
   existing `session-auth.guard.spec.ts` test constructs), and the old code only
   guarded `.parentType`, not `info` itself, so it threw instead of safely resolving to
   `false` (skip the CSRF check). This was surfacing as the "authenticates a valid
   session" test failure; fixed with no test changes needed.

4. **Test suite — stale mocks updated to match the (correct) new code shapes,** plus one
   test rewritten because the behavior it asserted was intentionally removed:
   - `auth/auth.service.spec.ts`: `resetPassword`'s token lookup moved inside
     `$transaction` (enhancements1 #7's fix) — added a `beforeEach` that makes the
     mocked `$transaction` invoke its callback with `mockPrisma` itself as `tx`, so
     every existing per-test `mockPrisma.verificationToken.findUnique.mockResolvedValue(...)`
     still applies without each test needing its own transaction mock. Also updated the
     success-path assertions: `user.update`'s expected `data` now includes
     `failedLoginCount: 0, lockedUntil: null` (enhancements1 #5), and added an
     assertion that `tokenStore.revokeAllForUser` is called (enhancements1 #2) — neither
     was previously asserted at all, so the fixes for #2 and #5 had *zero* regression
     coverage until now.
   - `billing/billing.service.spec.ts`: added `walletTransaction.findFirst` (mocked to
     resolve `null` — no prior transaction for the idempotency key, enhancements1 #10)
     and `$transaction` (mocked as `(ops) => Promise.resolve(ops)`, matching Prisma's
     real array-form semantics, enhancements1 #11) to the `MockPrisma` fixture. No
     assertions needed to change — the existing `user.update`/`walletTransaction.create`
     mocks are still what the tests check against; they're just now invoked from inside
     the array passed to `$transaction` instead of directly.
   - `billing/mock-payment.provider.spec.ts`: the "declines Luhn-invalid last4 with
     invalid_card" test asserted the exact broken behavior enhancements1 #9 removed.
     Replaced it with a test that confirms the *specific* input that used to fail under
     the old fake-Luhn check (`last4: '0001'`) now approves, so this exact regression
     class has a regression test guarding it going forward — the same "add the test
     that would have caught it" discipline this project has used since Phase 17's
     pricing bug.

## Suggested fix order

**Status: done as of 2026-07-06** (items 1-5 below, plus the regressions those fixes
introduced — see "Regressions fixed" above). Kept for traceability, not as a live to-do
list. Item 6 ("everything else") remains open — see `enhancements2.md` for what's being
built next, and the ❌-marked rows in "At a glance" for what's still genuinely
unaddressed from this review.

1. **0a (CSRF)** and **0b (throttling)** first — both are one architectural change each
   (fold CSRF into `SessionAuthGuard` for mutations; add a GraphQL-aware throttler) that
   fixes many individual resolvers at once, rather than patching each mutation piecemeal.
2. **28 (checkout expiry bug)** — trivial fix, blocks the entire mock-checkout feature
   from working at all client-side.
3. **1, 2 (admin guard, session revocation on reset)** — both are "use the guard/method
   that already exists" fixes, low effort.
4. **9, 10, 14 (mock Luhn logic, idempotency ordering, reaction constraint)** — each is a
   contained, well-understood fix within one file.
5. **30, 31 (Select keyboard nav, toast `aria-live`)** — both are small, contained fixes
   in shared `components/ui/` primitives, so each fix immediately benefits every screen
   that already uses `Select`/`Toast` — high leverage relative to effort, same reasoning
   as fixing 0a/0b before individual resolvers.
6. Everything else — genuinely lower urgency; batch into a follow-up pass
  (`enhancements2.md`) once the above land.
