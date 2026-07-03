# Auth flow — Redis-backed sessions (token quadruple + tier RBAC + device handshake)

> Implemented incrementally across phases 2–3. Goal: a guarded request never touches
> Postgres — one Redis lookup resolves identity + authorization + tier, and any session
> is revocable instantly.

## The token quadruple

Every login/register issues four tokens:

| Token | Kind | Lifetime | Delivery | JS-accessible |
|---|---|---|---|---|
| `accessToken` | JWT (HS256) | 15m (`JWT_ACCESS_TTL`) | `Authorization: Bearer` or `access_token` / `__Secure-access_token` cookie | No (httpOnly) |
| `refreshToken` | opaque (Postgres `Session.sessionToken`) | 30d | httpOnly cookie `refresh_token` / `__Secure-refresh_token`, or `x-refresh-token` header | No |
| `rbacToken` | opaque random | 15m (mirrors access) | httpOnly cookie `rbac_token` / `__Secure-rbac_token`, or `x-rbac-token` header | No (httpOnly) |
| `deviceToken` | opaque random (≥90 chars) | 1y | httpOnly cookie `device_token` / `__Secure-device_token`, or `x-device-token` header | No (httpOnly) |
| `userToken` | opaque random | 15m (mirrors access) | **non-httpOnly** cookie `user_token` / `__Secure-user_token` | **Yes** |

All five values are also returned in the GraphQL `AuthPayload` body so API-only clients
(and the Next.js BFF, which re-issues them as its own cookies) can use the header
fallbacks. Cookie names get the `__Secure-` prefix when `NODE_ENV=production`.

`user_token` is deliberately **not** httpOnly — the client-side messaging hook reads it
from `document.cookie` to authenticate the WebSocket channel (see [Messaging WS](#messaging-ws-auth)).

## Compound session key

On issue, the backend writes one Redis HASH under a 4-segment key:

```
sess:{sha256(access)}:{deriveRbac(rbac)}:{sha256(device)}:{deriveUser(user)}
```

### Derivation formulas

```
hmacSha256(secret, data) = HMAC-SHA256(secret, data).hex()
deriveRbac(rbacToken)     = "rbac.v1:" + hmacSha256(DERIVATION_SECRET, "rbac:" + dateOnly() + ":" + rbacToken)
deriveUser(userToken)     = "user.v1:" + hmacSha256(DERIVATION_SECRET, "user:" + dateOnly() + ":" + userToken)
dateOnly()                = new Date().toISOString().slice(0, 10)   // "2026-07-03"
```

The rbac and user token derivations are **date-bound**: at UTC midnight the derived
segment changes, which forces a `refresh` for the new day. This is the "midnight
cutoff" — sessions survive midnight but require a refresh before the first request
of the new UTC day.

`TOKEN_DERIVATION_SECRET` env var (falls back to `JWT_SECRET`) keeps derivation
independent from JWT signing.

### Key properties

- **Hashes, never raw tokens** — Redis contents (SCAN, monitoring, backups) are not
  usable as bearer credentials.
- Value (v2 schema): `userId`, `email`, `role`, `tier`, `deviceId`, `ip`, `userAgent`,
  `issuedAt`, `sessionId`, plus v2 enrichment fields (`name`, `username`, `avatarUrl`,
  `locale`, `timezone`, `friends[]`, `unread`, `orgIds[]`, `teamIds[]`). The `v` field
  is `"2"` for forward schema detection.
- TTL = `JWT_ACCESS_TTL` (900s default) — entries self-expire in lockstep with the JWT,
  no cleanup job.
- Reverse index `user:{userId}:sessions` (SET of live compound keys) enables
  logout-all, admin revocation, and in-place field rewrites.

### v2 schema (`TokenStoreService`)

The Redis HASH stores JSON arrays for list fields to avoid Postgres round-trips on
every guarded request:

```
HSET sess:{key} userId "uuid" email "a@b.com" role "USER" tier "FREE"
    name "Alice" username "alice" avatarUrl "https://..."
    locale "en" timezone "UTC"
    friends '["uuid1","uuid2"]'
    unread "3"
    orgIds '["org1"]'
    teamIds '["team1"]'
    v "2"
```

`SessionHydrationService.hydrate()` runs 4 parallel PG queries on the cold path
(friends, unread count, org memberships, team memberships) and the result is merged
into the compound key at issue time. Subsequent requests read from Redis — zero PG queries.

## Device handshake

A pre-auth `POST /devices/handshake` endpoint sets or slides a `device_token` cookie
without creating a `Device` row. This ensures every page load (even for guests) carries
a device token, so `SessionAuthGuard` always has all 4 segments for the compound key.

At login, `DeviceService.resolveForLogin` either:
- Reuses the presented token if a `Device` row already exists for this user
- Creates a `Device` row with the presented token (landing-token reuse) if no row exists
- Claims the device from another user if the token belongs to someone else

The 4th `userToken` segment is derived from a fresh random token on each `issueTokens`
call and written as a non-httpOnly cookie.

## `SessionAuthGuard` — Phase 3 order

`SessionAuthGuard` validates in this order:

1. **JWT verify** (no I/O) — signature + expiry → fail closed 401
2. **Midnight cutoff check** — if the liveness TTL (<15m) falls outside today's UTC
   window relative to the user-token derivation, the session is still live (TTL hasn't
   expired) but the derivation date changed; treat as valid, but the next request will
   force a refresh
3. **Extract all 4 tokens** from cookies with header fallbacks (`x-rbac-token`,
   `x-device-token`, `x-user-token`, `x-refresh-token`)
4. **Build compound key** using `TokenStoreService.buildKey(access, rbac, device, user)`
5. **`HGETALL`** from Redis — miss → 401 (tampered/revoked)
6. **`payload.sub === hash.userId`** sanity check
7. **Attach** `req.user = SessionUser` (full v2 shape) for resolvers

The `me` query is served entirely from this snapshot (zero Prisma queries).

## Revocation semantics

- **Tamper any one token** → different compound key → miss → 401.
- **`redis-cli DEL <key>`** (or `TokenStoreService.revoke`) → next request 401s
  immediately; the client recovers via `refresh`.
- **`refresh`** revokes the presented compound key, then re-issues all 4 tokens
  (Postgres `Session` row rotates as before — it stays the 30d durable anchor).
- **`logout`** revokes the compound key + reverse-index entry alongside the Session
  delete.
- **Redis unreachable** → fail closed: guarded routes return 503, `/health/ready`
  degrades. Sessions survive a Redis restart (AOF persistence).
- **IP mismatch** vs the stored `ip` is tolerated by default (mobile/NAT churn);
  set `AUTH_IP_STRICT=true` to hard-reject with 401.

## BFF cookie bridge

The Next.js BFF and the NestJS backend run on potentially different origins with
different cookie name prefixes (`__Secure-` in prod). The BFF bridges the gap:

1. **`sessionTokenHeaders()`** in `backend.ts` reads the unprefixed BFF cookie names
   and forwards them as `x-rbac-token`, `x-device-token`, `x-refresh-token`,
   `x-user-token` headers.
2. **`graphqlFetch`** and **`backendFetch`** always attach these headers alongside
   the full Cookie header.
3. **CSRF echo in refresh and logout** — `csrfEchoHeaders()` in `backend.ts`
   (used by `POST /api/auth/refresh` and `POST /api/auth/logout`; the logout
   echo was added 2026-07-03 — before that the backend 403'd the CSRF-guarded
   logout, the BFF swallowed the error, and the session survived server-side):
   a. Calls `GET /csrf/token` on the backend (forwarding `x-forwarded-for` —
      the CSRF HMAC is IP-bound)
   b. Echoes the returned token as `x-csrf-token` + the CSRF cookie (this
      **replaces** the forwarded Cookie header)
   c. Calls the mutation with the BFF's access-token cookie passed as
      `Authorization: Bearer`, so the backend can rebuild and revoke the
      presented compound key (without it `revokePresentedKey` silently no-ops
      and the old key lives out its TTL)
4. **AuthProvider retry** — when `/api/auth/me` returns 401 (access token expired),
   the AuthProvider retries once via `/api/auth/refresh` before falling back to guest.
5. **Device handshake** — `AuthProvider` calls `POST /api/auth/device-handshake`
   on every page load, which proxies to backend `POST /devices/handshake` and
   sets or slides the `device_token` cookie.
6. **`/api/auth/token`** — returns the full token quadruple (`accessToken`,
   `rbacToken`, `deviceToken`, `userToken`) for client-side consumers.

## Subscription-tier RBAC

`User.subscriptionTier` (`FREE | BASIC | MEDIUM | PREMIUM`, default `FREE`) is an
ordered hierarchy orthogonal to `UserRole`. Gate resolvers with:

```ts
@UseGuards(SessionAuthGuard, TierGuard)
@MinTier(SubscriptionTier.BASIC)
```

The guard reads the tier from **Redis, not the JWT**, so the admin mutation
`setUserTier(userId, tier)` (ADMIN/SUPERADMIN) updates Postgres **and** rewrites all
live sessions via the reverse index — an upgrade or downgrade applies on the target
user's next request, no re-login.

## Surface → fields matrix

| Surface | Tokens used | Source |
|---|---|---|---|
| GraphQL `me` | all 4 | Redis HGETALL |
| GraphQL refresh | `refreshToken` (cookie or `x-refresh-token`) | Postgres Session |
| GraphQL resolvers | all 4 (via `SessionAuthGuard`) | Redis (compound-key lookup) |
| HTTP REST endpoints | all 4 (via `SessionAuthGuard`) | Redis (compound-key lookup) |
| Notification WS (socket.io) | `accessToken` + `rbacToken` + `userToken` (+ optional `deviceToken`) | socket.io `handshake.auth` |
| Messaging WS (NestJS gateway) | all 4 | first-message `{type:"auth", tokens}` |
| Messaging WS (standalone server) | all 4 | first-message `{type:"auth", tokens}` |
| SSE demo | none | unauthenticated |

## Tier change semantics

`rewriteFieldsForUser(userId, fields)` iterates the reverse index
`user:{userId}:sessions`, updates each live compound key via `HGETALL` → `HSET`.
The guard's rbac derivation check (`deriveRbacToken(hash.userId, hash.tier)`) then
401s the session's next request because the presented rbacToken was derived from the
old tier. The client silently auto-refreshes (see BFF bridge below), which re-derives
the rbac token from the new tier and rehydrates. No forced logout, but one silent
refresh. `incrUnreadForUser` atomically increments the `unread` counter in every live
session.

## Deploy migration notes

- **This deploy is NOT backward compatible** — the compound key format changes from
  3-segment to 4-segment, the Redis schema changes to v2 (new fields, JSON arrays),
  and the WS auth protocol changes to first-message tokens. All old sessions are
  invalid after deploy; users must re-login.
- Run the DB migration (`prisma migrate deploy`) before the app starts — sessions
  table is unchanged, but new code expects the new compound key format.
- Set `TOKEN_DERIVATION_SECRET` in `.env` and `docker-compose.yml` before first run.
  It must be stable across restarts — rotation invalidates all live sessions.
- Redis data is ephemeral for sessions; on a fresh Redis the app works (cold start).
- The `messaging-server.mjs` standalone process needs Redis access and the same
  `TOKEN_DERIVATION_SECRET` as the backend.

## Messaging WS auth

Both the NestJS `MessagingWsGateway` and the standalone messaging server
(`messaging-server.mjs` on port 3003) authenticate via a **first-message
protocol** with a 30-second auth timeout:

```json
{
  "type": "auth",
  "tokens": {
    "accessToken": "<jwt>",
    "rbacToken": "<opaque>",
    "deviceToken": "<opaque>",
    "userToken": "<opaque>"
  }
}
```

The server runs ordered checks matching `SessionAuthGuard`:
1. Verify the access-token JWT (signature + expiry, zero I/O)
2. Recompute today's `userToken(payload.sub)` and timing-safe compare
3. Build the 4-segment compound key → `HGETALL` (miss → reject)
4. `payload.sub === hash.userId` sanity check
5. Recompute `rbacToken(hash.userId, hash.tier)` and timing-safe compare

On success the server responds `{type:"authenticated"}` and sets the user's
metadata (userId, name, friends) from the Redis hash — **no `User` SELECT**
on connect. Legacy single-JWT auth (`{type:"auth", token}`) is not supported.

The client-side `useMessaging` hook fetches all four tokens from the BFF's
`GET /api/auth/token` on connect.

### Friends-only DM enforcement

Direct messages require `recipientId ∉ friends` (from the Redis hash `friends`
field, refreshed at connect time). The backend keeps the `friends` field
up-to-date via `rewriteFieldsForUser` on friendship changes — no Postgres query
on the DM authorization hot path.

## Frontend consumption (Phase 4)

### Silent-refresh contract

The client-side `apiFetch()` wrapper (`src/lib/api-client.ts`) implements the
401 → single-flight refresh → retry pattern that the backend's midnight-cutoff
and tier-change semantics require. On N parallel 401s, exactly one refresh
request is issued (shared promise). Refresh failure dispatches a `window` event
`auth:logout` that `AuthProvider` listens for.

The WebSocket hooks (`useMessaging`, `useChatRoom`) detect auth-failure closes
(close before receiving `authenticated`) and run one `apiFetch`-style refresh
before reconnecting, capped at 3 retries.

### Sessions surface

`mySessions` query (`@UseGuards(SessionAuthGuard)`) returns the caller's live
Postgres `Session` rows — `id`, `ip`, `userAgent`, `createdAt`, `expiresAt`,
`current` (identified by `sessionId` from the Redis hash, attached to
`req.user` by the guard). `logoutOtherSessions` mutation (CSRF-guarded) revokes
all Redis entries via `revokeAllForUser` then deletes Postgres rows except the
current one.

### Tier UI gating

Frontend mirror of the tier hierarchy (`src/lib/tier.ts`, source-of-truth
comment pointing to `nest-js-boilerplate/src/authorization/`). `TierGate`
component and `useMinTier` hook control render-only visibility; every gated
request hits the backend's `@MinTier` guard.

### Admin tier panel

`POST /api/admin/set-tier` BFF → backend `setUserTier` mutation. The admin page
at `/v1/[lang]/admin` is role-gated (render-only; backend `@Roles` enforces).

### SSR seed

`getSessionUser()` server helper (`src/lib/auth-ssr.ts`) resolves the session
from the `access_token` cookie using the widened `ME_QUERY` — zero Postgres on
the backend. The root layout passes `initialUser` to `AuthProvider`, eliminating
the logged-out flash on hard reloads.

### mySessions / logoutOtherSessions resolver

Added to `auth.resolver.ts`:

- `mySessions` query — `@UseGuards(SessionAuthGuard)`, returns `[Session]` ordered by `createdAt desc`. `current` field computed from `req.user.sessionId`.
- `logoutOtherSessions` mutation — `@UseGuards(CsrfGuard, SessionAuthGuard)`, calls `revokeAllForUser` on all Redis keys, then `deleteMany` on Postgres rows except current.

`sessionId` was added to `JwtUser` interface and attached by `SessionAuthGuard` in step 8.
