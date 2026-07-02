# Phase 2 — Redis auth management (layered tokens + RBAC)

> Execution tracker for the second phase of the [stack roadmap](../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-02 · Status: **not started**

Re-scope note (2026-07-02): phase 2 was queued as the cross-stack e2e suite; Berkay
re-prioritized to Redis-backed auth so session/token management adds **zero Postgres
load** on the request hot path. The e2e suite moves to phase 3 and gains coverage for
the flows built here. This phase implements the "Layered tokens + RBAC in Redis" item
from [todo/02-backend.md](../todo/02-backend.md).

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

- [ ] **1. Shared `RedisModule`** (`src/redis/`)
  - [ ] Global module providing one ioredis client from `REDIS_HOST`/`REDIS_PORT`
    (compose already injects these; ioredis already a dep via BullMQ)
  - [ ] Health indicator wired into the existing `/health` terminus checks
  - [ ] Verify: `/health` reports redis up; stop redis container → health degrades
- [ ] **2. Prisma: subscription tier**
  - [ ] `enum SubscriptionTier { FREE BASIC MEDIUM PREMIUM }`;
    `User.subscriptionTier SubscriptionTier @default(FREE)` + `@@index`
  - [ ] Migration created and applied by the compose `migrate` one-shot
  - [ ] Verify: fresh stack boots, existing users default to `FREE`
- [ ] **3. `TokenStoreService`** (`src/auth/token-store.service.ts`)
  - [ ] Key builder (sha256 each token, assemble `sess:` key) + write (HSET + EXPIRE +
    SADD reverse index, atomic via MULTI), read (HGETALL), revoke-one, revoke-all-for-user,
    rewrite-tier-for-user (SSCAN reverse index → HSET tier)
  - [ ] Reverse-index hygiene: SREM on revoke; skip dead keys on scan (entries whose
    HASH already TTL-expired)
  - [ ] Verify: unit tests — write→read round-trip, revoke→miss, tier rewrite visible,
    expired member skipped
- [ ] **4. Token issuance wiring** (`auth.service.ts`, `auth.types.ts`, cookie helper)
  - [ ] Mint `rbacToken` in `issueTokens`; new `rbac-cookie.ts` (name/options mirroring
    `access-cookie.ts`); `AuthPayload.rbacToken` field
  - [ ] `issueTokens` writes the Redis entry (after the Session row commits);
    `refresh` revokes the presented compound key before reissuing;
    `logout` revokes key + reverse-index entry alongside the Session delete
  - [ ] Verify: login via GraphQL → exactly one `sess:*` key in redis-cli, TTL ≈ 900;
    refresh → old key gone, new key present; logout → no keys for the user
- [ ] **5. `SessionAuthGuard`** (replaces `JwtAuthGuard` at auth'd usage sites)
  - [ ] Order: JWT signature/exp check (no I/O) → build compound key from the three
    presented tokens → HGETALL → `payload.sub === hash.userId` sanity → attach
    `req.user = { userId, email, role, tier }`
  - [ ] Token extraction: Bearer/cookie for access (existing), cookie-then-header for
    rbac + device
  - [ ] IP policy per design (WARN default, `AUTH_IP_STRICT=true` rejects)
  - [ ] Fail closed on Redis errors (503); keep `JwtAuthGuard` exported for the
    standalone demo modules that don't model sessions
  - [ ] Verify: unit tests — happy path; tamper any one of the three tokens → 401;
    DEL the key → 401; redis down → 503. Stack: guarded `me` query produces **no
    Prisma query** (checked via query log) after login
- [ ] **6. Tier RBAC** (`src/authorization/`)
  - [ ] `@MinTier(tier)` decorator + `TierGuard` (ordered comparison over the enum),
    run after `SessionAuthGuard`
  - [ ] Admin mutation `setUserTier(userId, tier)` (`@Roles(ADMIN, SUPERADMIN)`) —
    updates Postgres **and** rewrites live sessions via the reverse index
  - [ ] A demo gated resolver (e.g. `premiumStats`) proving the gate end-to-end
  - [ ] Verify: FREE user → 403 on `@MinTier(BASIC)`; `setUserTier(BASIC)` → same
    session passes on the next request without re-login
- [ ] **7. Frontend BFF plumbing** (`next-js-boilerplate`)
  - [ ] `rbacToken` cookie option in `src/lib/cookie.ts`; set it in the login /
    register / refresh / oauth-callback routes (BFF sets cookies from the GraphQL
    body — Set-Cookie is stripped on server-to-server fetch); clear on logout
  - [ ] Confirm the `/api/proxy/[...path]` route forwards the new cookie to the backend
  - [ ] Verify: browser login via the UI → three httpOnly cookies present; guarded
    page loads; after `redis-cli DEL` of the session key the next request 401s and
    the refresh flow recovers
- [ ] **8. Docs + env**
  - [ ] `.env.example` + root README: `AUTH_IP_STRICT` (and note `JWT_ACCESS_TTL`
    drives the Redis TTL)
  - [ ] Check the "Layered tokens + RBAC in Redis" box in
    [todo/02-backend.md](../todo/02-backend.md) pointing here
  - [ ] Auth flow doc: token triple, compound key layout, revocation + tier-change
    semantics (where the current auth README/design guide lives)

Stretch (not blocking DoD): `messaging-ws` validates only the JWT today — give it the
same Redis lookup so revocation also kills live chat sessions (needs `REDIS_URL` env in
its compose service).

## Definition of done / verify

- [ ] `docker compose --profile all up -d --build` from clean volumes → all healthy
  (including the new migration via `migrate`)
- [ ] Full loop against the running stack: register → login → `sess:*` key with
  TTL ≈ `JWT_ACCESS_TTL` → guarded query OK with zero Prisma queries on the hot path →
  `redis-cli DEL <key>` → immediate 401 → refresh recovers → logout removes key +
  reverse-index entry
- [ ] Tier loop: FREE user 403s on the gated resolver; admin `setUserTier` upgrade
  takes effect on the same session's next request; downgrade likewise
- [ ] Tampering any one of accessToken / rbacToken / deviceToken → 401 (compound key
  mismatch)
- [ ] Backend unit tests green (`pnpm test` in `nest-js-boilerplate`), including the
  new token-store/guard/tier suites
- [ ] `.env.example` still matches `docker-compose.yml` var-for-var

## Phase queue (created when reached)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1 (done) | Foundations: README, .env.example, messaging-ws, delete ws-server, doc links | [phase1.md](phase1.md) |
| **2 (this)** | Redis auth: compound-key token store, instant revocation, subscription-tier RBAC | [todo/02](../todo/02-backend.md) |
| 3 | Cross-stack e2e: `STACK=1` Playwright project (auth round-trip, refresh, revocation, tier gates, SSR/CSR cookies, WS, messaging) | [todo/01](../todo/01-stack-integration.md) |
| 4 | Root CI: path-filtered app checks + compose smoke job + stack e2e | [todo/01](../todo/01-stack-integration.md) |
| 5 | Backend warts: negative-timer warning, duplicate `CreateCatDto`, Kafka first-boot race | [todo/02](../todo/02-backend.md) |
| 6 | Compose hardening (healthchecks, pins, log rotation) + frontend k8s manifests | [todo/04](../todo/04-devops.md) |
| 7 | Backlog: backend OTel/metrics, Web Push e2e, social auth, seed, publishing, backups | [todo/02](../todo/02-backend.md)–[05](../todo/05-docs-maintenance.md) |
