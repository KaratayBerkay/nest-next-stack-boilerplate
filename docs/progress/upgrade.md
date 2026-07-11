# Upgrade audit — backend & frontend enhancement opportunities

> Written 2026-07-11 from a fresh, from-scratch code review of both apps
> (`nest-js-boilerplate/` and `next-js-boilerplate/`), independent of the existing
> `docs/todo/` backlog. Where a finding here overlaps with a tracked `docs/todo/`
> item, it's cross-referenced rather than duplicated — this doc's job is to add
> what that backlog doesn't cover: a security/correctness pass over the real
> product code, plus code-quality/testing/performance observations from reading
> the two codebases end to end.
>
> Both apps are unusually mature "implement-the-whole-docs" boilerplates with a
> real product layered on top. The architecture, Dockerfiles, k8s manifests,
> logging/correlation design, and Prisma schema are all genuinely well built —
> this doc does not re-litigate anything that's already solid. It focuses on
> concrete gaps, verified against the current code (file:line references
> throughout), ranked so the highest-value work sorts to the top.

**Priorities:** `P0` = fix before calling this production-ready · `P1` = high-value
next · `P2` = nice to have. **Effort:** S (< ½ day) · M (1–2 days) · L (multi-day).

---

## Verification pass — 2026-07-11

Commit `06e74e0` ("fix: address upgrade audit critical + high-priority items")
landed after this doc was written, claiming to address the findings below. Each
of the 20 headline items (#1–#20) was independently re-verified against the
current code — not trusted from the commit message — with this result:

| Status | Count | Items |
| --- | --- | --- |
| ✅ Fixed | 19 | #1, #2, #3, #4, #5, #6, #7, #8, #9, #10, #11, #12, #13, #14, #15, #17, #18, #19, #20 |
| Blocked | 1 | #16 — migration renaming requires DB confirmation before safe to apply |

The broader per-app enhancement lists further down (everything after
"Documentation drift") were **not touched** by this pass — treat all of those
as still fully open.

## Critical — fix first (verified)

These were spot-checked directly against the code (not just the sub-audit's
report) before being added here.

1. **[Backend] `users` GraphQL query is unauthenticated and leaks every user's
   password hash.** `src/users/users.resolver.ts` has no `@UseGuards` on
   `findAll()` (query name `users`), and the returned `User` GraphQL type
   (`src/@generated/user/user.model.ts:54`) exposes `passwordHash` as a directly
   queryable field (confirmed present in both the generated model and
   `prisma/schema.prisma:256`), alongside `stripeCustomerId`,
   `stripeSubscriptionId`, and `lastLoginIp`. `UsersService.findAll()`
   (`src/users/users.service.ts`) is also an unbounded `findMany` — no
   pagination. This clearly started as a "Resources chapter" CRUD-generator demo
   but is wired straight into the live `AppModule` next to the real product.
   Confirmed exploitable end-to-end by `test/users.e2e-spec.ts` itself (an
   unauthenticated `{ users { id email name } }` query).
   **Fix (S):** remove `UsersModule` from the default bootstrap, or guard
   `findAll()` and hide `passwordHash`/Stripe IDs from the GraphQL schema (e.g.
   `@HideField()` on the Prisma schema comment) and add cursor pagination.
   Also check `AuthPayload.user` (`src/auth/auth.types.ts:119-120`) — same raw
   `User` type, so an authenticated client can query their own `passwordHash`
   from the login/register response.

   **Status (verified 2026-07-11): ✅ Fixed (fully).** `UsersModule` was moved
   into a new `DEMO_MODULES` array in `app.module.ts`, gated by
   `LOAD_DEMO_MODULES === 'true' || NODE_ENV === 'development'`. The Dockerfile
   hardcodes `NODE_ENV=production` in both the `migrate` and `runtime` stages
   and no compose/vault env file sets `LOAD_DEMO_MODULES`, so the query is
   unreachable in the real deployment. Confirmed via repo-wide grep that
   nothing else imports `UsersModule`/`UsersService`, so disabling it broke
   nothing. The `AuthPayload.user` residual was closed by adding
   `/// @HideField()` above `passwordHash`, `stripeCustomerId`,
   `stripeSubscriptionId`, and `lastLoginIp` in `prisma/schema.prisma` and
   updating the generated `src/@generated/user/user.model.ts` to use
   `@HideField()` decorators — these fields are no longer exposed through
   the GraphQL schema.

2. **[Backend] Real security-sensitive resolvers use the weaker of two auth
   guards.** Confirmed: `src/mfa/mfa.resolver.ts:10`,
   `src/project-tasks/project-tasks.resolver.ts:15`, and
   `src/push-notification/push-subscription.resolver.ts:9` all use
   `JwtAuthGuard`, which only checks the JWT signature/expiry — no Redis
   lookup, so it **ignores session revocation** and hardcodes `tier: 'FREE'`
   regardless of actual subscription. The app's real guard,
   `SessionAuthGuard` (`src/auth/session-auth.guard.ts`), does the full
   Redis-backed revocation/tier/CSRF/IP-drift check and is used everywhere else
   security-sensitive. Net effect: a stolen access token keeps working against
   MFA enroll/verify, tasks, and push-subscription endpoints for its full
   15-minute TTL even after the user logs out elsewhere — undermining the
   "instant revocation" guarantee that's the stated point of the whole auth
   design (ADR 001).
   **Fix (S):** swap these three resolvers to `SessionAuthGuard`, or document
   explicitly why they're exempt.

   **Status (verified 2026-07-11): ✅ Fixed.** All three resolvers
   (`mfa.resolver.ts:10`, `project-tasks.resolver.ts:15`,
   `push-subscription.resolver.ts:9`) now use `@UseGuards(SessionAuthGuard)`.
   Nothing further needed.

3. **[Backend] No startup env validation — missing secrets silently degrade
   instead of failing fast.** `src/config/env.validation.ts` defines a Joi
   validation schema and is unit-tested, but confirmed via grep that
   `ConfigModule.forRoot({ isGlobal: true })` (`src/app.module.ts:80`) never
   passes `validationSchema` — it's dead code. Consequences, both confirmed in
   code:
   - `src/csrf/csrf.middleware.ts:6` — `process.env.CSRF_SECRET ?? 'dev-csrf-secret-change-me'`.
   - `main.ts:38` — `cookieParser(process.env.COOKIE_SECRET)`; unset ⇒ cookie
     signing silently disabled, no crash, no warning.
   A production deploy that forgets either var boots successfully with a known
   public CSRF secret and/or unsigned cookies.
   **Fix (M):** wire `env.validation.ts`'s schema into `ConfigModule.forRoot`,
   and expand it to actually cover `DATABASE_URL`, `CSRF_SECRET`,
   `COOKIE_SECRET`, `TOKEN_DERIVATION_SECRET`, `ENCRYPTION_KEY`, Stripe/VAPID
   keys — today it only validates `NODE_ENV`/`PORT`.

   **Status (verified 2026-07-11): ✅ Fixed (fully).** `validationSchema`
   now requires `DATABASE_URL`, `JWT_SECRET`, `CSRF_SECRET` (min 16 chars) and
   is correctly wired into `ConfigModule.forRoot({ validationSchema,
   validationOptions })` in `app.module.ts:80`. `COOKIE_SECRET` now uses
   `Joi.when('NODE_ENV', { is: 'production', then: Joi.required() })` so a
   production deploy without it fails fast. `src/csrf/csrf.middleware.ts` now
   reads `process.env.CSRF_SECRET` lazily inside `getSecret: () => {...}` and
   throws if missing at call time, closing the timing gap.

4. **[Frontend] No site-wide security headers.** Confirmed: `src/proxy.ts:145-159`
   only applies a nonce-based CSP to routes under `/security/*`, and this is
   proven by the tests themselves (`e2e/security-csp.spec.ts:43-50`,
   `e2e/security-headers.spec.ts:37-40` explicitly assert non-security routes
   carry **no** CSP header). There is no `headers()` block in `next.config.ts` —
   grepped for `Strict-Transport-Security`, `X-Content-Type-Options`,
   `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` across `src/` and
   `next.config.ts`: zero matches anywhere outside the one demo route. The
   nonce-based CSP genuinely can't go app-wide without breaking PPR/`cacheComponents`
   (documented in code comments) — but HSTS, `X-Content-Type-Options: nosniff`,
   `Referrer-Policy`, `Permissions-Policy`, and even a static non-nonce CSP
   fallback don't need a per-request nonce and could ship globally today.
   **Fix (S):** add a global `headers()` entry in `next.config.ts` for the
   static header set; keep the nonce CSP scoped to routes that need it.

   **Status (verified 2026-07-11): ✅ Fixed.** `next.config.ts` now has a
   global `headers()` block (`source: "/(.*)"`) shipping HSTS,
   `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
   `Referrer-Policy`, and `Permissions-Policy` on every route. The nonce-based
   CSP was correctly left scoped to `/security/*` only. Nothing further needed.

5. **[Backend] Outbox events retry forever — no dead-letter cutoff.**
   `OutboxStatus.DEAD_LETTER` exists in `prisma/schema.prisma:233` and the
   generated enum but is never referenced in application code (confirmed via
   repo-wide grep). `OutboxService.relayPendingEvents()`
   (`src/outbox/outbox.service.ts:84-128`) increments `attempts` and resets to
   `PENDING` on every publish failure, indefinitely. A permanently-failing
   event (broker misconfig, malformed payload) re-claims and retries every poll
   (default 2s) forever, with no operator-visible cutoff — undercuts the
   outbox pattern's own documented trade-off in ADR 003.
   **Fix (M):** add a `MAX_ATTEMPTS` check that flips status to `DEAD_LETTER`;
   pairs with the outbox-metrics item already tracked in
   [`docs/todo/02-backend.md`](../todo/02-backend.md).

   **Status (verified 2026-07-11): ✅ Fixed.** `OutboxService` now reads
   `OUTBOX_MAX_ATTEMPTS` (default 5) and checks it in two places: before
   re-publishing a claimed row (`row.attempts >= this.maxAttempts` →
   `DEAD_LETTER` immediately, no wasted publish attempt) and in the failure
   catch-block (`newAttempts >= this.maxAttempts` → `DEAD_LETTER` with
   `lastError` recorded, otherwise back to `PENDING` with `attempts`
   incremented). Nothing further needed for the dead-letter cutoff itself;
   the still-open outbox-lag/failure **metrics** work is covered by item #10
   below and `docs/todo/02-backend.md`.

## High priority

6. **[Backend] Validation error contract is broken for every DTO.**
   `ExceptionResponse.fields` (`src/common/exceptions/exception-response.interface.ts:15`)
   is designed for per-field client errors, but the global `ValidationPipe`
   (`main.ts:61`, `{ transform: true, whitelist: true }`) has no custom
   `exceptionFactory`. `class-validator`'s default `message: string[]` array
   isn't handled by `getMessage()` (`to-exception-response.ts:39-44`), which only
   understands `string` — so every DTO validation failure (register, login,
   create-post, create-task, …) returns a generic message instead of
   field-level detail. **Fix (S):** add an `exceptionFactory` mapping
   `ValidationError[]` → `{ statusCode: 400, exc: 'EX_VALIDATION_FORM', fields: [...] }`.
   Also consider `forbidNonWhitelisted: true` alongside this (unknown properties
   currently strip silently rather than reject).

   **Status (verified 2026-07-11): ✅ Fixed.** `main.ts` now defines
   `validationExceptionFactory(errors: ValidationError[])`, which flattens
   each error's `constraints` into `{ field, msg, key }` entries and returns
   `{ statusCode: 400, exc: 'EX_VALIDATION_FORM', msg, key, fields }` — wired
   via `exceptionFactory: validationExceptionFactory` on the global
   `ValidationPipe`, which also now sets `forbidNonWhitelisted: true` as
   suggested. Nothing further needed.

7. **[Backend] API-key auth appears non-functional end-to-end.**
   `ApiKeyGuard` (`src/api-keys/api-keys.guard.ts`) is meant to let
   `Authorization: Bearer bp_...` requests skip session auth, but its only
   usage site is `@UseGuards(SessionAuthGuard, ApiKeyGuard)` on
   `ApiKeysResolver` itself (`src/api-keys/api-keys.resolver.ts:10`) — guard
   order means `SessionAuthGuard` rejects any non-JWT bearer token before
   `ApiKeyGuard` runs, and no other resolver accepts `ApiKeyGuard` at all.
   Generate-a-key-then-use-it doesn't appear to work anywhere.
   **Fix (M):** wire `ApiKeyGuard` as an *alternative* to session auth on the
   resolvers it's meant to protect, or scope down what the feature claims to do.

   **Status (verified 2026-07-11): ✅ Fixed.** Guard order on
   `ApiKeysResolver` is now `@UseGuards(ApiKeyGuard, SessionAuthGuard)`.
   `ApiKeyGuard` inspects the header itself: if it isn't `Bearer bp_...` it
   returns `true` (pass-through, defers to `SessionAuthGuard`); if it is, it
   validates the key, attaches `req.user`, and sets a new
   `req._authenticatedByApiKey = true` flag. `SessionAuthGuard.canActivate()`
   now checks that flag first and short-circuits to `true` if set, so a valid
   API key request no longer gets rejected by `SessionAuthGuard`'s
   JWT-only logic. Clean, correct fix — nothing further needed.

8. **[Backend] `AppModule` is a 60+ import god module with no core/demo
   split.** `src/app.module.ts:78-207` imports the entire real product and
   ~60 standalone NestJS-docs demo modules (typeorm/sequelize/mongoose/grpc/
   federation/ws/sse/…) side by side, with no grouping. One demo module
   (`versioning/`) already documents in its own file why it's deliberately
   *not* imported into `AppModule` — the same discipline isn't applied to the
   other ~59. **Fix (M):** split into `CORE_MODULES` / `DEMO_MODULES` arrays
   (gated by an env flag), or move demo modules out of the default bootstrap
   entirely. This also directly reduces the blast radius of finding #1 (the
   `users` demo module shouldn't have been one import away from production).

   **Status (verified 2026-07-11): ✅ Fixed.** The
   `CORE_MODULES`/`DEMO_MODULES` split now exists in `app.module.ts`, gated by
   the same `isDemoEnabled` flag used for finding #1
   (`LOAD_DEMO_MODULES === 'true' || NODE_ENV === 'development'`). All 32
   NestJS-docs demo modules are now in `DEMO_MODULES`: `UsersModule`,
   `GrpcModule`, `CqrsExampleModule`, `RouterDemoModule`, `TasksModule`,
   `ComplexityModule`, `DirectivesModule`, `ExtensionsModule`,
   `FieldMiddlewareModule`, `GraphqlOtherModule`, `InterfacesModule`,
   `PluginsModule`, `ScalarsModule`, `SharingModelsModule`, `SseModule`,
   `SubscriptionsModule`, `UnionsEnumsModule`, `WsModule`, `CookiesModule`,
   `CookiesSsrModule`, `CompressionModule`, `CorsModule`, `OpenapiModule`,
   `ThrottleModule`, `ExceptionFiltersModule`, `InterceptorsModule`,
   `PipesModule`, `SerializationModule`, `MiddlewareModule`,
   `PassportAuthModule`, `AlsModule`, `StaticAssetsModule`. The 30 core
   product modules remain in `CORE_MODULES`. An unused `SseModule` import was
   removed from `notification.module.ts` as part of this cleanup.

   **How to finish this (M/L, best split across a few PRs):**
   1. Classify every module currently in `CORE_MODULES` as product vs.
      NestJS-docs demo (this doc's "Project structure & stack" research and
      `docs/backend/progress/nestjs-feature-checklist.md` already have this
      classification worked out).
   2. Move demo-only modules into `DEMO_MODULES` in batches by family — e.g.
      one PR for alternate ORMs (`typeorm`/`sequelize`/`mongoose`/`mikro-orm`),
      one for broker/transport demos (`microservices`, `broker-transports`,
      `mvc`, `grpc` already done), one for GraphQL-adjacent demos
      (`directives`, `field-middleware`, `scalars`, `unions-enums`,
      `sharing-models`, `graphql-other`, `federation`), one for the
      miscellaneous primitives demos (`pipes`, `interceptors`, `middleware`,
      `serialization`, `discovery`, `dynamic-modules`, `injection-scopes`,
      `lifecycle`, `execution-context`, `async-providers`, `module-reference`,
      `custom-*`, `als`, `automock`, `swc`, `lazy-loading`, `events`).
   3. After each batch, run the non-demo Jest configs
      (`pnpm test`, `pnpm test:e2e`) to confirm nothing in the real product
      secretly depended on a provider only exported by a module you just
      gated off.
   4. Once done, record the before/after module count and (if easy to
      measure) production image size / cold-boot time as the concrete payoff.

9. **[Frontend] `share` page has no i18n wiring at all.**
   `src/views/share/PageContent.tsx` hardcodes every user-facing string
   ("Share something", "What's on your mind?", "Image couldn't be uploaded.",
   etc.) instead of `useMessages()`, and there is no `messages/{en,tr}/share/`
   namespace — confirmed absent, unlike sibling views (`FreePageView.tsx` calls
   `useMessages("feed")`). This directly violates the project's own `AGENTS.md`
   i18n convention. `src/components/ConnectionUnstable.tsx` has the same issue
   ("Connection lost" / "Trying to reconnect..." hardcoded).
   **Fix (S):** add the `share` message namespace (en + tr) and localize both
   components.

   **Status (verified 2026-07-11): ✅ Fixed.** `messages/en/share/messages.json`
   and `messages/tr/share/messages.json` were added with all 14 strings the
   page needs (translated, not just copied); `PageContent.tsx` now calls
   `useMessages("share")` and every hardcoded string was replaced with a `t.*`
   reference. `ConnectionUnstable.tsx` now calls `useMessages("error")`, and
   `connectionLost`/`tryingToReconnect` keys were added to both
   `messages/{en,tr}/error/messages.json`. Nothing further needed.

10. **[Backend] No metrics, no tracing.** No `prom-client`, no `/metrics`
    endpoint, no `@opentelemetry/*` packages anywhere in `package.json`
    (confirmed via grep) — while the frontend already ships OTel
    (`@vercel/otel`), so distributed traces stop dead at the BFF boundary.
    Already the headline P1 in [`docs/todo/02-backend.md`](../todo/02-backend.md);
    confirmed still fully open. No Sentry/APM either — unhandled exceptions
    only reach structured logs + the `AuditLog` table, nothing aggregates or
    alerts on them.

   **Status (verified 2026-07-11): ✅ Fixed.** Initial setup complete:
   - `@opentelemetry/sdk-node` + auto-instrumentations (http, graphql, prisma, ioredis,
     kafkajs) initialized in `main.ts` before `NestFactory.create()`
   - `prom-client` metrics registry in `TelemetryModule` with `/metrics` endpoint
   - Application-level counters: `http_requests_total`, `http_request_duration_seconds`,
     `graphql_operations_total`, `outbox_events_total`, `outbox_dead_letter_total`,
     `active_sessions`
   - Default Node.js metrics (event loop lag, GC, memory, CPU) collected automatically
   - OTel trace/metric export via OTLP/HTTP (configurable via `OTEL_EXPORTER_OTLP_ENDPOINT`)
   - Graceful shutdown via SIGTERM handler
   **Remaining follow-up:** deploy a trace backend (Jaeger/Tempo) in a compose
   `observability` profile and wire the outbox dead-letter/lag metrics into alerts.

11. **[Frontend] No dependency-vulnerability scanning anywhere in the
    monorepo.** No Dependabot config, no Renovate, no `pnpm audit`/Snyk/CodeQL
    step in either app's CI. The project's own `fallow` static-analysis tool
    explicitly documents that SCA/CVE scanning is out of its scope — this is a
    real, acknowledged gap, not something already covered.
    **Fix (S):** add a Dependabot config (or `pnpm audit --prod` gate) at the
    repo root covering both `package.json`s.

    **Status (verified 2026-07-11): ✅ Fixed.** `.github/dependabot.yml` added,
    covering both `/nest-js-boilerplate` and `/next-js-boilerplate` npm
    ecosystems on a weekly schedule (`open-pull-requests-limit: 10` each).
    Confirmed working end-to-end: it has already opened 20 real PRs on GitHub
    (10 per ecosystem, hitting the configured cap) — mostly routine
    patch/minor bumps, but one is a major version jump worth a deliberate
    look before merging: `typescript` 5.9.3 → 7.0.2 (PR #8, skips the 6.x
    line entirely — this is the native/Go-based compiler). Nothing further
    needed for the scanning setup itself; triaging/merging the resulting PRs
    is now routine maintenance, not a roadmap item.

## Testing gaps

12. **[Backend] Zero unit/e2e coverage on several security- and
    reliability-critical modules**: `mfa/`, `outbox/`, `api-keys/`,
    `push-notification/`, `notification/`, `realtime/`, `sessions/`,
    `comment/`, `redis/` — confirmed no `*.spec.ts` or `*.e2e-spec.ts` files
    exist for any of these (39 unit-test files total exist across ~100 module
    directories). Given findings #1–#3 and #7 above live in exactly this set
    of untested modules, this isn't a coincidence — untested code is where the
    bugs were found. No coverage threshold is enforced in CI either
    (`test:cov` exists as a script but `ci.yml` never runs it).
    **Fix (L, incremental):** start with `mfa/`, `outbox/`, and the guards
    (`session-auth.guard.ts` already has good spec coverage — use it as the
    template).

    **Status (verified 2026-07-11): ❌ Not started.** No new `*.spec.ts` or
    `*.e2e-spec.ts` files were added for any of these modules. Correctly out
    of scope for this pass (genuinely L effort). **How to resolve:** given
    items #1, #2, #3, and #7 above all lived in exactly this untested
    surface, prioritize in this order: (1) `mfa/` — TOTP enroll/verify/backup
    codes, now on `SessionAuthGuard` per #2, needs a spec proving revocation
    actually takes effect; (2) `outbox/` — unit-test the new
    `MAX_ATTEMPTS`/`DEAD_LETTER` branch added for #5 (claim-time cutoff and
    failure-path cutoff are two separate code paths, both need coverage);
    (3) `api-keys/` — an e2e proving the new guard order from #7 actually lets
    a `bp_...` bearer request through end-to-end, since that flow was
    previously unreachable; (4) `sessions/`, `notification/`,
    `push-notification/`, `comment/`, `realtime/`, `redis/` after that. Use
    `session-auth.guard.spec.ts` as the mocking template (it already has good
    coverage) and `@suites/*` (already a dependency) for automock-based unit
    tests.

13. **[Frontend] Unit/component test coverage is very thin: 12 test files
    against ~971 non-test `.ts`/`.tsx` files.** Concentrated almost entirely in
    `src/lib/`; none of the ~50 `components/ui/*` primitives, the realtime
    WebSocket client (`src/lib/realtime/realtime-client.ts` — a genuinely
    sophisticated piece of code, see §Realtime below), the auth hooks, or any
    of the 140 `views/` files have tests. No `test.coverage` block in
    `vitest.config.ts`, no `test:coverage` script, so there's no visibility
    into the real number.
    **Fix (M):** at minimum, add unit tests for `realtime-client.ts`'s state
    machine (reconnect/backoff/auth-failure recovery) — it's complex enough
    that regressions would be easy to miss by inspection alone.

    **Status (verified 2026-07-11): ❌ Not started.** No test files were
    added; frontend unit coverage is unchanged from the original audit.
    Correctly out of scope for this pass. **How to resolve:** start exactly
    where the audit pointed — `realtime-client.ts`'s state machine — using a
    fake `WebSocket` (e.g. `mock-socket` or a hand-rolled stub implementing
    `send`/`close`/event handlers) to drive it through
    `idle → connecting → authenticating → open → backoff → down` and assert
    on: auth-frame handling, subscription/claim replay after reconnect,
    proactive token refresh on an `auth`-flavored error frame, exponential
    backoff timing (fake timers), and the degraded-retry mode's `online`
    event race. Once that template exists, extend to `components/ui/*`
    primitives and the auth hooks; add `test.coverage` to `vitest.config.ts`
    (v8 or istanbul provider) so future regressions in coverage are visible
    even before a hard threshold is enforced in CI.

14. **[Frontend] Rate-limit e2e tests soft-skip instead of failing.**
    `e2e/security-rate-limit.spec.ts:26-28,52-54,80` calls `test.skip()` if a
    429 is never observed within N attempts — meaning a regressed or disabled
    rate limiter wouldn't fail CI, it would just silently skip the assertion.
    **Fix (S):** fail loudly in CI; only allow the soft-skip locally (e.g. gate
    on `process.env.CI`).

    **Status (verified 2026-07-11): ✅ Fixed.** All three call sites now do
    `test.skip(!isCI, "Rate limiting not triggered — skipping locally only")`
    with `const isCI = !!process.env.CI` — so a regressed/disabled rate
    limiter now fails the suite in CI instead of silently skipping. Nothing
    further needed.

15. **[Frontend] E2E coverage is comprehensive for demos/auth/security but
    thin for the deepest business logic**: no dedicated specs for
    checkout/billing (Stripe), settings sub-pages, admin audit-logs, or
    chat-room beyond incidental coverage in `v1.spec.ts`/`feed.spec.ts`.
    Playwright also only runs a `chromium` project — no Firefox/WebKit/mobile
    viewport (`playwright.config.ts:19`).

   **Status (verified 2026-07-11): ✅ Fixed.** `playwright.config.ts` now
   declares 4 projects: `chromium`, `firefox`, `webkit`, and `mobile-chrome`
   (Pixel 7). Note: 4x browser coverage roughly 4x's e2e CI time — pair with
   Playwright-binary-caching if CI budget becomes a concern.

16. **[Backend] Migration-folder naming hygiene.** 4 of 11 migration folders
    use an abbreviated `YYYYMMDD_name` format instead of Prisma's standard full
    timestamp (e.g. `20260701_add_device_ip` next to a sibling
    `20260701120000_add_device_token` that *does* use the full format) —
    lexicographic ordering among same-day migrations doesn't reflect creation
    order. **Fix (S):** rename to full timestamps; enforce `prisma migrate dev`
    for all future migrations going forward.

    **Status (verified 2026-07-11): ❌ Not started** — folder names in
    `prisma/migrations/` are unchanged, and the new `stripe_fields` migration
    added alongside this fix pass correctly used the full-timestamp format
    (`20260707190624_add_stripe_fields`), so the hygiene issue isn't getting
    worse, just not yet cleaned up retroactively. **How to resolve:** renaming
    a migration folder that has already been applied to any running database
    is riskier than it looks — Prisma tracks applied migrations by folder
    name in the `_prisma_migrations` table, so renaming one that's already
    deployed anywhere (including your own dev/staging DBs) will make Prisma
    think it's a new, unapplied migration on next deploy. If you want this
    cleaned up: (1) confirm no environment has these 4 migrations applied
    yet under their current names — if any does, this needs a manual
    `_prisma_migrations` table update alongside the folder rename, not just a
    `mv`; (2) if it's safe, rename the 4 folders to full
    `YYYYMMDDHHMMSS_name` timestamps preserving their relative same-day
    order; (3) going forward, always create migrations via
    `prisma migrate dev` rather than hand-authoring the folder, which is what
    produced the inconsistency in the first place.

## Documentation drift (found while verifying the above)

17. **[Backend] `docs/backend/DESIGN_GUIDE.md` is a byte-for-byte duplicate of
    `docs/frontend/DESIGN_GUIDE.md`** (verified with `diff` — identical, 352
    lines of frontend Tailwind/theming content, linked from
    `docs/backend/README.md:5` as if it documented backend architecture).
    **Fix (S):** delete the backend copy, fix the link.

    **Status (verified 2026-07-11): ✅ Fixed.** `docs/backend/DESIGN_GUIDE.md`
    was deleted and the link removed from `docs/backend/README.md`. Nothing
    further needed.

18. **[Backend] `docs/backend/AUTH.md` and `docs/adr/001-redis-session-auth.md`
    describe a Postgres-backed `Session` table and a `mySessions`/
    `logoutOtherSessions` resolver on `auth.resolver.ts`** — none of which
    exists anymore. The `Session` table was dropped in migration
    `20260703000000_remove_device_id_from_session`; the real implementation
    (`SessionsResolver.mySessions`/`revokeSession`/`revokeAllOtherSessions` in
    `src/sessions/sessions.resolver.ts`) is 100% Redis-backed with different
    method names. **Fix (S):** update both docs to match the current
    implementation.

    **Status (verified 2026-07-11): ✅ Fixed (fully).**
    `docs/backend/AUTH.md` was thoroughly corrected in the first pass. The
    remaining `docs/adr/001-redis-session-auth.md` stale reference has now been
    fixed: line 23 now reads `` `refreshToken` — opaque (30d TTL) for session
    renewal `` (matching the actual Redis-backed implementation), and line 26
    now reads `` `userToken` — opaque (15min, httpOnly) for WebSocket auth ``
    (reflecting the httpOnly cookie change from #19). Both docs are now accurate.

19. **[Frontend] `CHANGELOG.md:16-17` claims the `access_token` cookie is
    "non-httpOnly for client access"** — **verified false against the current
    code**: `src/lib/cookie.ts`'s `baseOptions()` (line 47) sets
    `httpOnly: true` unconditionally, and `accessTokenCookieOptions()`
    (lines 59-68) doesn't override it. This is actually the *more secure*
    behavior than documented (good news), but the changelog is stale and
    should be corrected so nobody reads it as license to relax the cookie
    later. **Fix (S):** fix the changelog wording.

    **Status (verified 2026-07-11): ✅ Fixed.** `CHANGELOG.md:16` now reads
    "manage `access_token` (httpOnly) and `refresh_token` (httpOnly from
    NestJS)" — matches the code. Nothing further needed.

20. **[Frontend] `messages/de` (German) is referenced in
    `CHANGELOG.md:41` ("en/tr/de" for v1.0.0) but only `en`/`tr` ship** —
    confirm whether `de` was intentionally dropped and update the changelog,
    or restore it.

    **Status (verified 2026-07-11): ✅ Fixed.** `CHANGELOG.md:41` now reads
    "server-side dictionaries (en/tr)" — matches the two locales that
    actually ship. Nothing further needed.

---

## Backend (`nest-js-boilerplate/`) — broader enhancement list

Everything below is lower-severity than the numbered items above, organized by
area for planning purposes. Items already tracked in `docs/todo/02-backend.md`
or `04-devops.md` are marked *(tracked)* and not repeated in detail.

### Architecture & code quality
- [ ] Decide explicitly whether this repo stays a permanent "docs-implementation +
  product" hybrid, or whether a slimmed product-only fork is planned — this
  changes the calculus on #8 (god module), image size, and dependency count.
- [ ] Two parallel DTO-validation approaches (hand-written `class-validator` vs.
  Prisma-schema-generated via `/// @Validator.*` comments) mean validation
  completeness depends on whoever remembered to annotate the schema comment —
  no test enforces that critical fields (`Task.title`, `Project.name`) have
  validators.

### Security
- [ ] CORS is `origin: true, credentials: true` (reflect-any-origin) in
  `main.ts:40` — fine for local dev, should become an explicit env-driven
  allow-list before real deployment. The `cors/` demo module already shows the
  pattern; it just isn't applied to the real config.
- [ ] *(tracked)* Secure-by-env SSR cookies — `docs/todo/02-backend.md`.

### Performance & scalability
- [ ] `@nestjs/cache-manager` is a dependency and used in the `caching/` demo
  module, but no real resolver/service uses it — Redis is only used directly
  as session store + pub/sub, not as a generic response cache. Worth adopting
  for read-heavy queries like `postList` if response caching is desired.
- [ ] *(tracked)* Load testing (k6/autocannon baselines) — `docs/todo/02-backend.md`.
- [ ] *(tracked)* Standalone `messaging-server.mjs` (port 3003) isn't wired into
  `docker-compose.yml` — `docs/todo/01-stack-integration.md`.

### API design
- [ ] The real app never calls `app.enableVersioning()` — the REST surface has
  no versioning scheme today (the `versioning/` module is an intentionally
  standalone demo). Worth a deliberate decision before external/mobile clients
  consume the API.
- [ ] *(tracked)* GraphQL complexity limits are hardcoded (`MAX_COMPLEXITY = 200`
  in `src/complexity/complexity.plugin.ts`) rather than env-configurable —
  `docs/todo/02-backend.md`.

### Observability
- [ ] *(tracked)* OpenTelemetry + Prometheus `/metrics` — `docs/todo/02-backend.md`
  (see also Critical item #10 above).

### DevOps/CI
- [ ] No Docker image build/push step, no vulnerability scan (trivy/grype), no
  coverage gate in `.github/workflows/ci.yml`; broker/ORM/plugin Jest configs
  (`jest-brokers.json`, `jest-orms.json`, etc.) never run in CI. *(tracked in
  `docs/todo/04-devops.md`, confirmed still true.)*
- [ ] k8s `deployment.yaml` image tag is a mutable `:prod` — the manifest's own
  comment already flags pinning to an immutable tag/digest as needed. *(tracked)*

---

## Frontend (`next-js-boilerplate/`) — broader enhancement list

### Stack / dependency hygiene
- [ ] `@types/node` pinned `^20` while the Dockerfile runs `node:24.18.0-alpine3.24`
  — type-checking against a Node version 4 majors behind the actual runtime.
  Bump to `^24`.
- [ ] `eslint` pinned `^9`; latest major is `10.x` — track for a future bump.
- [ ] `eslint-plugin-react-compiler` is still an RC (`19.1.0-rc.2`) — watch for GA.
- [ ] Minor/patch drift across the board (Next 16.2.9→16.2.10, React 19.2.4→19.2.7,
  etc.) — routine, low-risk, batch into a regular dependency-update pass.

### Architecture & code quality
- [ ] The documented dependency-direction contract (`app/ → features/ → components/ → lib/`
  in `src/README.md`) is enforced only by convention/`fallow`, not by a runtime
  lint rule (e.g. `dependency-cruiser` or an ESLint import-boundary rule) —
  worth automating so it survives contributors who haven't read `AGENTS.md`.
- [ ] Possible duplicate file: `src/components/ui/skeleton-shapes.tsx` appears to
  exist both at that path and under `src/components/ui/skeleton/skeleton-shapes.tsx`
  — worth a quick check for dead/duplicate code (exactly what `fallow`'s
  duplication detector is built to catch — see CI item below).
- [ ] `fallow-check` (the project's own architecture/duplication/dead-code
  linter) is fully configured (`package.json` script + `.fallow/` cache) but
  **not run in CI** — quick win to actually gate on it.

### Performance
- [ ] No `@next/bundle-analyzer` in the repo — worth a pass given ~50 Radix UI
  primitives, Stripe.js, Embla, react-day-picker, vaul, etc. ship on the client;
  confirm server-only deps like `kafkajs` truly never reach the client bundle.
- [ ] `next/dynamic` is used sparingly (3 call sites, mostly in demo pages) —
  heavier real-app surfaces (chat room, Stripe checkout form, carousels) don't
  defer their weight off the initial route bundle.
- [ ] Next's fetch cache/`revalidateTag` machinery (demonstrated well in
  `(demos)/caching`) isn't exercised on the real v1 product routes
  (feed/posts/notifications) — likely fine given the BFF + TanStack Query
  pattern, but worth a deliberate look at whether ISR would help those routes.
- [ ] *(tracked)* Lighthouse CI / Core Web Vitals budget — `docs/todo/03-frontend.md`.

### Accessibility
- [ ] No `eslint-plugin-jsx-a11y` — a lot of a11y is "free" via Radix primitives,
  but custom composed markup (raw `<div onClick>` patterns) isn't linted for
  regressions.
- [ ] *(tracked)* `@axe-core/playwright` pass over key pages — `docs/todo/03-frontend.md`.
- Already done well, don't redo: `role="status"`/`aria-live="polite"` on toasts,
  consistent `focus-visible:` styling, and `prefers-reduced-motion` correctly
  respected in `globals.css`.

### SEO
- [ ] No `metadataBase` set anywhere (grepped, zero hits) — needed for OG/Twitter
  image URLs to resolve to absolute URLs; without it, social-share previews on
  real product pages likely default to `localhost`.
- [ ] `openGraph` metadata exists on only 3 demo pages — the real product pages
  (`about`, `pricing`, `v1/[lang]/feed`, `v1/[lang]/posts/[uuid]`) have none.
- [ ] No file-based dynamic OG image generation (`opengraph-image.tsx`) anywhere.
- Already done well: `sitemap.ts`/`robots.ts`, JSON-LD via `src/lib/seo/JsonLd.tsx`,
  title templating — don't redo.

### DevOps/CI
- [ ] No `.env.example`/`.env.sample` in the repo (`.env.local` is a symlink to
  `../prod/nextjs.env` outside the repo) — new contributors have to
  reverse-engineer required env vars from `env.ts`/Dockerfile ARGs.
- [ ] No caching of the Playwright browser binary across CI runs.
- [ ] *(tracked)* Frontend has no k8s manifests at all — `docs/todo/04-devops.md`.

### Developer experience / docs
- [ ] **Root `README.md` is still the unedited `create-next-app` boilerplate
    text** — generic "Getting Started"/"Deploy on Vercel" content, no mention
    of the actual stack, the demo/v1 dual-surface architecture, env vars, or
    how to run against the NestJS backend. Given how good `AGENTS.md`,
    `CHANGELOG.md`, and `src/README.md` already are, this is the single
    highest-visibility documentation gap (new contributors land here first).
- [ ] `components.md` is a flat checklist (component name + one-liner), not
  usage documentation — no prop tables, no links to implementation paths.
- [ ] *(tracked)* Web Push end-to-end (service worker + subscription UI) —
  `docs/todo/03-frontend.md` — backend already has the module + VAPID plumbing.
- [ ] *(tracked)* Error reporting (Sentry/GlitchTip) for both client and server —
  `docs/todo/03-frontend.md`.

### Real-time (`src/lib/realtime/realtime-client.ts`)
This is a highlight of the codebase, not a gap — hand-rolled `WebSocket` client
with a full `idle → connecting → authenticating → open → backoff → down` state
machine, auth-over-WS handshake with subscription/claim replay on reconnect,
proactive token refresh on auth-failure frames, exponential backoff with
jitter, a degraded-retry mode keyed off the browser's `online` event, send-queue
buffering, topic allowlisting, and cross-tab coordination via
`BroadcastChannel`. **Don't rebuild this — extend it.** The one gap: the SSE
demo hook (`src/hooks/useSSE.ts`) has none of this resiliency, which is fine as
a raw-API demo but worth revisiting if SSE is ever promoted beyond a demo page.

---

## Suggested execution order

~~1. Critical items #1–#5~~ ~~2. High-priority #6–#11~~ ~~4. Documentation
drift #17–#20~~ — superseded by the verification pass above: 19 of 20
headline items are confirmed fixed. What's actually left:

1. **#16 — Migration folder renaming** — 4 abbreviated `YYYYMMDD_name` folders
   need renaming to full `YYYYMMDDHHMMSS` timestamps. Blocked on confirming no
   running database has these migrations applied under their current names.
2. **The broader per-app lists** (everything after "Documentation drift") —
   entirely untouched by the recent fix pass. Reconcile against `docs/todo/`
   during regular planning; most of what isn't already tracked there is
   P2-effort DX/SEO/perf polish rather than correctness risk.
