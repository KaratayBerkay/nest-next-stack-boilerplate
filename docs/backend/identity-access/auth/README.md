# Auth (backend) — session & token model

**Source:** [`nest-js-boilerplate/src/auth/`](../../../../nest-js-boilerplate/src/auth/) ·
**Category:** [Identity & Access](../README.md)

> 🟡 **Partial doc.** This page covers the session/token model and `SessionAuthGuard` — enough for
> other modules to link to accurately. Login, register, password reset, MFA enrollment, OAuth, and
> `auth/endpoints.md` land in Phase 1, alongside the frontend `/auth/*` pages that need them.

## Session model — four-token compound key in Redis

A guarded request never touches Postgres: one Redis lookup resolves identity, role, and tier.
Every login/register issues four tokens:

| Token | Kind | Lifetime | Cookie (unprefixed; `__Secure-` prefix added in production) | JS-accessible |
|---|---|---|---|---|
| `accessToken` | JWT (HS256) | 15m | `access_token`, or `Authorization: Bearer` | No (httpOnly) |
| `refreshToken` | opaque | 30d | `refresh_token` | No (httpOnly) |
| `rbacToken` | opaque | 15m (mirrors access) | `rbac_token` | No (httpOnly) |
| `deviceToken` | opaque (≥90 chars) | 1y | `device_token` | No (httpOnly) |
| `userToken` | opaque | 15m (mirrors access) | `user_token` | **Yes** — deliberately non-httpOnly; client-side code reads it for WS-adjacent purposes |

All four combine into one Redis HASH key: `sess:{sha256(access)}:{deriveRbac(rbac)}:{sha256(device)}:{deriveUser(user)}`.
The `rbac`/`user` derivations are **date-bound** (HMAC-SHA256 with today's UTC date via
[`TokenDerivationService`](../../../../nest-js-boilerplate/src/auth/token-derivation.service.ts)),
so a session that's otherwise still live requires one silent refresh at UTC midnight.

## `SessionAuthGuard` — validation order

Session validation is split across two classes so the HTTP/GraphQL guard and the WS upgrade check
(see [messaging-realtime/realtime/README.md](../../messaging-realtime/realtime/README.md)) can't
independently drift — the guard's own source comment states this was a deliberate fix ("the WS side
kept its own hand-copied version of this logic").

**[`SessionValidatorService.validate()`](../../../../nest-js-boilerplate/src/auth/session-validator.service.ts)**
(shared by both transports):
1. `accessToken` present → JWT verify (signature + expiry, zero I/O) → decrypt `sub` (the id is
   itself encrypted — see [common/id-codec](../../platform-core/README.md), Phase 5)
2. `rbacToken`/`userToken` present
3. Recompute today's expected `userToken` from `sub` and timing-safe-compare — **this is the
   midnight-cutoff check**: the derivation is date-bound, so a stale-dated token fails here even if
   the underlying Redis session hasn't expired
4. Build the compound key, `HGETALL` from Redis → miss = `session_miss`
5. `payload.sub === session.userId` sanity check
6. Recompute expected `rbacToken` from `(userId, tier)` and timing-safe-compare — this is what makes
   a tier change take effect on the *next* request without re-login (see
   [architecture.md § Tier-based RBAC](../../../architecture.md#tier-based-rbac--two-orthogonal-authorization-axes))

**[`SessionAuthGuard.canActivate()`](../../../../nest-js-boilerplate/src/auth/session-auth.guard.ts)**
(HTTP/GraphQL-specific, steps 7-10, only after the shared validation above succeeds):
7. IP/user-agent change detection — logged always; hard-rejects only if `AUTH_IP_STRICT=true`
8. Attach the widened `req.user` (`userId, email, role, tier, name, username, avatarUrl, locale,
   timezone, chatNickname, useNickname, friends, unread, orgIds, teamIds, sessionId, deviceId`)
9. Slide the Redis TTL (`tokenStore.extendTTL`) so active sessions outlive a single JWT lifetime
10. CSRF check — **only** for GraphQL mutations, and **only** when auth came via cookie rather than
    `Authorization: Bearer` (bearer tokens aren't browser-auto-attached, so CSRF doesn't apply)

A request already authenticated by `ApiKeyGuard` (`req._authenticatedByApiKey`) skips all of this —
see [api-keys](../api-keys/) (Phase 1).

## WS auth uses the same validator — not a first-message protocol

[`realtime.gateway.ts`](../../messaging-realtime/realtime/README.md) calls this same
`SessionValidatorService.validate()` during the WS **upgrade** (before a socket exists), reading the
four cookies directly rather than waiting for a client-sent auth message. See
[../../../issues.md#cross-005](../../../issues.md#cross-005) if you've encountered older
documentation describing a different, first-message-based WS auth protocol — that was replaced.

## Revocation

- Tamper any one of the four tokens → different compound key → miss → `session_miss` (equivalent to
  401).
- Deleting the Redis key (`TokenStoreService.revoke`, or an admin/logout action) invalidates the
  session on the *next* request — no active-connection kill for HTTP, but WS sockets tied to a
  revoked session can be force-closed via `RealtimeGateway.closeSocketsForSession`.
- Redis unreachable → fail closed (`503`, not silently-authenticated) — see the `redis_unavailable`
  branch in both `SessionAuthGuard` and `realtime.gateway.ts`'s `verifyUpgrade`.

## Used by

Every guarded module — `SessionAuthGuard` (or the WS-upgrade equivalent) is the shared dependency
underneath [messaging](../../messaging-realtime/messaging/README.md),
[wire-crypto](../../messaging-realtime/wire-crypto/README.md), and
[realtime](../../messaging-realtime/realtime/README.md), documented so far. Full frontend/mobile
login-flow documentation lands with the rest of this module in Phase 1.
