# Phase 2 — Redis auth management (layered tokens + RBAC)

> Execution tracker for the second phase of the [stack roadmap](../../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-02 · Status: **implemented & stack-verified 2026-07-02** (three fixes
> applied during verification — see [Verification notes](#verification-notes-2026-07-02);
> one DoD residual: clean-volume boot not re-run).

Re-scope note (2026-07-02): phase 2 was queued as the cross-stack e2e suite; Berkay
re-prioritized to Redis-backed auth so session/token management adds **zero Postgres
load** on the request hot path. The e2e suite moves to phase 3 and gains coverage for
the flows built here. This phase implements the "Layered tokens + RBAC in Redis" item
from [todo/02-backend.md](../../todo/02-backend.md).

## Design

**Goal:** a guarded request never touches Postgres. One Redis lookup resolves the
caller's identity + authorization snapshot, and any session is revocable instantly
(today's JWT-only guard cannot revoke at all before expiry).

- **Compound session key** —
  `sess:{sha256(accessToken)}:{sha256(rbacToken)}:{sha256(deviceToken)}`.
  Hashes, never raw tokens: Redis contents (SCAN, monitoring, backups) must not be
  usable as bearer credentials. Value is a Redis HASH of static info captured at issue
  time: `userId`, `email`, `role`, `tier`, `deviceId`, `ip`, `userAgent`, `issuedAt`,
  `sessionId` (FK to the Postgres `Session` row). TTL = `JWT_ACCESS_TTL` (900s
  default) so entries self-expire in lockstep with the JWT — no cleanup job.
- **Three tokens per login** (the compound key's inputs):
  1. `accessToken` — existing 15m JWT (unchanged);
  2. `rbacToken` — **new** opaque random token (`crypto.randomToken()`), the
     authorization-snapshot handle; delivered as httpOnly cookie `rbac_token` /
     `__Secure-rbac_token` and returned in `AuthPayload` for API-only clients;
  3. `deviceToken` — existing 1y device cookie (unchanged).
  Non-browser clients that can't send cookies pass `x-rbac-token` / `x-device-token`
  headers as fallback (same precedence pattern as the Bearer-vs-cookie access token).
- **Reverse index** — `user:{userId}:sessions` (SET of live compound keys): enables
  logout-all, admin revocation, and in-place `tier` rewrites on subscription change
  (upgrade/downgrade applies mid-session, no re-login).
- **Subscription tiers (RBAC info)** — `SubscriptionTier` enum
  `FREE | BASIC | MEDIUM | PREMIUM` ("Free/Basic/Medium/Premium Sub") on `User`
  (default `FREE`), ordered hierarchy. The guard reads the tier from **Redis, not the
  JWT**, so a tier change is effective on the next request. Existing `UserRole`
  (USER/MODERATOR/ADMIN/SUPERADMIN) and `RolesGuard` stay as-is; tier is a second,
  orthogonal axis.
- **Failure policy** — Redis unreachable ⇒ **fail closed** (503 on guarded routes);
  compound key missing/unknown ⇒ 401 (expired or revoked). IP mismatch vs the stored
  `ip`: WARN-log by default, hard-reject only when `AUTH_IP_STRICT=true` (mobile/NAT
  IP churn makes unconditional binding a footgun).
- **Division of labor** — Postgres `Session` (30d) remains the durable refresh anchor;
  Redis holds only the short-lived access snapshot. Refresh rotates both.

## Tasks

- [x] **1. Shared `RedisModule`** (`src/redis/`)
  - [x] Global module providing one ioredis client from `REDIS_HOST`/`REDIS_PORT`
    (compose already injects these; ioredis already a dep via BullMQ)
  - [x] Health indicator wired into the existing `/health` terminus checks
  - [x] Verify: `/health/ready` reports redis up; `docker stop redis` → readiness 503
    and guarded routes 503; restart → recovers (sessions survive via AOF)
- [x] **2. Prisma: subscription tier**
  - [x] `enum SubscriptionTier { FREE BASIC MEDIUM PREMIUM }`;
    `User.subscriptionTier SubscriptionTier @default(FREE)` + `@@index`
  - [x] Migration created and applied by the compose `migrate` one-shot
    (`20260702000000_add_subscription_tier`)
  - [x] Verify: stack boots, existing users default to `FREE` (checked via psql)
- [x] **3. `TokenStoreService`** (`src/auth/token-store.service.ts`)
  - [x] Key builder (sha256 each token, assemble `sess:` key) + write (HSET + EXPIRE +
    SADD reverse index, atomic via MULTI), read (HGETALL), revoke-one, revoke-all-for-user,
    rewrite-tier-for-user (SSCAN reverse index → HSET tier)
  - [x] Reverse-index hygiene: SREM on revoke; skip dead keys on scan (entries whose
    HASH already TTL-expired)
  - [x] Verify: unit tests — write→read round-trip, revoke→miss, tier rewrite visible,
    expired member skipped
- [x] **4. Token issuance wiring** (`auth.service.ts`, `auth.types.ts`, cookie helper)
  - [x] Mint `rbacToken` in `issueTokens`; new `rbac-cookie.ts` (name/options mirroring
    `access-cookie.ts`); `AuthPayload.rbacToken` field
  - [x] `issueTokens` writes the Redis entry (after the Session row commits);
    `refresh` revokes the presented compound key before reissuing;
    `logout` revokes key + reverse-index entry alongside the Session delete
  - [x] Verify: login via GraphQL → exactly one `sess:*` key in redis-cli, TTL = 900;
    refresh → key rotated in place (count stays 1, rbac segment changes); logout →
    no keys for the user
- [x] **5. `SessionAuthGuard`** (replaces `JwtAuthGuard` at auth'd usage sites)
  - [x] Order: JWT signature/exp check (no I/O) → build compound key from the three
    presented tokens → HGETALL → `payload.sub === hash.userId` sanity → attach
    `req.user = { userId, email, role, tier }`
  - [x] Token extraction: Bearer/cookie for access (existing), cookie-then-header for
    rbac + device
  - [x] IP policy per design (WARN default, `AUTH_IP_STRICT=true` rejects)
  - [x] Fail closed on Redis errors (503); keep `JwtAuthGuard` exported for the
    standalone demo modules that don't model sessions
  - [x] Verify: unit tests — happy path; tamper any one of the three tokens → 401;
    DEL the key → 401; redis down → 503. Stack: guarded `me` query produces **no
    Postgres statement** (proven with `log_statement='all'`: 2× `me` → 0 SQL,
    login control → 13 SQL)
- [x] **6. Tier RBAC** (`src/authorization/`)
  - [x] `@MinTier(tier)` decorator + `TierGuard` (ordered comparison over the enum),
    run after `SessionAuthGuard`
  - [x] Admin mutation `setUserTier(userId, tier)` (`@Roles(ADMIN, SUPERADMIN)`) —
    updates Postgres **and** rewrites live sessions via the reverse index
  - [x] A demo gated resolver (`premiumStats`, `@MinTier(BASIC)`) proving the gate
    end-to-end
  - [x] Verify: FREE user → 403 on `@MinTier(BASIC)`; `setUserTier(BASIC)` → same
    session passes on the next request without re-login; downgrade → 403 again
- [x] **7. Frontend BFF plumbing** (`next-js-boilerplate`)
  - [x] `rbacToken` cookie option in `src/lib/cookie.ts`; set it in the login /
    register / refresh / oauth-callback routes (BFF sets cookies from the GraphQL
    body — Set-Cookie is stripped on server-to-server fetch); clear on logout
  - [x] Confirm the `/api/proxy/[...path]` route forwards the new cookie to the backend
    (forwards the whole Cookie header verbatim; `graphqlFetch` additionally sends the
    `x-rbac-token`/`x-device-token` header fallbacks — see fix 3 below)
  - [x] Verify (via BFF HTTP flow): login → four httpOnly cookies (`access_token`,
    `refresh_token`, `rbac_token`, `device_token`); `/api/auth/me` resolves the user
    from the Redis session; `redis-cli DEL` of the session key → next request comes
    back unauthenticated
  - [x] Residual → phase 3: BFF-driven `refresh`/`logout` against the production-mode
    backend has **never** worked (unprefixed cookie names + missing CSRF echo, both
    pre-existing since the initial commit). Guarded queries work via the header
    fallback; the recovery flow is deferred to the phase 3 e2e work.
    ✓ Resolved: `refresh` got its CSRF echo in phase 3 (verified via the
    midnight-recovery e2e); `logout` was still silently failing (backend 403,
    key + Session row survived — proven live 2026-07-03) and was fixed
    2026-07-03 together with the presented-key revoke on refresh (access token
    now passed as Bearer). Documented in
    [docs/backend/AUTH.md](../../backend/AUTH.md#bff-cookie-bridge).
- [x] **8. Docs + env**
  - [x] `.env.example` + root README: `AUTH_IP_STRICT` (and note `JWT_ACCESS_TTL`
    drives the Redis TTL)
  - [x] Check the "Layered tokens + RBAC in Redis" box in
    [todo/02-backend.md](../../todo/02-backend.md) pointing here
  - [x] Auth flow doc: [docs/backend/AUTH.md](../../backend/AUTH.md) — token triple,
    compound key layout, revocation + tier-change semantics (new file; linked from the
    root README and docs/backend/README.md)

Stretch (not blocking DoD): `messaging-ws` validates only the JWT today — give it the
same Redis lookup so revocation also kills live chat sessions (needs `REDIS_URL` env in
its compose service). **Not done in this phase.**

## Definition of done / verify

- [ ] `docker compose --profile all up -d --build` from clean volumes → all healthy
  (including the new migration via `migrate`). *Not re-run from clean volumes (would
  wipe dev data); the rebuilt images + new migration were verified against the live
  stack — all services healthy.*
- [x] Full loop against the running stack: register → login → `sess:*` key with
  TTL = 900 → guarded query OK with zero Postgres statements on the hot path →
  `redis-cli DEL <key>` → immediate 401 → refresh recovers → logout removes key +
  reverse-index entry
- [x] Tier loop: FREE user 403s on the gated resolver; admin `setUserTier` upgrade
  takes effect on the same session's next request; downgrade likewise
- [x] Tampering any one of accessToken / rbacToken / deviceToken → 401 (compound key
  mismatch)
- [x] Backend unit tests green (`pnpm test` in `nest-js-boilerplate`): 26 suites,
  110 tests, including the new token-store/guard/tier suites (requires
  `prisma generate` first — the tier spec imports the generated enum)
- [x] `.env.example` still matches `docker-compose.yml` var-for-var

## Verification notes (2026-07-02)

The phase landed in `fd6cd25` but was committed **unverified** (this tracker still said
"not started"). Running the verify steps against the rebuilt stack surfaced three real
bugs, fixed during verification:

1. **Boot failure — circular import in `src/redis/`.** `redis.module.ts` imported
   `RedisHealthIndicator` while `redis-health.indicator.ts` imported `REDIS_CLIENT`
   back from `redis.module.ts`, so the injection token evaluated to `undefined` at
   decorator time and Nest DI failed on startup (unit tests mock the token and never
   hit it). Fix: token moved to `src/redis/redis.tokens.ts`; `redis.module.ts`
   re-exports it.
2. **`me` query 500 — wrong GraphQL return type.** The resolver returned the Redis
   snapshot (`userId/email/role/tier`) typed as the full Prisma `User` model, so
   non-null `User.id` resolved to null. Fix: new `SessionUserPayload` ObjectType
   (`id`, `email`, `role`, `tier`) served purely from the snapshot; frontend
   `ME_QUERY` now selects exactly those fields (`name`/`status` only arrive via
   login/register's `AuthPayload.user`).
3. **BFF → backend guard failure — cookie-name mismatch.** The compose backend runs
   `NODE_ENV=production` and reads `__Secure-rbac_token`/`__Secure-device`, but the
   BFF forwards its own unprefixed cookies, so `SessionAuthGuard` rejected every BFF
   request. Fix: `graphqlFetch` now sends the designed `x-rbac-token` /
   `x-device-token` header fallbacks from the BFF cookies. (The same mismatch breaks
   BFF-driven `refresh`/`logout` — pre-existing since the initial commit, needs CSRF
   plumbing too → phase 3.)

## Phase queue (created when reached)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1 (done) | Foundations: README, .env.example, messaging-ws, delete ws-server, doc links | [phase1.md](phase1.md) |
| **2 (this, verified)** | Redis auth: compound-key token store, instant revocation, subscription-tier RBAC | [todo/02](../../todo/02-backend.md) |
| 3 | Cross-stack e2e: `STACK=1` Playwright project (auth round-trip, refresh, revocation, tier gates, SSR/CSR cookies, WS, messaging) — now also owns the BFF refresh/CSRF gap from this phase | [todo/01](../../todo/01-stack-integration.md) |
| 4 | Root CI: path-filtered app checks + compose smoke job + stack e2e | [todo/01](../../todo/01-stack-integration.md) |
| 5 | Backend warts: negative-timer warning, duplicate `CreateCatDto`, Kafka first-boot race | [todo/02](../../todo/02-backend.md) |
| 6 | Compose hardening (healthchecks, pins, log rotation) + frontend k8s manifests | [todo/04](../../todo/04-devops.md) |
| 7 | Backlog: backend OTel/metrics, Web Push e2e, social auth, seed, publishing, backups | [todo/02](../../todo/02-backend.md)–[05](../../todo/05-docs-maintenance.md) |
