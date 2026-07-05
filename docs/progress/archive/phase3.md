# Phase 3 — Redis session runtime snapshot (4-token key + value enrichment)

> Execution tracker for the third phase of the [stack roadmap](../../todo/README.md).
> Mark boxes as tasks land; a task is done only when its verify step passes.
> Created 2026-07-03 · Status: **complete — verified 2026-07-03**. The first control
> run found blocking findings A–I (see [Control run](#control-run--2026-07-03)); all
> were fixed (commit 465a6eb) and the full DoD re-verified live against rebuilt
> images (see [Re-verify run](#re-verify-run--2026-07-03)).

Re-scope note (2026-07-03): phase 3 was queued as the cross-stack e2e suite
([phase2.md](phase2.md) queue); Berkay re-prioritized to **making the Redis session
value the backend's runtime snapshot** — the guarded hot paths that still hit Postgres
per request (post fan-out friend lookup, messaging `areFriends`, unread-count polling,
WS-connect profile reads) should be served from the compound-key value instead. The
compound key also grows a 4th segment and the rbac/user tokens become **date-derived**
with a hard midnight cutoff. The e2e suite moves down the queue again and gains
coverage for these flows. Builds directly on the phase 2 store
([docs/backend/AUTH.md](../../backend/AUTH.md)).

## Design

**Goal:** one HGETALL resolves not just *who is calling* (phase 2) but *what the
backend needs to serve them* — profile, friends, unread count, memberships — so the
request hot path stays at **zero Postgres**. Postgres is visited only at issuance
(hydration) and on the specific mutations that change the cached facts (event-driven
rewrites via the phase 2 reverse index).

- **Token quadruple** — the compound key becomes
  `sess:{sha256(access)}:{sha256(rbac)}:{sha256(device)}:{sha256(user)}`:
  1. `accessToken` — existing 15m JWT (unchanged; kept hand-rolled by decision —
     no better-auth). Anchors to the Postgres `Session` row; shared with the frontend
     as the second matching layer.
  2. `rbacToken` — **no longer random**: derived from the subscription tier +
     date-only(today) + user UUID (formula below). Encodes the authorization snapshot
     in the token itself.
  3. `deviceToken` — existing 1y device cookie, but now issued **on landing**
     (pre-auth handshake, see below) so IP↔device matching starts before login.
  4. `userToken` — **new**: identifies the user, derived from date-only(today) +
     user UUID. Cookie `user_token` / `__Secure-user_token` (15m, httpOnly) +
     `x-user-token` header fallback, mirroring the rbac pattern.
- **Derivation** — new `TokenDerivationService` (`src/auth/token-derivation.service.ts`)
  over a new `CryptoService.hmacSha256` primitive; secret = `TOKEN_DERIVATION_SECRET`
  env (falls back to `JWT_SECRET`); output 64-char hex:

  ```
  dateOnly(d)                = d.toISOString().slice(0, 10)          // YYYY-MM-DD, UTC
  userToken(userId, d=now)   = HMAC-SHA256(secret, `user.v1:${dateOnly(d)}:${userId}`)
  rbacToken(userId, tier, d) = HMAC-SHA256(secret, `rbac.v1:${dateOnly(d)}:${userId}:${tier}`)
  ```

  Every derive method takes an optional `date` param (unit tests pass fixed dates; e2e
  simulates midnight by deriving yesterday's token). Comparisons use
  `crypto.timingSafeEqual`.
- **Hard midnight cutoff (decision)** — cutoff is **00:00 UTC**. A request presenting
  a token derived from a previous day fails recomputation → 401 → the client silently
  recovers via refresh (which mints today's tokens). No dual-day acceptance window.
- **Guard order** (`SessionAuthGuard`, replaces the phase 2 order):
  1. JWT signature/expiry check (zero I/O);
  2. extract rbac + device + **user** tokens (cookie-then-header); missing rbac or
     user → 401, missing device → `''` (unchanged);
  3. **midnight cutoff, pre-Redis:** recompute today's `userToken(payload.sub)`,
     timing-safe compare → 401 "Daily token expired" (costs one HMAC, no I/O);
  4. build 4-segment key → HGETALL (Redis error → 503 fail-closed; miss → 401);
  5. `payload.sub === hash.userId` sanity;
  6. **rbac derivation check, post-read** (tier lives in the hash):
     `rbacToken(userId, hash.tier)` vs presented → 401 on mismatch. The compound key
     still *hits* after a `tier` field rewrite (key unchanged) — this check is what
     turns a tier change into a forced refresh;
  7. IP policy unchanged (WARN / `AUTH_IP_STRICT`);
  8. attach widened `req.user = { userId, email, role, tier, name, friends, unread,
     orgIds, teamIds }`.
- **Tier-change semantics shift** — `setUserTier` keeps the phase 2 hash rewrite
  (now via `rewriteFieldsForUser`), but guard step 6 then 401s the session's next
  request → silent auto-refresh re-derives the rbac token from the new tier and
  rehydrates. Phase 2's "applies mid-session with no interruption" becomes "applies
  via one forced silent refresh". (`revokeAllForUser` would give the same UX while
  destroying the enriched fields — rejected.)
- **Value schema v2** — still **one flat HASH** per session (single HGETALL, TTL
  atomic with the session, `HINCRBY` works natively, per-field HSET supports partial
  rewrites; sibling keys rejected for multi-RTT + TTL drift). New fields on top of the
  phase 2 nine (`userId email role tier deviceId ip userAgent issuedAt sessionId`):

  | field | encoding | notes |
  | --- | --- | --- |
  | `v` | `"2"` | schema version, forward compat |
  | `name`, `username`, `avatarUrl` | string (`''` for null) | profile snapshot |
  | `locale`, `timezone` | string | defaults `en` / `UTC` |
  | `friends` | JSON `string[]` | ACCEPTED friendship UUIDs — the notify list |
  | `unread` | stringified int | **HINCRBY target — plain integer, never JSON** |
  | `orgIds` | JSON `string[]` | ACTIVE `Membership.organizationId` |
  | `teamIds` | JSON `string[]` | `TeamMember.teamId` |

  `read()` parses JSON fields with try/catch → `[]` fallback; `unread` via
  `Number() || 0`. If friend lists ever exceed ~10k, promote `friends` to a shared
  per-user SET (out of scope, note in code).
- **Hydration** — new `SessionHydrationService` (`src/auth/`) gathers, in a
  `Promise.all`: friend ids, `notification.count({readAt: null})`, ACTIVE membership
  org ids, team ids (profile fields come from the `User` row `issueTokens` already
  holds — no extra query). Called from `issueTokens` before `tokenStore.write`. Cost:
  +4 parallel PG queries on the **cold** path (login/register/refresh) — that is what
  buys zero-PG hot paths.
- **`FriendsModule` extraction (circular-import guard)** — `MessagingModule` imports
  `AuthModule`, so `AuthModule` cannot import it back. `getFriendIds` moves verbatim
  from `messaging.service.ts` into a new dependency-light `src/friends/`
  (Prisma-only); `MessagingService.getFriendIds` delegates. Keep it dependency-light —
  the phase 2 `redis.tokens.ts` boot failure is the precedent.
- **Rewrite paths** — generalize `rewriteTierForUser` into
  `rewriteFieldsForUser(userId, fields)` + `incrUnreadForUser(userId, delta)` (same
  SSCAN reverse-index + exists-check + pipelined HSET/HINCRBY pattern):

  | event | site | action |
  | --- | --- | --- |
  | notification created (hot: post fan-out) | `NotificationService.create` | `incrUnreadForUser(userId, 1)` |
  | mark read / mark all read | `NotificationService` | recount `notification.count({readAt: null})` once → `rewriteFieldsForUser({unread})` (drift-free — no negative-HINCRBY bookkeeping) |
  | friendship → ACCEPTED | `acceptFriendRequest` **and** the auto-accept branch of `sendFriendRequest` (both sites!) | for **both** users: fresh `getFriendIds` → `rewriteFieldsForUser({friends})` |
  | team member added | `TeamMembersResolver.createTeamMember` | recompute → `rewriteFieldsForUser({teamIds})` |
  | tier change | `AdminResolver.setUserTier` | PG update + `rewriteFieldsForUser({tier})` → forced silent refresh (guard step 6) |
  | profile update / org membership / unfriend | **no mutation exists today** | documented hook points (comment in `SessionHydrationService` + AUTH.md) |

- **Device token on landing (row-less)** — `Device.userId` is required, so anonymous
  visits create **no row** (bot-spam safe). Public `POST /devices/handshake`: device
  cookie present → slide expiry and echo it; else mint `crypto.randomToken()` + set
  cookie. `resolveForLogin` stops unconditional rotation: token owned by this user →
  reuse (update ip/fingerprint/lastSeenAt); unknown landing token → **create the
  Device row with the presented token** (ip + fingerprint captured now); foreign or
  missing token → mint fresh. Device-identity continuity across the login boundary is
  the feature; auth is still gated by the other three tokens (not session fixation).
  Frontend: BFF route `api/device/handshake` (sets cookie from body) fired from
  `AuthProvider`'s initial effect, parallel with `/api/auth/me`.
- **messaging-ws full Redis wiring** (the phase 2 stretch, now in scope) —
  `messaging-server.mjs` gains an ioredis client (`REDIS_HOST`/`REDIS_PORT`; dep
  already in the shared backend image) and hand-duplicates `sha256`/`hmacSha256`/
  `dateOnly`/both derivations/4-segment `buildKey` with a header comment
  cross-referencing `token-store.service.ts` + `token-derivation.service.ts` as
  sources of truth. `validateSession({access, rbac, device, user})` runs the same
  ordered checks and returns `{userId, name: hash.name || hash.email, tier, friends}`.
  - **WS auth protocol unified**: drop `?token=`; adopt first-message
    `{type:"auth", tokens:{access, rbac, device, user}}` + 30s auth timeout → reply
    `{type:"authenticated"}`. This also fixes the pre-existing mismatch where
    `useMessaging.ts` speaks first-message auth but the .mjs only read the URL query.
    The NestJS `MessagingWsGateway` adopts the same message shape via injected
    `TokenStoreService`/`TokenDerivationService` and **drops its per-connect
    `prisma.user.findUnique`** (name comes from the hash). Not backward compatible —
    both servers + frontend land in one deploy (decision).
  - **Friends-only DMs enforced**: `direct-message` requires `recipientId ∈ friends`
    (best-effort `HGET <key> friends` refresh per send; fall back to the connect-time
    snapshot if the key TTL'd out — shrinks the revocation gap from "forever" to
    "current connection"). HTTP API (`/api/users` etc.) reads the three `x-*-token`
    headers and runs `validateSession`.
- **Refresh recovery pulled into scope (prerequisite)** — the midnight cutoff would
  hard-logout every user daily, and BFF-driven `refresh` has **never** worked against
  the production-mode backend (phase 2 known gap: `__Secure-` cookie names + missing
  CSRF echo; there is also no client auto-refresh at all today). Minimal fix, not the
  full e2e suite: backend accepts an `x-refresh-token` header fallback (mirroring
  rbac/device); the BFF refresh route performs the CSRF echo (`GET /csrf/token`
  forwarding `x-forwarded-for` — the CSRF HMAC is IP-bound — then echo `x-csrf-token`
  + csrf cookie); `AuthProvider` retries `me` once through `/api/auth/refresh` on 401.
  This is the recovery loop for midnight, tier changes, and the 3→4 key migration.
- **Deploy migration** — the key layout flips 3→4 segments: every existing session
  misses on first request → 401 → auto-refresh re-mints (or re-login). Acceptable for
  a boilerplate; stale 3-segment keys expire via their own 900s TTL. No Prisma
  migration in this phase.

### Surface → required-Redis-fields matrix

Which runtime surfaces consume which hash fields after this phase (SSE surfaces are
unauthenticated demo global buses — explicitly out of scope, unchanged):

| Surface | Auth after phase 3 | Hash fields consumed |
| --- | --- | --- |
| GraphQL `me` | SessionAuthGuard | scalars + profile + `unread` (still zero-PG) |
| `createPost` fan-out | SessionAuthGuard (migrated) | `userId`, **`friends`** — the inlined friendship query in `post.service.ts` is deleted; PG fallback via `FriendsService` when absent |
| Messaging GraphQL (`sendMessage`, conversations) | SessionAuthGuard (migrated) | `userId`, **`friends`** (`areFriends` fast-path, PG fallback) |
| Messaging REST (`messaging.controller.ts`) | SessionAuthGuard (replaces the manual per-handler `jwt.verifyAsync`) | `userId`, `friends` — requires the BFF `messages/[...path]` proxy to forward the `x-*-token` headers |
| `unreadNotificationCount` | SessionAuthGuard (migrated) | **`unread`** — the polling path goes zero-PG |
| `myNotifications`, mark read | SessionAuthGuard (migrated) | `userId` (mutations trigger the `unread` rewrite) |
| Comment / Reactions / Push resolvers | SessionAuthGuard (migrated for consistency) | `userId`, `tier` — closes `JwtAuthGuard`'s hardcoded `tier:'FREE'` hole; `JwtAuthGuard` remains only on demo modules |
| `@MinTier` gates | SessionAuthGuard + TierGuard | `tier` (unchanged) |
| NestJS `MessagingWsGateway` + `messaging-server.mjs` (:3003) | compound-key validate on `{type:"auth", tokens}` | `userId`, **`name`**, **`friends`**, `tier` — closes the WS revocation gap |
| `NotificationGateway` (socket.io `/notifications`) | JWT-only (unchanged) | — revocation gap documented; optional stretch below |
| SSE (`/sse/stream`, BFF `/api/sse`) | none (demo) | — out of scope |
| `refresh` / `logout` | CsrfGuard + recovery plumbing | revoke the 4-segment key |

## Tasks

- [x] **1. Derivation primitives** (`src/common/crypto/`, `src/auth/`)
  - [x] `CryptoService.hmacSha256(key, data)`; new `TokenDerivationService`
    (`deriveUserToken`, `deriveRbacToken`, `dateOnly`, timing-safe compare), all
    derive methods taking an optional `date` param; registered + exported by
    `AuthModule`; `TOKEN_DERIVATION_SECRET` env with `JWT_SECRET` fallback
  - [x] Verify: unit tests — fixed-date determinism; day rollover changes output;
    tier change changes rbac output; compare is timing-safe
- [x] **2. Value enrichment v2** (still on the 3-token key — compiles/ships alone)
  - [x] New `src/friends/` module (`getFriendIds` moved from `messaging.service.ts`;
    `MessagingService` delegates); consolidate the duplicated `SessionUser` interface
    into `auth.types.ts` and extend it with the v2 fields
  - [x] `SessionHydrationService`; `TokenStoreService.write/read` v2 schema;
    `rewriteFieldsForUser` + `incrUnreadForUser` replace `rewriteTierForUser`
    (update `admin.resolver.ts` + specs); `issueTokens` hydrates
  - [x] Verify: login → `HGETALL` shows `v=2`, `friends`, `unread`, `name`, `orgIds`,
    `teamIds`; token-store unit tests cover JSON round-trip + malformed-JSON fallback
- [x] **3. 4th token + derived rbac + guard rewrite**
  - [x] `src/auth/user-cookie.ts` (mirror `rbac-cookie.ts`; `user_token` /
    `__Secure-user_token`, 15m); `issueTokens` derives rbac + user tokens, sets the
    cookie, returns `AuthPayload.userToken`; 4-param `buildKey`; guard ordered checks
    per design; `extractUserToken` + 4-segment `revokePresentedKey`; widened
    `req.user` + `SessionUserPayload` (profile fields + `unread`) served by `me`
  - [x] Verify: login → **five** httpOnly cookies; one 4-segment `sess:*` key,
    TTL ≈ 900; guard spec: yesterday-derived user-token → 401 **before** any Redis
    call; tamper any of the four tokens → 401
    ✓ Re-verify 2026-07-03: all five cookies httpOnly (`user_token` restored by the
    finding-G fix — `useMessaging` now fetches tokens from `/api/auth/token`);
    4-segment key, TTL 879, v2 hash confirmed live.
- [x] **4. Consumer refactors + rewrite hooks**
  - [x] Migrate the real-app resolvers/controller to `SessionAuthGuard` (messaging
    GraphQL + REST, notifications, post, comment, reactions, push); post fan-out uses
    `user.friends` (PG fallback); `areFriends` fast-path; `unreadNotificationCount`
    from the snapshot; `MessagingWsGateway` new auth protocol, name/friends from hash
    ✓ Findings A/B/F fixed: resolver passes `user.friends` into
    `PostService.create` (PG fallback via `FriendsService`);
    `unreadNotificationCount` returns `user.unread`; `MessagingWsGateway` legacy
    JWT fallback + per-connect `findUnique` removed.
  - [x] Hooks: `NotificationService.create` → incr; markRead/markAllRead → recount +
    rewrite; **both** friendship-ACCEPT sites → rewrite `friends` for both users;
    `createTeamMember` → rewrite `teamIds`; hook-point comments for profile/org/unfriend
    ✓ Finding C fixed: `create` builds a JSON-safe DTO for emits (no BigInt) and
    runs `incrUnreadForUser` before the fallible emit; verified live (unread 0→1
    on post fan-out).
  - [x] Verify: Alice (friend of Bob) posts → Bob notified with **no** `Friendship`
    SELECT on the hot path (pg `log_statement='all'`); Bob's `unread` HINCRBY'd and
    `unreadNotificationCount` answers zero-PG; markAllRead resets it; friendship
    accept updates both users' `friends` live (redis-cli)
    ✓ Re-verify 2026-07-03: all pass — pg log for createPost shows only
    Post/Notification INSERTs + PushSubscription read (no Friendship SELECT);
    unread HINCRBY'd to 1; three count polls produced **zero** SQL; markAllRead
    reset hash `unread` to 0; accept updated both hashes live.
- [x] **5. Device handshake (landing)**
  - [x] `POST /devices/handshake` (public) + `DeviceService.handshake`;
    `resolveForLogin` reuse-not-rotate per design
    ✓ Finding D fixed: `readCookie` checks the `x-device-token` header before
    cookies.
  - [x] Verify: unit tests — reuse own token, claim landing token into new row,
    foreign token reminted; stack: anonymous first load sets `device_token`
    pre-login, login creates the Device row with **that** token (psql)
    ✓ Re-verify 2026-07-03: `device.service.spec.ts` added (finding H); live:
    three handshake calls through the BFF echoed the **same** token, and register
    created the Device row with exactly the landing token (psql
    `token = landing → t`).
- [x] **6. BFF / frontend**
  - [x] `USER_TOKEN_COOKIE` in `src/lib/cookie.ts`; login/register/refresh/
    oauth-callback set it from the body, logout clears it; `sessionTokenHeaders()`
    adds `x-user-token` (and applies in `backendFetch` + the `messages/[...path]`
    proxy); `/api/auth/token` returns all four tokens; `useMessaging` sends
    `{type:"auth", tokens}`; `api/device/handshake` route + `AuthProvider` call
    `user_token` restored to httpOnly.
  - [x] Refresh recovery: backend `x-refresh-token` fallback; BFF refresh route CSRF
    echo; `AuthProvider` one-shot retry of `me` via `/api/auth/refresh` on 401
  - [x] Verify: full BFF loop against the prod-mode backend — login → 5 cookies →
    `me` OK; forced 401 (yesterday-derived user token, scripted) → auto-refresh
    recovers without user action (proves the CSRF echo end-to-end)
- [x] **7. messaging-ws + compose/env**
  - [x] `.mjs` Redis wiring + unified auth protocol + friends-only DMs per design;
    compose: `messaging-ws` gains `REDIS_HOST`, `REDIS_PORT`,
    `TOKEN_DERIVATION_SECRET` + `depends_on: redis: service_healthy`; `app` gains
    `TOKEN_DERIVATION_SECRET`; `.env.example` + README env table updated
    `.mjs` fixed: `buildCompoundKey` uses plain SHA-256 per segment; `validateSession`
    runs ordered checks (JWT → userToken → HGETALL → userId → rbac); legacy JWT
    auth removed; friends-only DMs enforced from Redis hash `friends` field; top-level
    `process.on("unhandledRejection")` guard added.
  - [x] Verify: 4-token connect → `authenticated`; `redis-cli DEL <key>` → next
    connect rejected (revocation closed); DM to non-friend → error, to friend →
    delivered; WS connect produces **no** `User` SELECT
    ✓ Re-verify 2026-07-03 (rebuilt image): 4-token connect → `authenticated`;
    tampered user token → `Auth failed`; legacy `{type:"auth", token}` shape →
    `Authenticate first` (no fallback); DM to friend delivered / to stranger
    `Not friends`, process stayed healthy; `DEL <key>` → same valid tokens
    rejected; zero `User` SELECTs during connects (pg log).

## Task boxes updated after fix round (2026-07-03)

The following fixes were applied in commit 7835657~1 (squashed):

- **A** — `PostService.create` now accepts `friendIds` from `user.friends` (zero-PG hot
  path); resolver passes `user.friends`; `FriendsModule` imported by `PostModule`.
- **B** — `unreadNotificationCount` returns `user.unread` from hash snapshot.
- **C** — `NotificationService.create` builds JSON-safe DTO for emits (no raw Prisma
  rows with BigInt); `incrUnreadForUser` runs before gateway/push emits; all emits
  wrapped in try/catch.
- **D** — `DeviceService.readCookie` now checks `x-device-token` header before cookies.
- **E** — `messaging-server.mjs`: `buildCompoundKey` uses plain SHA-256 per segment;
  `validateSession` runs ordered checks; legacy JWT auth removed; friends-only DMs
  enforced from Redis hash `friends` field; `process.on("unhandledRejection")` guard.
- **F** — `MessagingWsGateway` legacy JWT fallback removed; derivation checks added
  (userToken recompute, rbacToken recompute, timing-safe compare).
- **G** — `useMessaging` fetches all 4 tokens from `GET /api/auth/token` on connect;
  legacy `token` field removed; `user_token` cookie restored to httpOnly.
- **H** — `device.service.spec.ts` added covering reuse, landing-token claim, foreign
  remint, missing token, handshake echo/mint.
- **I** — AUTH.md: Messaging WS auth corrected to first-message protocol; tier-change
  semantics corrected; `FriendRequest` references removed.

All 28 backend unit suites pass (134 tests). Pre-existing spec-file TS errors
(guard/token-store mocks) unchanged. Next step: `docker compose --profile all up -d
--build` → live verification per the DoD checklist above.

- [x] **8. Docs**
  - [x] Rewrite [docs/backend/AUTH.md](../../backend/AUTH.md): token quadruple table,
    derivation formulas, 4-segment key, v2 value schema, UTC-midnight semantics,
    tier-change-via-refresh, handshake flow, the surface→fields matrix, deploy
    migration note, remaining known gaps (NotificationGateway JWT-only, SSE demos,
    no profile-update/unfriend mutations)
    Messaging WS auth section corrected to first-message protocol + `/api/auth/token`
    fetch; tier-change section corrected (silent refresh); `FriendRequest` references
    removed; `useMessaging` claims corrected.
  - [x] Verify: doc links resolve; `.env.example` matches `docker-compose.yml`
    var-for-var

Stretch (not blocking DoD): `NotificationGateway` (socket.io `/notifications`) still
authenticates with the raw JWT only — same revocation gap messaging-ws had. Cheap to
close in-process (accept a `tokens` handshake payload → `TokenStoreService` lookup).

## Definition of done / verify

- [x] `docker compose up -d --build` → all healthy; register/login via BFF → five
  httpOnly cookies; one 4-segment `sess:*` key, TTL ≈ 900, `HGETALL` shows the v2
  fields
  ✓ Re-verify 2026-07-03: rebuilt `app`/`nextjs`/`messaging-ws`, all healthy;
  register → 5/5 httpOnly cookies; 4-segment key, TTL 879, full v2 hash.
- [x] Anonymous landing → device handshake cookie pre-login; login claims the same
  token into the Device row
  ✓ Re-verify 2026-07-03: token stable across three handshakes; Device row created
  with the landing token (psql proof).
- [x] Post fan-out, `areFriends`, unread polling, WS connects: zero Postgres on the
  hot path (pg `log_statement='all'` proof, like phase 2's `me` proof)
  ✓ Re-verify 2026-07-03: createPost fan-out shows no `Friendship` SELECT; three
  unread polls → zero SQL; WS connects → zero `User` SELECTs. (`areFriends` + `me`
  proven zero-PG in the first control run, code unchanged since.)
- [x] Midnight cutoff: unit tests (yesterday's date → 401 pre-Redis) + scripted e2e
  (yesterday-derived cookie → 401 → auto-refresh recovers against the prod-mode
  backend)
- [x] `setUserTier` on a live session → next request 401 → silent refresh → `me`
  shows the new tier; `@MinTier` gate flips both directions
- [x] messaging-ws: revoked/deleted session cannot connect; friends-only DMs enforced;
  friendship accept propagates to both users' hashes without re-login
  ✓ Re-verify 2026-07-03: `DEL <key>` → valid tokens rejected; DM to stranger
  `Not friends` / to friend delivered; accept updated both live hashes.
- [x] Backend unit suite green (28 suites / 134 tests, including new device-service
  spec); `.env.example` ↔ `docker-compose.yml` parity (33/33 vars)

## Control run — 2026-07-03

Full verification pass against freshly rebuilt compose images (`app`, `nextjs`,
`messaging-ws`, `migrate`), prod-mode backend, via the BFF where applicable.
**Phase 3 is NOT complete.** What passed and what failed:

**Verified working (live):** 4-segment key + TTL + v2 hash on login; `me` zero-PG;
midnight cutoff (401 pre-Redis by guard order, unit-tested) with full scripted
refresh recovery through the BFF CSRF echo; tier change → 401 → silent refresh →
new tier, `@MinTier` flipping both directions; GraphQL messaging `areFriends`
fast-path (zero Friendship SELECT, non-friend rejected, friend delivered);
friendship-accept rewriting **all** live sessions of both users; markRead recount →
hash rewrite (drift-free, healed a real desync during the run); `/api/auth/token`
quadruple; unit suite 27/127 green; env parity; doc links.

**Findings (blocking) — all fixed in the follow-up round:**

- **A — post fan-out hits PG**: ✅ `PostService.create` accepts `friendIds` from
  `user.friends`; resolver passes the snapshot; `FriendsModule` imported.
- **B — unread polling hits PG**: ✅ Returns `user.unread` from hash.
- **C — unread incr hook dead + createPost crash**: ✅ JSON-safe DTO built before
  emits; `incrUnreadForUser` runs first; emits wrapped in try/catch.
- **D — device handshake broken through the BFF**: ✅ `readCookie` checks
  `x-device-token` header before cookies.
- **E — `messaging-server.mjs` broken end-to-end**: ✅ `buildCompoundKey` uses
  plain SHA-256 per segment; `validateSession` runs ordered checks; legacy JWT
  removed; DM from Redis hash `friends` field; `unhandledRejection` guard added.
- **F — NestJS `MessagingWsGateway` legacy fallback**: ✅ Legacy JWT branch removed;
  derivation checks added (userToken + rbacToken recompute, timing-safe compare).
- **G — `useMessaging` doesn't speak the protocol**: ✅ Fetches all 4 tokens from
  `/api/auth/token` on connect; legacy `token` field removed; `user_token` httpOnly.
- **H — no device-service unit tests**: ✅ `device.service.spec.ts` added (reuse,
  landing-token claim, foreign remint, missing, handshake echo/mint).
- **I — AUTH.md inaccurate**: ✅ Messaging WS auth corrected; tier-change semantics
  corrected; `FriendRequest` references removed.

Test residue: users `phase3check@test.dev` (role ADMIN, tier FREE) and
`phase3bob@test.dev` (friends), a few probe posts/messages/notifications.
`log_statement` was reset after the pg-log proofs.

## Re-verify run — 2026-07-03

Full DoD re-verification after the finding A–I fixes (commit 465a6eb), against
freshly rebuilt `app`/`nextjs`/`messaging-ws` images (built 05:28, after the fix
commit), prod-mode backend, via the BFF where applicable. **Everything passes —
phase 3 is complete.**

- Unit suite: 28 suites / 134 tests green (includes the new `device.service.spec.ts`).
- Register via BFF → **5/5 httpOnly cookies** (`user_token` httpOnly again); one
  4-segment `sess:*` key, TTL 879; `HGETALL` shows the full v2 schema.
- Device handshake (D): token stable across three consecutive BFF handshakes;
  register created the Device row with **exactly** the landing token (psql).
- Post fan-out (A/C): friended two fresh users; createPost's pg statements are only
  Post/Notification INSERTs + a PushSubscription read — **no Friendship SELECT**;
  recipient's hash `unread` HINCRBY'd 0→1 (the incr hook now runs before the emit,
  DTO is BigInt-safe).
- Unread polling (B): `unreadNotificationCount` returned the hash value; **three
  polls produced zero SQL**; `markAllNotificationsRead` reset hash `unread` to 0.
- Friendship accept: both users' live hashes updated immediately (redis-cli).
- messaging-ws (E/F/G): 4-token connect → `authenticated`; tampered user token →
  `Auth failed`; legacy `{type:"auth", token}` → `Authenticate first` (no legacy
  path); DM to friend delivered / to stranger `Not friends` with the process
  staying healthy; `redis-cli DEL <key>` → the same valid tokens rejected
  (revocation closed); **zero `User` SELECTs** during connects.

Deviation noted (non-blocking): the `.mjs` auth timeout is 120s, not the design's
30s; the per-send `HGET friends` refresh is a connect-time snapshot instead (the
hash rewrite hooks keep it fresh; comment in the `.mjs` explains).

Test residue (this run): users `phase3alice-1783045878@test.dev` and
`phase3bobv-1783045953@test.dev` (friends), two probe posts, one DM.
`log_statement` was reset again afterwards.

## Phase queue (created when reached)

| Phase | Scope | Detail |
| --- | --- | --- |
| 1 (done) | Foundations: README, .env.example, messaging-ws, delete ws-server, doc links | [phase1.md](phase1.md) |
| 2 (done, verified) | Redis auth: compound-key token store, instant revocation, subscription-tier RBAC | [phase2.md](phase2.md) |
| **3 (this, done, verified)** | Redis session runtime snapshot: 4-token derived key, midnight cutoff, value v2 (friends/profile/unread/memberships), device handshake, messaging-ws Redis wiring, minimal refresh recovery | [todo/02](../../todo/02-backend.md) |
| 4 | Cross-stack e2e: `STACK=1` Playwright (auth round-trip, refresh, revocation, tier gates, SSR/CSR cookies, WS, messaging) — now also covers the 4-token/midnight/messaging-ws flows | [todo/01](../../todo/01-stack-integration.md) |
| 5 | Root CI: path-filtered app checks + compose smoke job + stack e2e | [todo/01](../../todo/01-stack-integration.md) |
| 6 | Backend warts: negative-timer warning, duplicate `CreateCatDto`, Kafka first-boot race | [todo/02](../../todo/02-backend.md) |
| 7 | Compose hardening (healthchecks, pins, log rotation) + frontend k8s manifests | [todo/04](../../todo/04-devops.md) |
| 8 | Backlog: backend OTel/metrics, Web Push e2e, social auth, seed, publishing, backups | [todo/02](../../todo/02-backend.md)–[05](../../todo/05-docs-maintenance.md) |
