# Upgrade audit #3 — the backend doesn't actually boot

> Written 2026-07-11, the same day as `upgrade.md`, `upgrade-2.md`, and
> `fixes-1.md`, as the 4th from-scratch review of both apps — this time after
> `fixes-1.md`'s P0s and P1s all landed (commits `a80908f`, `39ecaae`, plus
> two small uncommitted diffs currently sitting in the working tree: an
> `admin.resolver.ts` audit-log actor-id fix, and a `proxy.ts` change gating
> `/v1/*` on a session cookie at the middleware layer — both verified correct
> below).
>
> Two parallel deep-dives fed this doc, one per app, each instructed to
> actually run things — tests, builds, and (critically, this time) a live
> boot of the compiled backend plus a real Playwright run against it — rather
> than trust prior "verified" claims. Every finding below was independently
> re-checked against current code by file:line before being written down.
>
> **Headline surprise, and it's a bad one:** the backend has not been able to
> boot since commit `77f6817` — three consecutive audit passes
> (`upgrade-2.md`, `fixes-1.md`, and the "102 e2e tests pass" claim in
> `39ecaae` itself) were all written against a NestJS app that throws
> `UnknownDependenciesException` on startup. Nobody caught it because Jest
> specs mock dependency injection entirely and nothing in CI boots the
> compiled app end-to-end. Once that's fixed, a second, independent bug
> (a malformed Playwright `storageState`) means the e2e suite still doesn't
> pass — a live run gets **164 failed / 6 passed / 170 total**, not the
> "102 passed, 13 skipped, 0 failed" the last commit message claimed. Both
> are cheap, mechanical fixes (S effort each) — the damage here is entirely
> about trust in "verified passing" claims going forward, not difficulty.

**Priorities:** `P0` = fix before calling this production-ready · `P1` =
high-value next · `P2` = nice to have. **Effort:** S (< ½ day) · M (1–2 days)
· L (multi-day).

---

## Critical — fix first

1. **[Backend] The app cannot start at all — two independent DI wiring
   bugs, both introduced by fixes that landed in prior "resolved" audits.**
   `src/sessions/sessions.module.ts:1-7` only imports `AuthModule`, but
   `SessionsResolver`'s constructor (`src/sessions/sessions.resolver.ts:38-41`)
   requires `RealtimeGateway` — added when `upgrade-2.md`'s WS-revocation
   finding (#8) was fixed in `77f6817`, but `RealtimeModule` (which exports
   `RealtimeGateway`, `src/realtime/realtime.module.ts:7-11`) was never added
   to `SessionsModule`'s `imports`. Separately,
   `src/upload/upload.module.ts:1-9` never imports `AuthModule` at all, but
   `UploadController` (patched in the same commit to close `upgrade-2.md`
   #3, the unauthenticated-uploads finding) now carries
   `@UseGuards(SessionAuthGuard)` (`upload.controller.ts:28`), and
   `SessionAuthGuard`'s constructor
   (`src/auth/session-auth.guard.ts:48-53`) needs `JwtService`,
   `TokenStoreService`, and `TokenDerivationService` — all provided only by
   `AuthModule`, which is a plain (non-`@Global()`) module. Both
   `SessionsModule` and `UploadModule` are unconditional `CORE_MODULES`
   (`src/app.module.ts:150,152`), so this is not an edge-config problem —
   confirmed by building `dist/` and running `node dist/src/main.js`
   directly: `UnknownDependenciesException` fires for both, on every boot,
   in every environment (dev, test-against-real-DB, and prod).
   **Failure scenario:** the backend has been unbootable since `77f6817`.
   Every "verified" claim since then that involved actually running the
   server — the e2e "102 passed" claim in `39ecaae`, and implicitly any
   manual QA — was either run against a stale build, a locally-patched copy,
   or not run at all. Unit tests stayed green throughout because Jest specs
   construct services directly and never exercise Nest's DI container.
   **Fix (S):** add `RealtimeModule` to `SessionsModule.imports` and
   `AuthModule` to `UploadModule.imports`. Then add a smoke test to CI that
   actually boots the compiled app (`node dist/src/main.js` with a real or
   sufficiently-stubbed DB/Redis, checking for a clean listen instead of a
   crash) so a DI wiring regression like this fails fast next time instead
   of silently invalidating every audit pass downstream of it.

2. **[Backend] The outbox relay has been completely broken since the
   "fix" for its own untested-reclaim-path finding — every poll tick fails,
   silently, forever.** `fixes-1.md` #7 said the stale-`PUBLISHING` reclaim
   path was "correct but untested." It isn't correct: the raw SQL in
   `src/outbox/outbox.service.ts:88-97` writes an **unquoted** identifier —
   ```sql
   UPDATE "OutboxEvent"
   SET status = 'PENDING', attempts = attempts + 1,
       lastError = 'reclaimed from PUBLISHING (stale > 5m)'
   WHERE status = 'PUBLISHING' AND "updatedAt" < now() - interval '5 minutes'
   ```
   Postgres folds unquoted identifiers to lowercase, so this references a
   column named `lasterror` — the real column, per
   `prisma/schema.prisma:897`, is camelCase and needs quoting:
   `"lastError"`. This throws `column "lasterror" of relation "OutboxEvent"
   does not exist` unconditionally — Postgres has to resolve every column
   name in the statement before it can even evaluate the `WHERE` clause, so
   this fails on *every single call*, not just when a stale row exists.
   `relayPendingEvents()` runs on a 2-second interval by default
   (`outbox.service.ts:49-55`, `OUTBOX_POLL_MS` default `2000`) and the
   caller wraps it in `.catch((err) => this.logger.error(...))` — so the
   process never crashes, it just silently fails to publish a single outbox
   event, ever, once every 2 seconds, for the lifetime of the process.
   `outbox.service.spec.ts`'s new reclaim test didn't catch this because
   Jest mocks `$executeRaw` rather than running it against real Postgres.
   **Failure scenario:** anything that depends on the outbox pattern for
   eventual consistency (cross-service notifications, search-index sync,
   webhooks — whatever `OutboxEvent` rows are meant to drive) never
   actually gets delivered. This is a correctness regression far more severe
   than the "untested" framing in `fixes-1.md` suggested.
   **Fix (S):** quote the identifier — `` `"lastError" = 'reclaimed...'` ``
   — and add an integration test that runs this against a real (or
   `testcontainers`-backed) Postgres instance rather than a mocked
   `$executeRaw`, specifically because this bug class (raw SQL identifier
   casing) is invisible to a mock.

3. **[Frontend] The new Playwright e2e auth fixture writes an invalid
   `storageState` — the suite is not "102 passed, 0 failed," it's 6 passed
   out of 170 when actually run.** `e2e/setup.spec.ts`'s `parseSetCookie`
   helper defaults every cookie object to `path: "/"` (line 63), and the
   caller then unconditionally adds `url: "http://localhost:3100"` on top
   (line 41) — every persisted cookie carries **both** `url` and `path`,
   which Playwright's `storageState` schema explicitly rejects (a cookie
   must have `url` *or* `domain`+`path`, never `url` and `path` together).
   Running the suite for real —
   `pnpm test:e2e --project=chromium` against a live (locally-patched, see
   finding #1) backend — gives **164 failed / 6 passed / 170 total**, every
   failure the identical `browser.newContext: Error setting storage state:
   Cookie should have either url or path`. Only the 5-6 tests that locally
   override `storageState` to an anonymous session (the unauthenticated
   opt-outs in `auth.spec.ts`/`cookie-auth.spec.ts`/`security-cookies.spec.ts`)
   survive. This directly contradicts the "Verified: 102 e2e tests pass, 13
   skipped, 0 failed" claim in commit `39ecaae`'s message — combined with
   finding #1, that claim could not have reflected a real run against a
   live backend at all.
   **Fix (S):** in `setup.spec.ts`, strip `path` (and any other
   attributes Playwright infers from `url`) before spreading `url` onto each
   cookie, or omit `url` and rely on the `path`/`domain` pair `parseSetCookie`
   already builds. Re-run the full suite afterward and record the *actual*
   pass count in the commit message this time — ideally by making this
   check part of CI so a broken fixture can't merge silently again.

4. **[Both] `.env.example`/`env.ts` swap the backend and frontend ports —
   following the brand-new README literally breaks local dev out of the
   box.** `next-js-boilerplate/.env.example:3-4` sets
   `APP_URL=http://localhost:3001` (the value the frontend BFF uses to reach
   the backend) and `NEXT_PUBLIC_APP_URL=http://localhost:3000` (meant to be
   the frontend's own public origin) — but the backend actually listens on
   **3000** (`nest-js-boilerplate/src/main.ts:124`,
   `await app.listen(process.env.PORT ?? 3000)`) and the frontend's own `dev`
   script binds **3001** (`next-js-boilerplate/package.json:7`,
   `"dev": "next dev --turbopack -p 3001"`). The two env values are exactly
   swapped. This is new since `upgrade-2.md` #23 flagged the *absence* of
   `.env.example`/README content at all — the content that was since added
   to close that finding has its own bug.
   **Fix (S):** swap the two values in `.env.example` (and any other
   env-doc referencing them) so `APP_URL=http://localhost:3000` and
   `NEXT_PUBLIC_APP_URL=http://localhost:3001`.

5. **[Backend] `devActivateUser` — added specifically to unblock e2e login
   — fails open on anything other than the exact string `"production"`, has
   no auth guard or rate limit, and can reactivate banned accounts.**
   `src/auth/auth.resolver.ts:93-97`:
   ```ts
   async devActivateUser(@Args('email') email: string): Promise<boolean> {
     if (process.env.NODE_ENV === 'production') return false;
     return this.auth.devActivateUser(email);
   }
   ```
   This is a **blocklist**, the opposite of every other environment gate in
   this codebase — `app.module.ts`'s demo-module split uses an allowlist
   (`LOAD_DEMO_MODULES === 'true' || NODE_ENV === 'development'`). Any
   environment that sets `NODE_ENV=staging`/`qa`/`preview` (an extremely
   common pattern, and not covered by the shipped `Dockerfile`/k8s configmap
   which do hardcode `production` today) leaves this mutation live with
   **zero `@UseGuards`, zero `@Throttle`**, unlike `login`/`register`. Worse:
   the underlying service call unconditionally sets `status: 'ACTIVE'`
   regardless of the account's current status — it doesn't check for
   `BANNED`/`SUSPENDED` first, so it doubles as an unauthenticated
   "un-ban any account by email" endpoint in any non-strictly-production
   environment.
   **Fix (S):** switch to an explicit allowlist
   (`process.env.ALLOW_DEV_ACTIVATE === 'true'`, matching the
   `LOAD_DEMO_MODULES` convention) and early-return `false` unless the
   target's current `status` is `PENDING_VERIFICATION`.

## High priority

6. **[Backend] `setUserStatus` has no role-hierarchy check — any ADMIN can
   ban a SUPERADMIN.** `src/authorization/admin.resolver.ts:102-130` guards
   with `@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)` but never compares the
   caller's role against the target's (the same gap already exists on
   `setUserTier`, lines 84-99, just lower-stakes there). A compromised or
   rogue ADMIN account can call `setUserStatus(superadminId, BANNED)` and
   instantly revoke every session and close every socket for a higher-
   privileged account, with no check stopping it.
   **Fix (S):** fetch the target's current role before applying the change
   and reject if the target's role is `>=` the actor's (or restrict
   `ADMIN`-targeting entirely to `SUPERADMIN` callers).

7. **[Backend] MFA still has no account-recovery path — a stricter gap now
   than "decorative," since login itself is correctly gated.** TOTP-only
   login is genuinely fixed (see "Verified" list below), but
   `MfaBackupCode` rows generated at enrollment
   (`src/mfa/mfa.service.ts:83-90`) are still never read anywhere (grepped
   repo-wide) — `verifyLoginMfa` only checks TOTP. There is also no
   `disableMfa`/`resetMfa` mutation of any kind:
   `src/mfa/mfa.resolver.ts:14,19` exposes exactly two mutations
   (`enrollMfa`, `verifyMfa`), and `AdminResolver` has no MFA-override
   capability either. **Failure scenario:** a user who loses their
   authenticator device is now permanently locked out of their own account
   — no backup codes, no self-service disable, no admin recovery path.
   **Fix (M):** wire backup-code redemption into `verifyLoginMfa` (hash
   compare, single-use, delete row on success), and add either a
   self-service `disableMfa` (require a fresh password+TOTP check) or an
   admin `resetMfa(userId)` mutation.

8. **[Frontend] `generateMetadata` for `posts/[uuid]` — closed as "fixed" in
   `upgrade-2.md` #19 — targets a REST endpoint that doesn't exist on the
   real backend, so it always falls through to the generic placeholder it
   was meant to replace.**
   `src/app/v1/[lang]/posts/[uuid]/page.tsx:22` fetches
   `${APP_URL}/api/posts/${uuid}`. In the real deployment
   `APP_URL` points at the NestJS backend, which is GraphQL-only for posts —
   grepped, zero REST controllers expose `/api/posts/:uuid`. Every fetch
   404s and falls back to the static `{ title: "Post" }` metadata the
   original finding described. This only looked functional in ad-hoc local
   testing because of finding #4's port swap coincidentally pointing
   `APP_URL` at something that returned *a* response.
   **Fix (M):** either call the real GraphQL `post(uuid)` query (matching
   how the page itself already fetches post data) or add a proper REST
   endpoint on the backend — but don't leave `generateMetadata` pointed at a
   route that has never existed.

9. **[Backend] `pnpm test` fails out of the box on a clean checkout — a
   test-hygiene bug in the fix for the "no startup env validation" P0.**
   `src/config/config.spec.ts:19-34` sets `DATABASE_HOST`, `JWT_SECRET`,
   `CSRF_SECRET` but never `DATABASE_URL` — which the (correctly added)
   `validationSchema` now requires, so `ConfigModule.forRoot()` throws
   `"DATABASE_URL" is required"`. Reproduced directly: fails with no ambient
   env set, passes once `DATABASE_URL` is exported. It only looks green in
   CI because `.github/workflows/ci.yml` exports `DATABASE_URL` job-wide and
   this spec's environment isn't hermetic — it accidentally inherits the
   runner's ambient value instead of setting its own.
   **Fix (S):** add an explicit `DATABASE_URL` to this test's `process.env`
   setup, same as the other three variables.

10. **[Frontend] The CSRF-cache fix is a full revert, not a smarter fix —
    worth a deliberate look before calling it done.** `fixes-1.md` #4 found
    the process-global CSRF cache (added to solve the "extra round-trip per
    mutation" complaint) leaked across users under concurrency.
    `src/lib/backend.ts` now simply removes the cache outright — the
    cross-user bug is genuinely gone, but so is the fix for the original
    double-round-trip problem it existed to solve; all 14 mutation call
    sites are back to paying two sequential backend round-trips. None of
    `fixes-1.md`'s suggested session-scoped alternatives (a `Map` keyed by
    session, or a request-scoped cache) were attempted. Not calling this a
    regression — correctness over performance is the right call for a
    revert under time pressure — but the original perf finding
    (`upgrade-2.md` #18) is effectively reopened.
    **Fix (M):** if the round-trip cost is worth solving, key the cache
    explicitly by the caller's session cookie (hash of `access_token`) in a
    `Map<string, {token, cookie, ts}>`, evicted on logout/TTL, instead of a
    single process-global slot.

## Corrections to prior docs

- **`fixes-1.md` #2 ("e2e login fixture", closed by `39ecaae`)** — the
  fixture exists and the *approach* (Playwright `globalSetup`/dependency
  project + seeded test user) is right, but see #1 and #3 above: the backend
  it logs into couldn't boot, and the `storageState` it writes is malformed.
  The "102 passed / 0 failed" verification never happened against a live
  stack.
- **`fixes-1.md` #7 ("outbox stale-reclaim test coverage")** — the fix
  wasn't "correct but untested," it was actively broken (see #2 above); the
  test added alongside it mocks the exact call that hides the bug.
- **`upgrade-2.md` #19 ("posts/[uuid] dynamic metadata")** — still not
  actually working end-to-end; see #8 above.
- **`upgrade-2.md` #23 / `fixes-1.md`'s general README/env praise** — the
  content is now real (a genuine improvement over two prior docs' single
  most-repeated gap), but the values in it are wrong; see #4 above.

## P2 — nice to have

### Backend
- `setUserTier` (`admin.resolver.ts:84-99`) still has no `AuditLog` entry,
  inconsistent with its sibling `setUserStatus` which now correctly logs.
  Add the same `auditLog.create` call.
- Observability: the `diag.setLogger` fix (verified correct — now runs at
  the top of `initOpenTelemetry()`, not buried in shutdown) means export
  failures are finally visible, but the underlying problem is unchanged — no
  `OTEL_EXPORTER_OTLP_ENDPOINT` anywhere and no collector deployed, so
  traces/metrics still export to a nonexistent `localhost:4318` in every
  environment. Deploy a collector or drop OTel init until there's one.
- Backend CI still has no full-repo `fallow dead-code`/`fallow dupes` gate
  at all — the `>> $GITHUB_STEP_SUMMARY` fix that landed for this class of
  finding was applied to the **frontend** workflow only
  (`next-js-boilerplate/.github/workflows/ci.yml:37,40`); backend's only
  `fallow` invocation remains the diff-scoped check inside `pnpm build`.
  `test:cov` is still never invoked in backend CI either (unchanged across
  all four audits now).
- `mfa/`, `push-notification/`, `comment/`, `redis/`, `auth/oauth/` still
  have zero `.spec.ts` files — `sessions/`, `realtime/`, `notification/`,
  `devices/`, and `billing/` gained real coverage since the last audit, so
  this list is genuinely shrinking, just not finished. `mfa/` is the
  sharpest remaining gap given finding #7 above lives there, untested.
- `e2e/standalone.spec.ts` shells out to `docker build` locally — fails in
  a sandbox without Docker; worth confirming it actually passes in real CI,
  since the Dockerfile is otherwise never built/scanned anywhere in
  `ci.yml`.

### Frontend
- MFA challenge form (`src/features/auth/ui/login-form.tsx:137,172`)
  hardcodes English strings ("Two-Factor Authentication", "Verify",
  "Verifying...") instead of routing through `useMessages("auth")` (already
  imported and used elsewhere in the same file, line 75) — a recurrence of
  the i18n-hygiene gap `upgrade.md` #9 flagged elsewhere.
- The `/v1` proxy-level auth gate (currently uncommitted,
  `next-js-boilerplate/src/proxy.ts:143-147`) is correctly scoped and
  correctly stops the crash for a *missing* session cookie — verified. It
  does **not** make the `/v1/[lang]` layout's own redirect redundant: pages
  still do `getSessionUser()!.tier` (e.g. `feed/page.tsx:24`), so a
  *present-but-stale/invalid* token still races between the layout's async
  redirect and the page's non-null assertion — the exact case `fixes-1.md`
  #2's note 4 originally flagged. Keep both guards; consider replacing the
  non-null assertions with a safe accessor as a smaller follow-up.
- Generated i18n files (`src/generated/i18n-messages-{en,tr}.json`, `.d.ts`)
  show up as locally modified simply because the `prebuild` hook regenerates
  them on every `pnpm build` — running the generator produces a clean diff
  against HEAD, so this isn't drift, just noise. Consider `.gitignore`-ing
  generated output instead of committing it, so `git status` stays clean
  after a routine build.
- CHANGELOG `[Unreleased]` still doesn't mention anything from `77f6817`
  onward (MFA challenge UI, admin ban/suspend, CSRF cache changes, e2e
  fixture) — unchanged gap across three audits now.
- Tier-view duplication (`upgrade-2.md` #16) is structurally unresolved:
  chat-room/posts/feed Free-Medium-Premium trios remain fully duplicated
  (~360/~270/~210 lines respectively per the latest pass). The settings-page
  instance is now fixed by aliasing (verified: all 4 settings pages alias
  Basic/Medium/Premium directly to `FreePageView`), which is a real
  structural improvement — the surviving trios don't yet follow the same
  pattern.
- Still no `eslint-plugin-jsx-a11y`, no `@axe-core/playwright`, no
  `dependency-cruiser` — unchanged across all four audits.
- Zero e2e coverage for checkout/billing, settings sub-pages, admin
  audit-logs, chat-room — was previously blocked on the login fixture; now
  blocked on finding #3 above (fixture itself needs to actually work first).
- Skeleton-component triplication and the one `lib/`→`features/` import
  direction violation in `auth-ssr.ts:8` — both unchanged, low priority.

---

## Verified fixed correctly (no action needed)

Listed here so these don't get re-audited for a fifth time: `AuthPayload
.accessToken` nullable + MFA challenge UI/BFF route wired end-to-end
(confirmed via code + a live non-MFA login against the real backend);
admin ban/suspend (`setUserStatus`) revokes sessions, closes sockets, and
now audit-logs the correct actor (the previously-uncommitted fix — actor-id
now correctly reads `admin.userId`, verified no sibling `auditLog.create`
call site has the same bug); API-key tier/role no longer frozen at
issuance (`api-keys.service.ts:88-99` re-reads live Postgres state);
upload endpoints properly guarded with size/type/count limits; CSRF bound
to session cookie, not IP; WebSocket sessions closed on both user-initiated
revoke and admin ban; GIN trigram index now covers both `title` and
`content`; `JsonLd.tsx` escaping, `poweredByHeader: false`, `metadataBase`,
`sideEffects: false`, Vitest coverage tooling, Playwright CI installing all
3 browsers, chat-room/posts aria-label parity across tiers — all confirmed
present and correct in current code.

---

## Suggested execution order

1. **#1–#3** first, in that order — the backend can't boot, so nothing else
   (including re-verifying #3's fixture fix) can be confirmed until #1
   lands; #2 is independent and equally urgent (silent data-loss-adjacent
   bug); #3 needs #1 fixed to even attempt a real re-run.
2. **#4–#5** — both cheap, both currently live footguns for anyone following
   the new README/env docs or running a non-strictly-`production` staging
   environment.
3. **#6–#7** — close the remaining account-security gaps (privilege
   escalation via missing role hierarchy, MFA lockout with no recovery).
4. **#8–#10** — independent, cheap-to-medium fixes; batch together.
5. **P2 lists** — routine hardening, no correctness risk; fold into regular
   maintenance.
