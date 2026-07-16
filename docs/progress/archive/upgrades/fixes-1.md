# Fixes audit #1 — verification of `upgrade-2.md`'s claimed fixes

> Written 2026-07-11, after commit `77f6817` ("fix: resolve security/correctness
> audit findings and fix broken tests") claimed to close out
> [`upgrade-2.md`](./upgrade-2.md). Every item in that doc was independently
> re-verified against current code (two parallel deep-dives, backend and
> frontend) — not trusted from the commit message. Most of it is genuinely
> fixed. This doc exists because a handful of fixes have real bugs of their
> own, and the single most-cited P0 (no e2e login fixture) was not touched at
> all.
>
> Same conventions as `upgrade.md`/`upgrade-2.md`: `P0` = fix before calling
> this done · `P1` = high-value next · `P2` = nice to have. Effort: S (< ½
> day) · M (1–2 days) · L (multi-day). File:line citations point at current
> HEAD, verified directly, not copied from the audit doc.
>
> **Update 2026-07-11 (commit `39ecaae`):** P0 #1, #2, and #3 all resolved.
> P0 #2 (e2e login fixture) implemented via Playwright setup project +
> `devActivateUser` mutation + BFF route. P0 #1 (MFA login) fixed in prior
> commit. P0 #3 (admin ban/suspend) fixed in prior commit.

---

## P0 — the fix itself broke something, or the P0 finding is still wide open

### 1. MFA login is now unusable for real users — schema/frontend gap on top of a correct backend fix

**What's actually fixed:** `login()` correctly withholds tokens when
`user.mfaEnabled` and returns a challenge (`src/auth/auth.service.ts:182-199`);
`verifyLoginMfa()` (`auth.service.ts:226-283`) redeems a real TOTP code via
`otplib` against `MfaFactor`, and `AuthResolver.verifyLoginMfa` exposes it.
`auth.service.spec.ts` has a genuine regression test asserting
`mfaRequired: true` and that `tokenStore.write` is never called for an
enrolled user's password-only login — the original attacker-bypass is closed
for any raw GraphQL client.

**What's broken:** `AuthPayload.accessToken` is still declared non-nullable
in the schema —

```graphql
# src/schema.gql:326-333
type AuthPayload {
  accessToken: String!   # <-- still String!, not String
  deviceId: String
  ...
}
```

(source: `src/auth/auth.types.ts:107-109`, `@Field() accessToken!: string`,
never changed to `{ nullable: true }`). The `mfaRequired` branch returns
`{ mfaRequired: true, mfaToken, user }` with no `accessToken` key at all
(`auth.service.ts:194-198`). The frontend's login BFF route
(`next-js-boilerplate/src/app/api/auth/login/route.ts:24-42`) unconditionally
selects `accessToken` in its `LOGIN_QUERY`. Any client that does this gets a
GraphQL execution error — *"Cannot return null for non-nullable field
AuthPayload.accessToken"* — instead of the challenge payload; `data.login` is
`null`, and the BFF's `errors || !data?.login` check falls through to a
generic "Login failed."

On top of that, there is **zero frontend wiring** for the challenge step —
confirmed via `grep -rn "mfaRequired|mfaToken|verifyLoginMfa"
next-js-boilerplate/src` returning nothing. No UI to prompt for a TOTP code,
no mutation call, no route.

**Failure scenario:** any user who enrolls TOTP can no longer log in through
the actual product at all. This is worse than the original "decorative MFA"
finding from a UX standpoint — we've traded a silent security gap for a
guaranteed account lockout for exactly the security-conscious users most
likely to enable MFA.

**Fix (M):**
1. Make `AuthPayload.accessToken` nullable in `auth.types.ts:107-109`
   (`@Field({ nullable: true }) accessToken?: string;`) and regenerate
   `schema.gql`. Audit every other resolver/client that assumes
   `login.accessToken` is always present (the register/loginWithOAuth paths
   don't hit the MFA branch, so they're unaffected — but any shared
   TypeScript type for `AuthPayload` on the frontend needs the same
   nullability).
2. Add a login-challenge UI: a second step/form that appears when the login
   response has `mfaRequired: true`, collects a 6-digit code, and calls a new
   BFF route wrapping `verifyLoginMfa(mfaToken, code)` — mirroring
   `login/route.ts`'s existing cookie-setting logic (the successful
   `verifyLoginMfa` response has the same cookie-bearing shape as a normal
   login).
3. Add an e2e or integration test that drives the *actual* GraphQL schema
   (not just the service unit test) for an MFA-enrolled login, so a
   schema/nullability regression like this one is caught automatically next
   time.
4. Consider also wiring backup-code redemption while in this code:
   `MfaBackupCode` rows are generated (`mfa.service.ts:100`,
   `mfa.types.ts:21`) but nothing ever reads them — `verifyLoginMfa` only
   checks TOTP. A user who loses their authenticator device has no recovery
   path today.

### 2. Playwright e2e suite still has no login fixture — the original P0 is untouched

Re-verified directly: `playwright.config.ts` has no `globalSetup`,
`globalTeardown`, or `storageState`; no new auth-setup/fixture file exists
under `e2e/`; `e2e/feed.spec.ts`, `e2e/swipe-navigation.spec.ts`, and
`e2e/notifications.spec.ts` still have no `beforeEach`/login step. This is
the exact same gap `upgrade-2.md` finding #4 described — commit `77f6817`
touched `e2e/i18n.spec.ts`, deleted `e2e/messages.spec.ts`, and lightly
edited `e2e/v1.spec.ts`, but never added the fixture itself.

**It's also gotten worse, not just stayed the same.** Pages that call
`getSessionUser()!.tier` (non-null assertion) — `src/app/v1/[lang]/feed/page.tsx`
and all 4 settings `page.tsx` files added in the #7 fix — now **crash** on a
clean session instead of redirecting to login, because `getSessionUser()`
(`src/lib/auth-ssr.ts:14`) returns `null` when there's no session cookie, and
`src/proxy.ts:164` only gates `/dashboard`, not `/v1/*`. Previously these
routes at least rendered *something* (the wrong tier's view, per finding #7);
now several of them throw. `e2e/swipe-navigation.spec.ts` happens to target
`/v1/en/users/*`, a route that doesn't call `getSessionUser()`, so it's
unaffected — incidentally, not because anything was fixed.

**Fix (L):**
1. Add a Playwright `globalSetup` (referenced from `playwright.config.ts` via
   `globalSetup: require.resolve('./e2e/global-setup.ts')`) that logs in a
   seeded test user once via the real login flow and writes
   `storageState.json`; reference that file from `use: { storageState: ...
   }` in the config, or per-project.
2. Seed a stable test user (email/password) as part of `pnpm db:seed` or a
   dedicated e2e fixture script, so CI has a deterministic account to log in
   as.
3. Once the fixture exists, re-run the full suite and confirm
   `feed.spec.ts`/`v1.spec.ts`/`swipe-navigation.spec.ts`/`notifications.spec.ts`
   actually pass from a clean browser context — this cannot be verified from
   a local sandbox per the original audit; confirm on the real GitHub Actions
   run.
4. Separately (small, unrelated to the fixture): decide whether `/v1/*`
   routes should redirect via `proxy.ts` middleware (defense in depth) rather
   than relying solely on `getSessionUser()!.tier` non-null assertions inside
   each page component, so a future auth regression fails safe (redirect)
   instead of throwing a 500.

### 3. Admin ban/suspend mutation still doesn't exist — account status is half-enforced

`login()` now correctly rejects non-`ACTIVE` accounts
(`auth.service.ts:167-180`, tested in `auth.service.spec.ts` for
`PENDING_VERIFICATION` and `BANNED`), which closes the "email verification is
bypassable" half of the original finding. But `src/authorization/admin.resolver.ts`
still only defines `setUserTier` (line 84), `premiumStats` (line 104), and
`growthStats` (line 115) — confirmed via `grep -n "@Mutation|async "` — no
`banUser`/`suspendUser`/`setUserStatus` mutation exists anywhere in the repo.
`SUSPENDED`/`DEACTIVATED`/`BANNED` remain permanently dead enum values with no
code path that ever sets them, and `SessionAuthGuard` still never checks
`user.status` on the request hot path.

**Failure scenario:** there is still no way to stop an abusive or compromised
account short of manually deleting its Redis session keys — the second half
of the original finding is completely open.

**Fix (M):** add a `banUser(userId, reason)` / `setUserStatus(userId,
status)` mutation to `AdminResolver`, following the exact pattern
`setUserTier` already uses to propagate changes (reuse `TokenStoreService` to
revoke the user's Redis sessions on ban, same mechanism tier changes use).
Add `RealtimeGateway.closeSocketsForSession` calls too (now that #8 from the
previous audit wired that up for session revocation) so a ban also closes any
live WebSocket connections, not just future logins.

---

## P1 — real fixes, but each has a gap or a new bug worth closing

### 4. CSRF cache is a cross-user, process-global cache — correctness regression under concurrency

`src/lib/backend.ts:103-134` added a 4-minute TTL cache for the CSRF
token/cookie pair to solve the original "re-fetched every mutation"
complaint (finding #18). The cache variable is process-global:

```ts
// src/lib/backend.ts:103
let cachedCsrf: { token: string; cookie: string; ts: number } | null = null;
```

It is not keyed by session/user in any way. `graphqlFetch` uses the cached
`cookie` value to **replace** the forwarded per-request `Cookie` header (this
is documented in the function's own comment at line 92-94: *"The returned
`cookie` entry REPLACES the forwarded Cookie header in graphqlFetch"*).
Because the backend now binds CSRF tokens to the session cookie itself
(finding #9's fix, `csrf.middleware.ts:18-29`), under concurrent requests
from two different users on the same Node.js server process, whichever
user's request populates the cache first will have their CSRF cookie reused
for every other user's mutation for up to 4 minutes.

**Failure scenario:** in any deployment with more than one concurrent user
per server process (i.e., always, outside of a toy demo) — user B's write
mutation carries user A's CSRF cookie, which the backend's session-bound CSRF
check (finding #9) will now reject as a mismatch, or in a worse case,
succeeds against the wrong session context. Either a wave of spurious CSRF
failures, or a genuine cross-session confusion bug — this needs to be fixed
before finding #9 and #18's fixes can both be trusted in production.

**Fix (S–M):** key the cache by session, not process-global. Options, in
order of simplicity:
- Store the cached CSRF token/cookie on the incoming `NextRequest`'s own
  session identity (e.g., derive a cache key from the caller's
  `access_token`/`device_token` cookie value) instead of a module-level
  variable — a per-request-scoped cache (e.g. Next.js `cache()` /
  `React.cache` keyed by the request) avoids cross-user leakage entirely.
- Simpler: drop the process cache and instead fetch+cache the CSRF token
  once per BFF request lifecycle (i.e., cache within a single incoming
  request's handling of multiple internal calls, not across requests) — this
  still kills the double round-trip for a single user action without
  introducing cross-user state.
- If a longer-lived cache is wanted for real perf reasons, key it explicitly
  by the session's `access_token` (or its hash) with a `Map<string, {token,
  cookie, ts}>`, evicting on logout.

### 5. `otel-setup.ts`'s `diag.setLogger` fix is dead code — it only fires during shutdown

`otel-setup.ts:74` adds `diag.setLogger(new DiagConsoleLogger(),
DiagLogLevel.INFO)`, but it's inside `shutdownOpenTelemetry()` (line 70), not
`initOpenTelemetry()` (line 25). It only registers the diagnostic logger when
the process is already tearing down — meaning startup/runtime export
failures (the entire point of the original finding: OTel silently fails
`ECONNREFUSED` against a nonexistent collector) are still completely silent
for the process's entire running lifetime.

**Fix (S):** move the `diag.setLogger(...)` call to the top of
`initOpenTelemetry()`, before `sdk.start()`, not inside
`shutdownOpenTelemetry()`. Also revisit whether a real OTLP collector should
be deployed (compose `observability` profile) or the OTel init dropped
entirely until there's a backend to receive it — the original finding's
either/or fix still stands; only the "make failures visible" half was
attempted, and it's currently a no-op.

### 6. Feed search GIN index only covers `title`, not `content` — half the original finding

Migration `prisma/migrations/20260711000000_add_outbox_updatedat_and_pgtrgm/`
enables `pg_trgm` and creates `Post_title_content_trgm_idx` — but despite the
name, it's `USING gin (title gin_trgm_ops)` only. `PostService.findAll`
(`post.service.ts:151-152`) still does:

```ts
{ title: { contains: search, mode: 'insensitive' } },
{ content: { contains: search, mode: 'insensitive' } },
```

The `content` half of every search still forces a sequential scan over
`content @db.Text` — the more expensive column, since post bodies are far
larger than titles.

**Fix (S):** add a second GIN index on `content`
(`CREATE INDEX ... ON "Post" USING gin (content gin_trgm_ops);`) in a
follow-up migration, or a combined expression index if query patterns
justify it.

### 7. Outbox stale-reclaim path has no test coverage

Schema/migration/query are all correct (`OutboxEvent.updatedAt`,
`@@index([status, updatedAt])`, and the reclaim query in
`outbox.service.ts:89-98` reclaiming rows `status='PUBLISHING' AND updatedAt
< now() - interval '5 minutes'`). But `outbox.service.spec.ts` mocks
`$executeRaw: jest.fn().mockResolvedValue(0)` globally and no test ever
exercises the reclaim branch specifically — it's a blanket no-op mock, not a
verification that stale rows actually get reclaimed.

**Fix (S):** add a test that seeds/mocks a `PUBLISHING` row with a stale
`updatedAt`, runs the claim query, and asserts it's reselected and
re-processed — the same pattern already used for the `DEAD_LETTER` cutoff
test in the same file.

### 8. `fallow` CI checks can never fail CI — cosmetic, not functional

`.github/workflows/ci.yml:37,40`:

```yaml
run: npx fallow dead-code --ci --format json --quiet 2>/dev/null || true
run: npx fallow dupes --ci --format json --quiet 2>/dev/null || true
```

Both are full-repo scope now (real progress over the old diff-scoped-only
check), but `2>/dev/null` throws away all output and `|| true` forces exit 0
regardless of findings. Nothing in CI ever sees or surfaces the results —
functionally equivalent to not running the check at all, just with extra CI
minutes spent.

**Fix (S):** drop `2>/dev/null || true`; either let the step fail the build
on findings (matching the intent of "CI never sees it" from the original
audit), or if a hard gate isn't wanted yet, at minimum pipe output to a step
summary (`>> $GITHUB_STEP_SUMMARY`) so results are visible without failing
the build. Given 21.7% duplication is a large existing baseline, a soft
"visible but non-blocking" mode is the more realistic first step — but it
must actually be visible, unlike today.

### 9. Chat-room a11y regression only half-fixed — Medium/Premium still missing the sidebar aria-label

`src/views/posts/[uuid]/{Free,Medium,Premium}PageView.tsx` now all have
matching `aria-label`s (fixed). But in chat-room, only
`FreePageView.tsx:159` has `aria-label="Close rooms sidebar"` on its icon
button (line 158-161); `MediumPageView.tsx:153-156` and
`PremiumPageView.tsx:153-156` still render the identical `<button
onClick={() => setSidebarOpen(false)}><IconX size={18} .../></button>` with
no label at all.

**Fix (S):** add `aria-label="Close rooms sidebar"` to
`MediumPageView.tsx:153` and `PremiumPageView.tsx:153`, copying the Free
variant exactly. Medium-term (unchanged from `upgrade-2.md`): install
`eslint-plugin-jsx-a11y` and prioritize the already-tracked `@axe-core/playwright`
pass — neither exists yet (confirmed absent from `package.json`,
`eslint.config.mjs`, `e2e/`), and either would have caught this class of
drift automatically instead of requiring another manual audit pass.

### 10. UI barrel still re-exports Calendar/Carousel; `sideEffects` never added

The 5 call sites (`chat-room/{Free,Medium,Premium}PageView.tsx`,
`find-friends/{Free,Medium}FindFriendsContent.tsx`) now correctly import
`Tabs` directly from `@/components/ui/tabs` — that half is fixed. But
`src/components/ui/index.ts` still re-exports `Calendar`/`Carousel` from the
same barrel as everything else (the `+1` line in the original commit diff
just added a `Typography` re-export, unrelated to this finding), and
`grep -n "sideEffects" next-js-boilerplate/package.json` returns nothing —
the structural fix that would prevent this class of bug at *any* future
import site was never applied.

**Fix (S):** add `"sideEffects": false` to `next-js-boilerplate/package.json`
so bundlers can safely tree-shake unused barrel re-exports repo-wide, not
just at the 5 sites patched by hand.

---

## P2 — confirmed still open (unchanged from `upgrade-2.md`, re-verified)

These were re-checked directly and confirmed not addressed by commit
`77f6817`. No new information beyond re-confirmation; grouped here so this
doc is a complete punch list rather than requiring a diff against
`upgrade-2.md`.

### Backend
- `PostService.findAll` still unconditionally `include: { reactions: true }`
  (`post.service.ts`); `CommentService.findByPost` still has zero pagination
  (`comment.service.ts:147-161`, plain `findMany`, no `take`/`skip`/cursor).
- `k8s/secret.example.yaml`'s `connection_limit=10` advice is still dead —
  never read by `@prisma/adapter-pg`.
- Correlation IDs (`src/logging/request-context.ts`) still don't inject
  `trace_id`/`span_id` into pino log lines.
- `k8s/deployment.yaml:34` still pins mutable `:prod`.
- `mfa/`, `push-notification/`, `comment/`, `redis/` still have zero
  `.spec.ts` files — `mfa/` is now the sharpest gap given P0 finding #1
  above lives there.
- `test:cov` still isn't wired into `.github/workflows/ci.yml`.
- `test/load-test/tokens.json` (495 KB, committed in `77f6817`) contains
  live-looking signed JWT access/rbac/device tokens for load-test users —
  worth confirming these are throwaway dev-only credentials before leaving
  them in git history; if they're not trivially rotatable, scrub and
  `.gitignore` this file instead.

### Frontend
- Three overlapping skeleton entry points still exist
  (`components/ui/Skeleton.tsx`, `components/ui/skeleton/skeleton.tsx`,
  `components/ui/skeleton-shapes.tsx`,
  `components/ui/skeleton/skeleton-shapes.tsx`, plus view/demo copies).
- `src/lib/auth-ssr.ts:8` still imports a type from `@/features/auth/...`
  (the one `lib/`→`features/` dependency-direction violation).
- `next.config.ts` `images` block still has no `formats`/`deviceSizes`/
  `imageSizes` tuning.
- Frontend `Dockerfile` still never built/scanned in `ci.yml`.
- `CHANGELOG.md`'s `[Unreleased]` section still doesn't mention any of
  commit `77f6817`'s changes (CSRF, MFA, a11y, CI, README rewrite, etc.).
- Chat-room mobile sidebar backdrop
  (`FreePageView.tsx:137-141` and Medium/Premium equivalents) is still a raw
  `<div onClick>` with no Escape-key handler.
- `e2e/` still has zero coverage for checkout/billing, settings sub-pages,
  admin audit-logs, and now also chat-room/messages (since `messages.spec.ts`
  was deleted rather than replaced — see P1 item below).
- `src/lib/realtime/realtime-client.test.ts` unchanged since commit
  `1a47572`: `unwatch()` still has zero coverage; backoff tests still use a
  blanket `vi.advanceTimersByTime(2000)` rather than asserting the actual
  exponential-jitter formula or its 30s cap.

### New: messaging/chat-room e2e coverage is now zero, not just "wrong route"

`e2e/messages.spec.ts` was deleted outright (not rewritten) to close
`upgrade-2.md` finding #6, which was the correct call for the dead-route
spec itself — but it means the real messaging feature
(`src/app/v1/[lang]/messages/`, `src/app/v1/[lang]/chat-room/`) now has
**zero** e2e coverage, where before it at least had a (broken) spec pointed
at the wrong route. Folds into the existing P2 checkout/settings/admin e2e
gap — same fix, same blocker (needs the P0 #2 login fixture first).

---

## Suggested execution order

1. **P0 #1–#3** — MFA is currently broken for real users (worse than
   decorative), the e2e fixture is still the single biggest blocker to
   trustworthy CI signal, and the admin ban/suspend gap leaves account status
   half-enforced. Fix in that order: #1 unblocks real MFA usage, #2 unblocks
   every other e2e-dependent finding in this doc and `upgrade-2.md` (#22,
   the new messaging-coverage gap), #3 closes the last open security gap
   from the original critical list.
2. **P1 #4** (CSRF cache) — fix before this reaches any environment with
   concurrent users; it's a correctness regression, not a nice-to-have.
3. **P1 #5–#10** — roughly independent, cheap (S/S–M) fixes; batch together.
4. **P2 list** — routine cleanup, revisit during a regular maintenance pass.
