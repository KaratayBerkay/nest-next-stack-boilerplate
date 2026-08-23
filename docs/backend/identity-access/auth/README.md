# Auth (backend)

**Source:** [`nest-js-boilerplate/src/auth/`](../../../../nest-js-boilerplate/src/auth/) ·
**Category:** [Identity & Access](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

> 🟡 **Partial doc.** This page now covers the full authenticated-session surface — registration,
> password login, the login-time MFA challenge, OAuth login, session refresh, logout, forgot/reset
> password, authenticated change-password (+ its email "undo" link), email verification, and the
> device-handshake endpoint login depends on — plus the session/token model and `SessionAuthGuard`
> documented since Phase 0. Still out of scope here: MFA **enrollment**, `authorization`, `devices`
> (beyond the one handshake endpoint), `sessions`, `api-keys`, and `csrf` (beyond `CsrfGuard`'s role
> in `refresh`/`logout`) — each is its own vertical, documented elsewhere.

## What this module owns

Every credentialed way a user establishes, renews, or ends a session. Wired into
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly (not
demo-gated). See [`auth.module.ts`](../../../../nest-js-boilerplate/src/auth/auth.module.ts).

`AuthResolver` is **GraphQL-only** — there is no REST controller for login/register/password-reset/
etc. (contrast with messaging, which exposes the same actions over REST, GraphQL, and WS). The only
REST surfaces anywhere near this module are `OAuthController` (`src/auth/oauth/`, needed because
OAuth is an inherently redirect-based flow, not something you can GraphQL your way through) and, in
the separate `devices/` module, the one handshake endpoint documented below.

`AuthResolver` is a thin pass-through to [`AuthService`](../../../../nest-js-boilerplate/src/auth/auth.service.ts),
itself a facade over four hand-constructed sub-services (`new`'d directly inside its constructor, not
independently NestJS-provided — the same "facade + sub-services" shape as messaging's
`MessagingService`):

| Sub-service | Owns |
|---|---|
| [`AuthLoginService`](../../../../nest-js-boilerplate/src/auth/auth-login.service.ts) | password login, MFA challenge verification, OAuth login |
| [`AuthRegistrationService`](../../../../nest-js-boilerplate/src/auth/auth-registration.service.ts) | register, email verification, forgot/reset/change/undo password |
| [`AuthSessionService`](../../../../nest-js-boilerplate/src/auth/auth-session.service.ts) | refresh, logout |
| [`AuthTokenService`](../../../../nest-js-boilerplate/src/auth/auth-token.service.ts) | `issueTokens` — the one place that mints the token quadruple and sets cookies (see below) |

Do **not** confuse this module with
[`src/passport-auth/`](../../../../nest-js-boilerplate/src/passport-auth/) — a `DEMO_MODULES`-gated
NestJS recipe module (Passport local + JWT strategies, confirmed via
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `DEMO_MODULES` array) that
isn't wired into any real product flow. If you're looking for the real login/session system, it's
this one.

## Registration, login, and password flows

Full per-endpoint detail (request/response shapes, error codes, rate limits, "Used by") lives in
[endpoints.md](./endpoints.md). The shape worth calling out here, since it cuts across several
endpoints:

- **Registration logs you in immediately.** `register` issues a full token quadruple before the
  email is verified — verification is not a login gate at signup time, only a *later* login is
  blocked (`EX_AUTH_ACCOUNT_INACTIVE`) if the session from registration has since ended.
- **The MFA challenge is a distinct, unauthenticated intermediate state**, not a second guard on top
  of `login`. A password check that would otherwise succeed instead returns
  `{mfaRequired: true, mfaMethod, mfaToken, user}` with every token field empty; the client then
  calls `verifyLoginMfa` (or `resendLoginCode`) using that `mfaToken` as its only credential. GraphQL
  itself never distinguishes this with a different status — it's the **frontend BFF** that maps it to
  HTTP `202` (see [frontend api.md](../../../frontend/auth/api.md)).
- **OAuth login never trusts a client-supplied profile.** `loginWithOAuth` accepts only an opaque
  `state` string, which resolves to a real profile *only* after
  [`OAuthService.handleCallback`](../../../../nest-js-boilerplate/src/auth/oauth/oauth.service.ts)
  completed a genuine server-to-server code exchange with the provider — the fix for a since-resolved
  account-takeover hole where an earlier version of this flow accepted the profile directly from the
  caller. See [endpoints.md § Log in with OAuth](./endpoints.md#log-in-with-oauth).
- **`resetPassword` and `changePassword` are two different flows that both end up revoking
  sessions**, but asymmetrically: `resetPassword` (unauthenticated, token-only) revokes *every*
  session since there's no "current" one to spare; `changePassword` (authenticated) spares the
  session that authenticated the change itself and force-revokes every other one. Both
  `changePassword` and `resetPassword` additionally park an "undo" trail:
  `changePassword` writes a `PASSWORD_CHANGE_UNDO` token (email link →
  [undo-password-change page](../../../frontend/auth/undo-password-change/page.md)) carrying the
  *previous* password hash in its `metadata`, reusing the same `VerificationToken` table
  `resetPassword`'s own token uses rather than a new one.
- **Password strength is checked twice, redundantly** — once by the DTO's class-validator decorators
  (`@MinLength(8)`/`@Matches(...)`, enforced automatically by the global `ValidationPipe` before the
  resolver body runs) and again by an explicit `validatePasswordStrength()` call inside the service.
  Because the DTO check is strictly stronger for length and character variety, two of
  `validatePasswordStrength`'s three checks are unreachable dead code from every current call site —
  see [endpoints.md § Known issues](./endpoints.md#known-issues).

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
   itself encrypted — see [common/id-codec](../../platform-core/common/id-codec/README.md))
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

## Device identity and the handshake endpoint

Device tracking (`Device` rows, the `device_token` cookie) lives in the separate
[`devices/`](../../../../nest-js-boilerplate/src/devices/) module — out of scope for this doc except
for one endpoint auth's login/register flow calls directly:
**`POST /devices/handshake`** ([endpoints.md § Device handshake](./endpoints.md#device-handshake)),
called on every page load (pre-auth) to mint or slide a `device_token` cookie with no `Device` row
yet. A `Device` row is only actually created at real login/register time, via
[`DeviceService.resolveForLogin`](../../../../nest-js-boilerplate/src/devices/device.service.ts) —
called from all three of `AuthLoginService.login`, `.loginWithOAuth`, and
`AuthRegistrationService.register` — which reconciles the presented `device_token` against any
existing `Device` row for that token (reuse if it's already this user's, claim if it belongs to
nobody, "claim by creating a new row" if it belongs to someone else) and enforces
`MAX_DEVICES_PER_USER` (default 10, oldest evicted).

## Depends on

`AuthContractsModule` (re-exported so importers get `SessionAuthGuard`/token services without a
direct dependency on the rest of this module), `MailModule`, `DevicesModule`, `WireCryptoModule`
(per-session X25519 keypair, minted alongside every token quadruple —
see [wire-crypto](../../messaging-realtime/wire-crypto/README.md)), `FriendsModule` and
`RealtimeModule` (both via `forwardRef` to break an import cycle — `SessionHydrationService` needs
`FriendsService` for the session snapshot's `friends` list, and `RealtimeGateway` needs to notify a
user's other live sockets of a new-device login/force-close them on logout/session-revoking actions).

## Used by

Every guarded module — `SessionAuthGuard` (or the WS-upgrade equivalent) is the shared dependency
underneath [messaging](../../messaging-realtime/messaging/README.md),
[wire-crypto](../../messaging-realtime/wire-crypto/README.md), and
[realtime](../../messaging-realtime/realtime/README.md).

| App | Page / Screen |
|---|---|
| Frontend | [auth vertical index](../../../frontend/auth/README.md) — login, register, forgot-password, reset-password, verify-email, undo-password-change |
| Mobile | [auth vertical index](../../../mobile/auth/README.md) — same six screens |

## Known issues

- Dead/unreachable password-strength validation, and two dead/misguarded OAuth REST endpoints — see
  [endpoints.md § Known issues](./endpoints.md#known-issues) for full evidence.
- The web login page's MFA challenge form has no UI path to submit a backup code (Flutter's does) —
  see [endpoints.md § Verify a login MFA code](./endpoints.md#verify-a-login-mfa-code).
- Full findings with severity are filed in [`issues.md`](../../../issues.md).
