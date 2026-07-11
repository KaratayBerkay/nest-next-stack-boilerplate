# Upgrade audit #2 — follow-up backend & frontend enhancement pass

> Written 2026-07-11, the same day as [`upgrade.md`](./upgrade.md), as a second
> from-scratch review of both apps after the first audit's fixes landed
> (commits `06e74e0` → `64b57ab`). This is not a re-verification of that doc —
> it's an independent pass looking for what the first audit missed, plus
> what's changed (regressed, been half-fixed, or gone stale) in the several
> commits since `upgrade.md`'s own verification pass.
>
> Four parallel deep-dives fed this doc: backend security/architecture,
> backend testing/performance/observability/DevOps, frontend
> security/architecture/performance/SEO, and frontend
> testing/accessibility/DevOps/DX. Every finding below was verified against
> the current code (file:line citations throughout) — several by actually
> running the code (backend unit specs, a live `pnpm build && pnpm start`
> header check, and the Playwright suite itself) rather than reading alone.
>
> **Headline surprise:** a handful of `upgrade.md`'s "✅ Fixed" verdicts turned
> out to be incomplete once exercised rather than just read — see
> [Corrections to `upgrade.md`](#corrections-to-upgrademd) below. The most
> significant: the Playwright e2e suite has no login fixture, so most specs
> under `/v1/*` fail from a clean browser session regardless of which browser
> runs them — meaning the "4-browser Playwright" fix (#15) didn't actually
> restore a working safety net, it broadened a suite that was already largely
> red.

**Priorities:** `P0` = fix before calling this production-ready · `P1` =
high-value next · `P2` = nice to have. **Effort:** S (< ½ day) · M (1–2 days)
· L (multi-day).

---

## Critical — fix first

1. **[Backend] MFA is fully decorative — enrolling it adds zero login-time
   protection.** `src/auth/auth.service.ts:137-189` (`login()`) never reads
   `user.mfaEnabled` — confirmed via repo-wide grep, the field is only ever
   *written* (`src/mfa/mfa.service.ts:81`), never read anywhere else.
   `MfaResolver` (`src/mfa/mfa.resolver.ts:9-25`) only exposes
   `enrollMfa`/`verifyMfa`, both of which require an *already-valid*
   `SessionAuthGuard` session — i.e., they only run after a password-only
   login has already succeeded and issued tokens. There is no `mfaRequired`
   field on `AuthPayload` (`src/auth/auth.types.ts:98-121`) and no mutation
   anywhere that redeems a TOTP code or backup code as part of
   authentication. `MfaBackupCode` rows are generated
   (`mfa.service.ts:83-86`) but never read/consumed anywhere (grep confirms
   zero other references).
   **Failure scenario:** a user enrolls TOTP believing their account now
   needs a second factor to log in. An attacker who obtains the password
   alone logs in successfully with full session tokens — MFA is never
   checked.
   **Fix (M):** gate `login()` on `user.mfaEnabled` (return a
   partial/challenge state instead of tokens on password success), add a
   `verifyLoginMfa`/`redeemBackupCode` mutation, and add a regression test
   proving MFA actually blocks password-only login for an enrolled account.

2. **[Backend] Account status (email verification, suspension, ban) is
   defined in the schema but never enforced anywhere.**
   `prisma/schema.prisma:36-42` defines
   `UserStatus { PENDING_VERIFICATION, ACTIVE, SUSPENDED, DEACTIVATED, BANNED }`,
   but `login()` (`auth.service.ts:137-165`) never checks `user.status` at
   all — a freshly-registered user with `status: 'PENDING_VERIFICATION'`
   (set at `auth.service.ts:86`) can log in and use the full app without ever
   clicking the email-verification link; `verifyEmail` just flips a DB column
   nobody reads. There is also no admin ban/suspend mutation anywhere
   (`AdminResolver`, `src/authorization/admin.resolver.ts`, only has
   `setUserTier`) — confirmed via grep, no code path ever sets `SUSPENDED`/
   `DEACTIVATED`/`BANNED`. `SessionAuthGuard` never touches `user.status`
   either, so even if a ban mechanism existed today it wouldn't be checked on
   the request hot path.
   **Failure scenario:** (a) email verification is fully bypassable; (b)
   there is no way to stop an abusive or compromised account from continuing
   to use the app short of manually deleting its Redis session keys one by
   one.
   **Fix (M):** check `status === 'ACTIVE'` in `login()` (or explicitly
   decide unverified users are allowed, and drop the dead enum values), add
   an admin ban/suspend mutation, and have it revoke Redis sessions (reuse
   `TokenStoreService`, the same mechanism `setUserTier` already uses to
   propagate changes).

3. **[Backend] `/upload/single` and `/upload/multiple` are completely
   unauthenticated and effectively unbounded.** `src/upload/upload.controller.ts:22-108`
   has no `@UseGuards` anywhere in the file or in `upload.module.ts` —
   contrast every other real-product controller
   (`messaging.controller.ts:34`, `notification.controller.ts:9`, both
   `@UseGuards(SessionAuthGuard)`). `UploadModule` is in `CORE_MODULES`
   (`app.module.ts:152`), so this is live in production. Neither endpoint
   passes a `limits`/`ParseFilePipe` to `FileInterceptor`/`FilesInterceptor`
   (lines 30, 47) — only the third, clearly-a-demo `validated` endpoint
   (lines 57-79, capped at `text/plain`/1KB) has size/type limits. Files are
   resized and written to a MinIO bucket created with a public-read policy
   (`Principal: '*'`, `Action: ['s3:GetObject']`, `minio.service.ts:39-58`).
   **Failure scenario:** any anonymous client can POST arbitrarily
   large/many files with no auth, get them resized, and have them hosted at
   a public MinIO URL — free anonymous file hosting for arbitrary content
   (phishing assets, abuse) or a memory-exhaustion DoS via unbounded
   in-memory multipart buffering. Global rate limiting (120 req/min/IP) is
   the only mitigation today.
   **Fix (S):** add `@UseGuards(SessionAuthGuard)` to `UploadController`, add
   `ParseFilePipe` size/type limits to `single`/`multiple` matching what
   `image.service.ts` expects, and cap file count on `multiple`.

4. **[Frontend] The e2e suite has no login fixture — most specs under
   `/v1/*` fail from a clean session, and this looks like an unnoticed
   regression rather than a known gap.** `src/app/v1/[lang]/layout.tsx:101`
   (`if (!user) redirect(LOGIN_PATH);`) gates the entire `/v1/[lang]/*`
   surface behind a real session, but nothing in `playwright.config.ts` or
   `.github/workflows/ci.yml` sets up `storageState`/`globalSetup`/a login
   step, and no spec logs in before navigating. **Empirically reproduced**
   (ran the suite directly): `e2e/feed.spec.ts` — 5/5 fail, stuck at
   `navigated to ".../auth/login"`; `e2e/v1.spec.ts` — 3/8 fail the same way;
   `e2e/swipe-navigation.spec.ts` — 5/5 fail; `e2e/notifications.spec.ts` hit
   the same class of failure in a joint run. This is environment-independent
   — a fresh Playwright context has zero cookies regardless of backend
   reachability, so `getSessionUser()` (`src/lib/auth-ssr.ts:15-24`) returns
   `null` before any network call and the redirect fires deterministically
   every time. CI runs this exact setup, so these specs are very likely red
   in GitHub Actions today, undercutting the previous audit's item #15
   verdict — the config change (4 browsers) shipped, but a large fraction of
   the suite it's running was probably never green to begin with once the
   real-auth `/v1` gate went in, meaning regressions in feed/share/users/
   chat-room have had no working safety net.
   **Fix (L):** add a Playwright `globalSetup`/fixture that logs in a seeded
   test user once and reuses `storageState` across `/v1/*`-dependent specs
   (or per-file `test.beforeEach` login); then confirm actual pass/fail
   status on the real GitHub Actions run, since it can't be checked from a
   local sandbox.

5. **[Frontend] Playwright config declares 4 browser projects; CI only
   installs 1 — firefox/webkit will fail to launch.**
   `playwright.config.ts:19-24` declares `chromium`, `firefox`, `webkit`,
   `mobile-chrome` (Pixel-7, chromium-engine so it's fine), but
   `.github/workflows/ci.yml:39-40` runs
   `playwright install --with-deps chromium` — only chromium's binary is
   installed — while `test:e2e` (`package.json:14`, no `--project` filter)
   attempts all 4 projects. Firefox and WebKit runs will fail with
   "browserType.launch: Executable doesn't exist." A companion finding to
   #4: the "✅ Fixed — 4 projects" verdict on the old audit's item #15 is
   only half true — the config changed, but CI was never updated to match,
   so cross-browser coverage doesn't actually exist yet in practice.
   **Fix (S):** change CI's install step to
   `playwright install --with-deps chromium firefox webkit`, and add browser
   binary caching (see broader list below) since this roughly triples/
   quadruples install time.

6. **[Frontend] `e2e/messages.spec.ts` tests a route that no longer
   exists — 4/4 tests fail.** Confirmed by running it: all 4 fail, unable to
   find `getByTestId('msg-status'|'msg-input'|'msg-send'|'msg-container')`.
   `page.goto("/messages")` doesn't resolve — there's no `src/app/messages/`
   route, and `src/proxy.ts`'s version-redirect only fires when the first
   path segment matches `/^v\d+$/` (`src/lib/version/config.ts:16-18`), so
   `/messages` 404s outright. The real feature lives at
   `src/app/v1/[lang]/messages/page.tsx` (tiered
   Free/Basic/Medium/Premium views under `src/views/messages/`), and none of
   those files contain the `msg-*` test IDs this spec expects either — the
   spec was written against a page that was since renamed or never matched
   current markup. Unedited since the initial commit (`caac833`).
   **Fix (S):** delete this dead spec, or rewrite it against the real
   `/v1/[lang]/messages` (or `/v1/[lang]/chat-room`) route with matching
   `data-testid`s and the login fixture from #4.

7. **[Frontend] Settings pages hardcode the Free-tier view — paying
   customers get the wrong UI.**
   `src/views/settings/{account,billing,general,privacy}/PageContent.tsx`
   each unconditionally `return <FreePageView />;` — confirmed by reading
   all four. Yet each directory also has a fully-built `BasicPageView.tsx`,
   `MediumPageView.tsx`, `PremiumPageView.tsx` (12 files total) that are
   **never imported anywhere** (independently flagged by `fallow`'s
   unused-files detector). Contrast the correct working pattern one
   directory over: `src/app/v1/[lang]/feed/page.tsx:14-24` builds a `VIEWS`
   map and calls `getTierView(user!.tier, VIEWS)`.
   **Failure scenario:** Basic/Medium/Premium subscribers see the identical
   free-tier settings UI — a real product-correctness bug, not just dead
   code, and one a paying customer would notice immediately.
   **Fix (S–M):** wire the same `getTierView(user!.tier, VIEWS)` pattern into
   all 4 settings `PageContent.tsx` files.

## High priority

8. **[Backend] Revoking a session doesn't close the matching live WebSocket
   connection.** `src/realtime/realtime.gateway.ts:291-424` (`handleAuth`)
   does full Redis-backed token validation, but only once, at connect time —
   after `ws.authenticated = true` (line 379), nothing re-validates for the
   socket's lifetime (the 30s heartbeat, lines 199-221, only checks
   liveness). `SessionsResolver.revokeSession`/`revokeAllOtherSessions`
   (`src/sessions/sessions.resolver.ts:51-68`) only touch the Redis token
   store — neither closes sockets tied to that session.
   **Failure scenario:** a user clicks "log out this device" on a stolen
   laptop; if that device already has an open WebSocket, it keeps receiving
   realtime chat/notifications/feed events indefinitely — the "instant
   revocation" guarantee (ADR 001) doesn't hold for the realtime channel.
   **Fix (M):** track `sessionId` → socket(s) (already stored as
   `ws.sessionId`, line 364) and close matching sockets on revoke; at
   minimum, re-validate the Redis key on each heartbeat tick and close on a
   miss.

9. **[Backend] CSRF token is bound to client IP, not the authenticated
   session.** `src/csrf/csrf.middleware.ts:16-18`:
   `getSessionIdentifier: (req) => req.ip ?? 'anonymous'` — the code's own
   comment admits this should be "the authenticated session id" in a real
   app. Two users behind the same NAT/CGNAT share an identifier (weakening
   the per-session binding), and a legitimate mid-session IP change (mobile
   handoff, LB inconsistency) spuriously invalidates a real user's CSRF
   token.
   **Fix (S–M):** bind to a real session-scoped value — e.g. the raw
   `access_token`/`device_token` cookie value (available in `req.cookies` at
   middleware time) — instead of IP.

10. **[Backend] API keys freeze role/tier at issuance and never re-check
    live account state.** `src/api-keys/api-keys.resolver.ts:27-31` snapshots
    `role`/`tier` from the current session into the `ApiKey` row at creation
    time; `ApiKeysService.validate()` (`api-keys.service.ts:76-109`) reads
    those frozen columns on every request and never joins back to the live
    `User` row.
    **Failure scenario:** a Premium user creates an API key, then downgrades
    to Free (or is banned, once #2 above exists) — the key keeps granting
    Premium-tier access indefinitely, unlike the browser-session path where
    `TierGuard` reads live Redis state and tier changes propagate within 15
    minutes (ADR 004).
    **Fix (S–M):** have `validate()` read the user's current role/tier from
    Postgres/Redis instead of the frozen columns, or explicitly document
    keys as tier-locked-at-issuance and require re-issue on downgrade.

11. **[Backend] Outbox rows can get stuck in `PUBLISHING` forever if the
    process crashes mid-relay.** `src/outbox/outbox.service.ts:88-99` claims
    rows via `UPDATE ... SET status = 'PUBLISHING' ... FOR UPDATE SKIP LOCKED`
    (correctly handles cross-process claim races), but if the process is
    killed between that commit and the subsequent resolution (lines
    126-154), the row is permanently stuck — the claim query's
    `WHERE status = 'PENDING'` will never re-select it, and
    `OutboxEvent` has no `updatedAt` column
    (`prisma/schema.prisma:888-904`) to even detect a stale claim. This is
    distinct from the already-fixed `MAX_ATTEMPTS`/`DEAD_LETTER` cutoff,
    which only covers the exception path, not a hard process kill.
    **Fix (S–M):** add an `updatedAt` column, and have the claim query also
    reclaim rows `WHERE status = 'PUBLISHING' AND updatedAt < now() - interval 'N minutes'`.

12. **[Backend] `reactions` GraphQL query is an unbounded full-table
    scan — same bug class as the original critical #1, just
    authenticated.** `src/reactions/reactions.resolver.ts:16-18` (guarded
    only by `SessionAuthGuard`) calls
    `ReactionsService.findAll()` → `this.prisma.reaction.findMany({ orderBy: { createdAt: 'asc' } })`
    (`reactions.service.ts:27-29`) — no `where`, no `take`, no cursor.
    `ReactionsModule` is in `CORE_MODULES` and was untouched by the recent
    demo/core split.
    **Failure scenario:** any logged-in user queries
    `{ reactions { id userId type } }` and the server loads/serializes every
    `Reaction` row ever created — a trivial single-request resource-
    exhaustion vector as the table grows.
    **Fix (S):** add pagination (cursor + `take`) and drop the unscoped
    query, or scope it to a required `postId`/`commentId` argument.

13. **[Backend] Feed search does an unindexed substring scan.**
    `src/post/post.service.ts:144,155-172` builds
    `where.OR = [{ title: { contains, mode: 'insensitive' } }, { content: { contains, mode: 'insensitive' } }]`;
    `Post` only indexes `authorId`/`status+publishedAt`/`categoryId`
    (`schema.prisma:674-676`) — no `pg_trgm`/GIN index anywhere. Every
    non-empty search forces a sequential scan over `content @db.Text`.
    (`messaging.service.ts:103-104,419-420` has the identical pattern for
    user search but is capped `take: 50`, so smaller blast radius.)
    **Fix (M):** add a `pg_trgm` GIN index on `title`/`content`, or move
    search to a dedicated search engine if volume grows past what Postgres
    trigram indexing comfortably handles.

14. **[Backend] Observability is effectively nonexistent right now — no
    metrics, and OTel tracing silently fails to export.** Corrects
    `upgrade.md`'s item #10 "✅ Fixed" verdict, which is now stale: commit
    `64b57ab` deleted the Prometheus `/metrics` endpoint and all custom
    counters (`TelemetryModule`, `PrometheusService`, `MetricsController` are
    gone; confirmed `ls src/telemetry/` → only `otel-setup.ts` remains).
    Separately, `otel-setup.ts` never sets a `traceExporter` on `NodeSDK`,
    so it falls back to `OTLPTraceExporter()` pointed at the compiled-in
    default `http://localhost:4318` — and no `OTEL_EXPORTER_OTLP_ENDPOINT` is
    set anywhere (grepped `docker-compose.yml`, `k8s/*.yaml`, all env files),
    no collector is deployed anywhere. Both trace and metric exporters fail
    `ECONNREFUSED` in every environment today. Worse: `otel-setup.ts` never
    calls `diag.setLogger(...)`, so every internal OTel warning/error
    (including export failures) is a silent no-op — this could run broken
    for months with zero operator-visible signal. Separately, the app's only
    slow-request log (`PerformanceInterceptor`, `main.ts:93`) opens with
    `if (context.getType() !== 'http') return next.handle();`
    (`interceptors/performance.interceptor.ts:20-22`) — but every resolver
    checked (`post`, `comment`, `reactions`, `notification`, `messaging`,
    `mfa`, `api-keys`, `friends`) reports `getType() === 'graphql'`, so this
    interceptor silently never fires for the app's primary API surface.
    **Fix (M):** either wire a real OTLP endpoint (deploy Jaeger/Tempo in a
    compose `observability` profile, as the first audit's follow-up already
    suggested) or drop the OTel init entirely until there's a backend to
    receive it; call `diag.setLogger(new DiagConsoleLogger())` regardless so
    future failures are visible; fix `PerformanceInterceptor`'s type check to
    also cover `'graphql'`.

15. **[Backend] Testing status correction: `outbox/` and `api-keys/` now
    have real coverage; `mfa/`, `push-notification/`, `notification/`,
    `realtime/`, `sessions/`, `comment/`, `redis/` still have zero.**
    `upgrade.md` item #12 said "❌ Not started" for all of these, but commit
    `1a47572` (which landed after that verification pass) added
    `src/outbox/outbox.service.spec.ts` (7 tests, verified passing, covers
    both the claim-path and catch-path `DEAD_LETTER` thresholds) and
    `src/api-keys/api-keys.guard.spec.ts` (6 tests, verified passing, covers
    `bp_` prefix detection/pass-through/validation failure). Both were run
    directly (13/13 pass) and exercise real branch logic, not snapshots. The
    other 7 modules are still untested — `mfa/` is the sharpest remaining gap
    given finding #1 above lives there and needs a regression test the
    moment it's fixed. Separately, no coverage gate exists at all:
    `test:cov` is defined in `package.json` but never invoked by
    `.github/workflows/ci.yml`, and no `coverageThreshold` exists anywhere.
    **Fix (L, incremental):** `mfa/` next (pairs directly with fixing #1),
    then `sessions/`/`notification/`/`realtime/`, using
    `session-auth.guard.spec.ts` and the two new specs above as templates;
    separately wire `test:cov` into CI even without a hard threshold yet, for
    visibility.

16. **[Frontend] 21.7% of the codebase is duplicated (6,863 lines / 124
    files across 101 clone groups) — and CI never sees it.** The project's
    own `fallow-check` CI script only runs `fallow audit --ci --fail-on-issues`,
    which is **diff-scoped** — a clean-tree run reports "0 changed files, no
    issues." A full-repo `fallow dupes` scan (not run anywhere in CI) surfaces
    the real picture. Largest concrete clusters, all real product code: the
    Free/Medium/Premium tier-view trio for chat-room (218 + 142 duplicated
    lines between just two files, plus a 104-line 3-way clone), the same
    pattern for `posts/[uuid]` (180 lines) and `feed` list components (164 +
    124 lines) — i.e., the same tier-variant-per-file pattern that produced
    finding #7's settings-page bug is duplicated, not parameterized,
    everywhere else it's used correctly. Smaller, cleaner extraction
    candidates: `login-form.tsx`/`register-form.tsx`,
    `date-input.tsx`/`date-time-input.tsx`,
    `popover-content.tsx`/`select-content.tsx`.
    **Fix:** (S, immediate) actually run `fallow dupes`/`fallow dead-code`
    full-repo in CI, not just the diff-scoped check, so this stops growing
    silently; (L, incremental) extract the shared 40-60% of each tier-view
    trio into one component parameterized by tier/permissions — this would
    also structurally prevent bugs like #7 from recurring.

17. **[Frontend] Shared UI barrel drags `react-day-picker`/`embla-carousel`
    into routes that never render either — ~69 KB of dead weight per
    affected route, confirmed via built artifacts.**
    `src/components/ui/index.ts:11,13` re-exports `Calendar` (wraps
    `react-day-picker`) and `Carousel` (wraps `embla-carousel-react`) from
    the same barrel as `Tabs`. `src/views/chat-room/{Free,Medium,Premium}PageView.tsx`
    and `src/views/find-friends/{Free,Medium}FindFriendsContent.tsx` import
    only `{ Tabs, TabsContent, TabsList, TabsTrigger }` from `@/components/ui`
    — but inspecting `.next/server/app/v1/[lang]/chat-room/page_client-reference-manifest.js`
    shows chunk `1amg26963i5_i.js` (70,775 bytes, confirmed containing
    `react-day-picker` source) listed as a required, non-async dependency.
    Cross-checked: `/`, `/v1/[lang]/messages`, `/v1/[lang]/settings/account`,
    and even the actual `/v1/[lang]/ui/calendar` demo route do **not** carry
    this chunk — isolating the cause precisely to the `Tabs` barrel import.
    **Fix (S):** import `Tabs` directly from `@/components/ui/tabs` at the 5
    affected call sites instead of the barrel; add `"sideEffects": false` to
    `package.json` so bundlers can safely elide unused barrel re-exports more
    generally (currently absent).

18. **[Frontend] CSRF token is re-fetched from the backend on every single
    mutation, adding a serialized extra round-trip to 14+ write paths.**
    `csrfEchoHeaders()` (`src/lib/backend.ts:100-114`) does
    `await backendFetch<{token:string}>("/csrf/token")`, awaited *before* the
    actual mutation's `graphqlFetch(...)` call. Confirmed at 14 separate BFF
    route handlers: posts create/update, comments create/update, reactions,
    profile update, admin set-tier, api-keys create/revoke, logout, session
    revoke/revoke-others, billing subscribe, notifications read. Every write
    action pays two sequential backend round-trips instead of one.
    **Fix (M):** issue/cache one CSRF token per session (e.g. at login or
    `/v1` layout mount) and reuse it across mutations instead of fetching
    fresh every time.

19. **[Frontend] `metadataBase` is still missing, and `posts/[uuid]` has
    zero dynamic metadata — sharper than the original audit's framing.**
    `metadataBase` remains absent repo-wide (confirmed by grep) — blocks
    OG/Twitter image URLs from resolving to absolute URLs. Separately,
    `src/app/v1/[lang]/posts/[uuid]/page.tsx:9-12` exports a **static**
    `metadata = { title: "Post", description: "View post" }` — identical for
    every post UUID, since there's no `generateMetadata()` reading the actual
    post. Every shared post link/browser tab/bookmark shows the generic word
    "Post" regardless of content. (Practical crawler impact depends on
    whether `generateMetadata` resolves before or after the `/v1` layout's
    unauthenticated-redirect — worth a quick manual check, but the
    static-metadata gap itself is real and independent of that question.)
    **Fix (S–M):** add `metadataBase` to the root layout; add
    `generateMetadata()` to `posts/[uuid]/page.tsx` fetching the real title/
    excerpt/OG image.

20. **[Frontend] Tier-view duplication (see #16) has already caused a real
    accessibility regression for paying customers.**
    `src/views/posts/[uuid]/FreePageView.tsx:129,148` has
    `aria-label="Edit post"`/`"Delete post"` on its icon-only buttons;
    the **identical** buttons in `MediumPageView.tsx`/`PremiumPageView.tsx`
    (same lines) have no label at all — an unlabeled button for screen-reader
    users. Same pattern in chat-room: `FreePageView.tsx:159` has
    `aria-label="Close rooms sidebar"`; `MediumPageView.tsx:156`/
    `PremiumPageView.tsx:156` don't. Net effect: paying (Basic/Medium/
    Premium) users get a measurably worse screen-reader experience than
    Free-tier users on the same features. Nothing currently catches this —
    `@axe-core/playwright` still isn't used anywhere (grepped, zero hits;
    already tracked in `docs/todo/03-frontend.md`), and `eslint-plugin-jsx-a11y`
    still isn't installed (confirmed absent from `package.json`,
    `eslint.config.mjs`, and even `node_modules` — not present transitively
    either).
    **Fix (S):** copy the missing `aria-label`s from the Free variant into
    Medium/Premium immediately; medium-term, install `eslint-plugin-jsx-a11y`
    (`pnpm add -D`, register `jsx-a11y.flatConfigs.recommended`) so this class
    of drift is caught by lint, not just manual review — and prioritize the
    already-tracked axe-core Playwright pass, since it would have caught this
    immediately.

21. **[Frontend] No coverage tooling exists at all in the unit-test
    config.** `vitest.config.ts` has no `test.coverage` block; no
    `@vitest/coverage-v8`/`-istanbul` dependency; no `test:coverage` script
    (all confirmed absent via grep). Unchanged from the original audit's
    ask — the same-day fix pass didn't pick this up.
    **Fix (S):** `pnpm add -D @vitest/coverage-v8`, add a `coverage` block,
    add a `test:coverage` script — visibility alone is the win, a hard
    threshold can come later.

22. **[Frontend] E2E coverage for checkout/billing, settings sub-pages, and
    admin audit-logs is exactly zero, not just "thin."** The real routes
    exist (`checkout/`, `settings/{account,api-keys,billing,general,privacy,sessions}/`,
    `admin/audit-logs/`), but `grep -rli 'stripe|checkout|billing|settings|admin|audit' e2e/`
    returns no matches at all. Chat-room is in the same position — the only
    spec with "chat" in its name (`messages.spec.ts`) tests an unrelated,
    already-broken demo route (see #6).
    **Fix (L, incremental, blocked on #4's auth fixture):** add specs for
    checkout (Stripe test-mode flow — prioritize this one, it's
    money-adjacent), each settings sub-page's core action, admin audit-log
    pagination/filtering, and chat-room room-switching.

23. **[Frontend] Root `README.md` is still unedited `create-next-app`
    boilerplate; no `.env.example` exists anywhere in the repo.** Both
    confirmed unchanged from the original audit — `README.md` (36 lines)
    still reads "This is a Next.js project bootstrapped with
    `create-next-app`," no mention of the actual stack, `/v1` architecture,
    env vars, or the NestJS backend; `.env.local` is still a symlink to
    `../prod/nextjs.env` outside the repo, and no `.env.example`/`.env.sample`
    exists at the repo root. Given how good `AGENTS.md`/`CHANGELOG.md`/
    `src/README.md` already are, this remains the single highest-visibility
    gap for a new contributor.
    **Fix (S):** rewrite `README.md` to describe the actual stack and dev
    workflow; commit a `.env.example` generated from `env.ts`'s schema plus
    the Dockerfile `ARG`s.

## Corrections to `upgrade.md`

These aren't new findings so much as places where exercising (not just
reading) the current code shows the earlier doc's "✅ Fixed" framing needs an
asterisk. Cross-referenced above where a full write-up already exists.

- **#10 (backend observability)** — "Fixed" is stale. The Prometheus
  `/metrics` endpoint it described was deleted one commit later
  (`64b57ab`); OTel tracing survives but silently fails to export anywhere
  (see #14 above). Current real state: pino logs + `AuditLog` table only.
- **#13 (frontend unit test coverage)** — partially addressed, not
  untouched. `src/lib/realtime/realtime-client.test.ts` (377 lines, 23
  tests) landed in commit `1a47572` and is genuinely substantive — verified
  it drives the full `idle → connecting → authenticating → open → backoff →
  down` state machine including auth-failure recovery, claim replay, topic
  allowlist rejection, and the degraded-retry `online`-event race, exactly
  as the original audit asked. Two small gaps remain: `unwatch()` has zero
  coverage, and the backoff tests advance fake timers by a blanket 2000ms
  rather than asserting the actual exponential-jitter formula or its 30s
  cap. No other unit tests were added (13 unit test files now vs. 12
  before, out of 986 non-test files) — `components/ui/*`, auth hooks, and
  `views/` remain untested.
- **#15 (Playwright multi-browser)** — half-fixed. The config change is
  real, but see #4 and #5 above: CI never installs the other 3 browsers,
  and a large share of the suite fails from a missing auth fixture
  regardless of which browser runs it.
- Backend broader list's "no real resolver/service uses `cache-manager`"
  claim is now false — `MessagingModule` (`messaging.module.ts:20`) backs
  conversation/friend-search caching with `CacheModule.register()` and real
  invalidation on writes. It's registered with no store option, though, so
  it's in-process Keyv, not Redis — each replica has an independent,
  inconsistent cache in a horizontally-scaled deployment (accepting a
  friend request on replica A doesn't invalidate replica B's cached
  results). New P2 item, not a full re-open of the old claim.
- Frontend broader list's implied claim that the Stripe checkout form
  doesn't defer its weight off the initial bundle doesn't hold up — build
  inspection shows Next's automatic per-route code splitting already
  isolates `@stripe/*` to the `/checkout/[tier]` route; no other route's
  chunk manifest includes it. The real, verified bundle-hygiene issue is
  the barrel-file leakage in #17 above, not missing `next/dynamic()`.

## P2 — nice to have

### Backend
- `StaticAssetsModule` is imported in `app.module.ts:62` but placed in
  neither `CORE_MODULES` nor `DEMO_MODULES` — the one demo module the
  recent split missed, so it's dead/unreachable in every mode. Add it to
  `DEMO_MODULES` or delete the import.
- `prom-client` was resurrected as a `package.json:133` dependency one
  commit (`7537ff8`) after `64b57ab` deliberately removed it — a likely
  side effect of adding `@opentelemetry/sdk-metrics` in the same commit.
  Zero references remain in `src/`. Remove it again.
- `SwaggerModule.setup('api', app, document)` (`main.ts:104-114`) is
  unconditional — no `NODE_ENV` gate, no auth. Since real REST controllers
  (`messaging`, `notification`, `upload`, `stripe-webhook`, `device`,
  `oauth`) are all in `CORE_MODULES`, the generated doc reflects real
  production endpoint/DTO shapes, browsable by anyone at `/api`/`/api-json`.
  Gate behind `NODE_ENV !== 'production'`.
- `PostService.findAll`/`CommentService.findByPost` over-fetch: eager
  `include: { reactions: true }` on every post regardless of whether
  tier-gated reaction fields are even selected, and top-level comments have
  no pagination at all (`comment.service.ts:147-161`, plain `findMany`).
- DB connection pool silently defaults to 10/replica —
  `src/prisma/prisma.service.ts:23-27` passes only `{ connectionString }` to
  `PrismaPg`, and `k8s/secret.example.yaml:14-16`'s advice to append
  `&connection_limit=10` to `DATABASE_URL` is a classic-Prisma-engine
  convention never read by `@prisma/adapter-pg`. Today's `replicas: 2`
  happens to be fine, but scaling replicas while trusting
  `connection_limit` to cap total connections would silently blow past
  intent.
- Correlation IDs (`src/logging/request-context.ts`) and OTel trace context
  don't talk to each other — no `trace_id`/`span_id` injected into pino log
  lines, so there's no way to pivot log↔trace even once #14 is fixed.
- `load:setup`/`load:run`/`load:test` scripts (`package.json:41-43`,
  added in `1a47572`) reference `test/load-test/{setup.mjs,ws-chat-load.js}`
  which don't exist anywhere in the repo — `pnpm load:test` fails
  immediately. Scaffolding for the already-tracked load-testing item, not a
  working implementation of it.
- `jest-brokers.json`/`jest-cli-plugin.json`/`jest-lazy-loading.json`/
  `jest-openapi-plugin.json`/`jest-orms.json`/`jest-swc.json` still never
  run in CI (unchanged from `docs/todo/04-devops.md`).
- k8s `deployment.yaml:34` still pins mutable `:prod` (unchanged, already
  tracked).

### Frontend
- `x-cookies-present` debug header (`src/proxy.ts:177-188`) ships
  unconditionally in production — live-verified via `curl` on a `pnpm
  start` build. Unnecessary auth-state disclosure to proxies/extensions/
  logging pipelines. Gate behind `NODE_ENV !== "production"`.
- `X-Powered-By: Next.js` leaks framework fingerprint (live-verified);
  `next.config.ts` never sets `poweredByHeader: false`. One-line fix.
- `src/lib/seo/JsonLd.tsx:7` does
  `dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}` with no
  escaping, unlike its sibling `SessionScript.tsx:7-10` which explicitly
  escapes `<`/`>`/`&`. Currently safe (only static schema.org objects are
  passed today), but a latent `</script>`-breakout XSS trap the moment
  per-post JSON-LD (see #19) starts passing user content through it. Add
  the same escaping now, before that happens.
- `src/app/api/auth/oauth/[provider]/route.ts:14-19` sets the `oauth_state`
  CSRF cookie without `secure`, unlike every other cookie which goes
  through `src/lib/cookie.ts`'s `baseOptions()` (`secure:
  process.env.NODE_ENV === "production"`). Low real-world risk (httpOnly +
  sameSite=lax + 10min TTL) but an unexplained inconsistency worth closing.
- `src/app/(demos)/page.tsx` and `src/app/page.tsx` both resolve to `/`
  (route groups don't add a path segment) — `src/app/(demos)/page.tsx` is
  100% unreachable, silently shadowed, no build warning. Delete it or move
  the demos index to `/demos`.
- Three overlapping skeleton entry points (`skeleton-shapes.tsx` top-level
  shim, `skeleton/skeleton-shapes.tsx` real implementation,
  `Skeleton.tsx` duplicate re-export) — 20 real consumers use the
  top-level shim, only one demo page uses `Skeleton.tsx`. Delete the two
  redundant entry points and repoint consumers at the real one.
- `src/components/ui/Toast.tsx:1` and `toast/index.ts:1` carry a stale,
  typo'd `// fallow-ignore-file unused-exports` (fallow's actual finding
  kind is `unused-export`, singular) — a one-character fix.
- `src/lib/auth-ssr.ts:8` imports a type from `@/features/auth/...` — a
  `lib/` file reaching into `features/`, against the documented dependency
  direction. `import type`-only (zero runtime impact) and the only
  violation found across `lib/`/`components/`/`components/ui/` — otherwise
  the architecture rule holds up well.
- Image config (`next.config.ts:33-48`) has no `formats`/`deviceSizes`/
  `imageSizes` tuning — defaults to WebP-only, no AVIF.
- No fetch caching/`revalidateTag` anywhere under `src/app/v1` (unchanged
  from original audit — still just worth a deliberate look, not a clear
  defect given the BFF + TanStack Query pattern).
- Frontend `Dockerfile` is never built or scanned in CI — `ci.yml`'s
  `verify` job runs `pnpm build` but never `docker build`, so a
  Dockerfile-breaking change wouldn't be caught until deploy.
- `CHANGELOG.md`'s `[Unreleased]` section wasn't updated for today's
  commits (realtime tests, OTel, Playwright multi-browser, rate-limit
  fail-loud) — everything else in the file is meticulously maintained, this
  is a small gap.
- Chat-room's mobile sidebar backdrop
  (`src/views/chat-room/PremiumPageView.tsx:136-139` and Medium/Free
  equivalents) is a raw `<div onClick>` with no Escape-key handler, unlike
  `src/components/ui/popover/popover-content.tsx:72-85` which wires one for
  the identical backdrop pattern in the same codebase.
- `e2e/v1.spec.ts:41-50` asserts a `de` (German) dictionary that no longer
  ships (`messages/` only has `en`/`tr`) — fails when run. Update the
  assertion to `tr` or remove it.
- `components.md` is still a flat one-line-per-component checklist, no
  prop tables or implementation links (unchanged, already tracked).
- Frontend still has zero k8s manifests (unchanged, already tracked).

---

## Suggested execution order

1. **Backend P0s (#1–#3)** — MFA bypass, unenforced account status, and
   unauthenticated uploads are all live security gaps in the real product,
   not demo code. Fix before anything else here.
2. **Frontend P0s (#4–#7)** — the e2e auth fixture (#4) unblocks trustworthy
   signal for everything else in frontend testing, so do it first within
   this group; the settings-page tier bug (#7) is a five-minute-conceptually
   but real fix a paying customer would notice today.
3. **Backend P1s (#8–#15)**, roughly in listed order — the WS revocation gap
   (#8) and CSRF/API-key issues (#9–#10) round out the auth-hardening work
   from the first audit; observability (#14) is worth doing before adding
   more instrumentation on top of a base that's currently exporting to
   nowhere silently.
4. **Frontend P1s (#16–#23)** — the CI-blind duplication finding (#16) and
   the a11y regression it already caused (#20) pair naturally; #21–#23 are
   independent, cheap wins that don't block on anything else.
5. **P2 lists** — routine hardening/cleanup, no correctness risk; batch into
   regular maintenance passes per app.
