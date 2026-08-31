# Auth — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/auth/`](../../../../nest-js-boilerplate/src/auth/)

## GraphQL

Resolver: [`auth.resolver.ts`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts) · no class-level guard —
every mutation/query below states its own auth requirement. All service logic is delegated to
[`AuthService`](../../../../nest-js-boilerplate/src/auth/auth.service.ts), which is itself a thin
facade over four hand-constructed (not NestJS-provided) sub-services — `AuthTokenService`,
`AuthLoginService`, `AuthRegistrationService`, `AuthSessionService` — same "facade + sub-services"
shape as messaging's `MessagingService`. See [README.md § What this module owns](./README.md).

### Register

**Kind:** GraphQL Mutation · **`register(input: RegisterInput!): AuthPayload!`** · rate-limited 10/60s
**Source:** [`auth.resolver.ts#L32-L39`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts),
logic in [`auth-registration.service.ts#L41-L121`](../../../../nest-js-boilerplate/src/auth/auth-registration.service.ts) (`AuthRegistrationService.register`)
**Auth:** none (pre-session).
**Request:** [`RegisterInput`](../../../../nest-js-boilerplate/src/auth/dto/register.input.ts) —
`email`, `password` (8-128 chars, `@Matches` requires lower+upper+digit — see ⚠
[BE-004](../../../issues.md#be-004)), optional `name`, `timezone`.
**Response:** [`AuthPayload`](../../../../nest-js-boilerplate/src/auth/auth.types.ts) — the full
token quadruple (`accessToken`, `rbacToken`, `deviceToken`, `userToken`, `refreshToken`) plus `user`.
Cookies are also set directly on the response (see [README.md § Session model](./README.md)).
**Behavior:** creates the `User` row (`status: PENDING_VERIFICATION`), a `VerificationToken`
(`EMAIL_VERIFICATION`, 24h TTL), enqueues an `email-verification` mail (link:
`{FRONTEND_URL}/auth/verify-email?token=...`) and — best-effort, failure swallowed — a 6-digit
`EmailOtpService` code (see [`EmailOtpService`](../../../../nest-js-boilerplate/src/auth/email-otp.service.ts))
for the code-entry alternative. Then resolves the device (see
[Device handshake](#device-handshake) below) and **issues tokens immediately** — registration logs
the user in; verifying the email is not a login gate (see `AuthLoginService.login`'s
`EX_AUTH_ACCOUNT_INACTIVE`/`PENDING_VERIFICATION` check, which only bites a *subsequent* login after
the initial session eventually ends).
**Errors:** `409 EX_AUTH_EMAIL_TAKEN` (email already registered) · `400 EX_AUTH_WEAK_PASSWORD` (from
`validatePasswordStrength` — see [BE-004](../../../issues.md#be-004)) · standard `400`
class-validator errors for a malformed DTO.
**Used by:** Frontend [register page](../../../frontend/auth/register/page.md); Mobile
[register screen](../../../mobile/auth/register/screen.md).

### Log in

**Kind:** GraphQL Mutation · **`login(input: LoginInput!): AuthPayload!`** · rate-limited 10/60s
**Source:** [`auth.resolver.ts#L41-L48`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts),
logic in [`auth-login.service.ts#L43-L151`](../../../../nest-js-boilerplate/src/auth/auth-login.service.ts) (`AuthLoginService.login`)
**Auth:** none (pre-session).
**Request:** [`LoginInput`](../../../../nest-js-boilerplate/src/auth/dto/login.input.ts) — `email`,
`password`, optional `timezone`.
**Response:** `AuthPayload` — either the full token quadruple + `user` (success), or
`{mfaRequired: true, mfaMethod: 'TOTP'|'EMAIL', mfaToken, user}` with every token field `null`/absent
(MFA challenge — see [Verify a login MFA code](#verify-a-login-mfa-code)). GraphQL itself always
returns `200`; the **frontend BFF** is what maps the `mfaRequired` case to a distinct HTTP `202` (see
[frontend api.md](../../../frontend/auth/api.md)) — the GraphQL layer has no separate status for it.
**Behavior:** looks up the user by lowercased email; if no `passwordHash` exists (e.g. OAuth-only
account), still runs `argon2.verify` against a hardcoded dummy hash before rejecting — a
constant-time defense against email-enumeration-via-timing. 5 consecutive bad passwords locks the
account 15 minutes (`MAX_FAILED_LOGINS`/`LOCK_MINUTES` in
[`auth-login.service.ts`](../../../../nest-js-boilerplate/src/auth/auth-login.service.ts)). If
`user.mfaEnabled` and the resolved device isn't already `trusted`, short-circuits into the MFA
challenge branch instead of issuing tokens (writes a `TokenStoreService.writeMfaChallenge` entry,
keyed by `sha256(mfaToken)`; sends an email OTP if the method is `EMAIL`). Otherwise resets
`failedLoginCount`, updates `lastLoginAt`/`timezone`, and issues tokens.
**Errors:** `401 EX_AUTH_INVALID_CREDENTIALS` (bad email or password) · `401
EX_AUTH_ACCOUNT_LOCKED` · `401 EX_AUTH_ACCOUNT_INACTIVE` (msg/key differ for `PENDING_VERIFICATION`
vs. other inactive states).
**Realtime side-effect:** a new/changed device emits `device-logged-in` to the user's other live
sockets (`RealtimeGateway.emitToUser`, via `emitNewDevice`).
**Used by:** Frontend [login page](../../../frontend/auth/login/page.md) (`LoginCredentialsForm`);
Mobile [login screen](../../../mobile/auth/login/screen.md).

### Verify a login MFA code

**Kind:** GraphQL Mutation · **`verifyLoginMfa(input: VerifyLoginMfaInput!): AuthPayload!`** ·
rate-limited 10/60s
**Source:** [`auth.resolver.ts#L129-L138`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts),
logic in [`auth-login.service.ts#L153-L212`](../../../../nest-js-boilerplate/src/auth/auth-login.service.ts) (`AuthLoginService.verifyLoginMfa`)
**Auth:** none — authenticated by possession of the single-use `mfaToken` from the `login` challenge.
**Request:** [`VerifyLoginMfaInput`](../../../../nest-js-boilerplate/src/auth/dto/verify-login-mfa.input.ts) —
`mfaToken`, `code` (6-10 chars — accommodates both a 6-digit TOTP/email code and a longer backup code).
**Response:** `AuthPayload` with the full token quadruple, same shape as a successful `login`.
**Behavior:** looks the challenge up by `sha256(mfaToken)` (`peekMfaChallenge` — doesn't consume yet).
For `EMAIL` method, delegates to `EmailOtpService.verify` (own 5-attempt cap, see
[`email-otp.service.ts`](../../../../nest-js-boilerplate/src/auth/email-otp.service.ts)). For `TOTP`,
tries `otplib.verify` against the user's stored (encrypted) secret first, then falls back to
[`verifyBackupCode`](../../../../nest-js-boilerplate/src/auth/auth-login.service.ts) (one-time-use
`MfaBackupCode` row, hash-compared) if the TOTP check fails — **either accepted code type completes
login**, the resolver/DTO don't distinguish which one was used beyond the 6-10 char length allowance.
⚠ `CROSS-009` (resolved): the web login page's `MfaChallengeForm` has no UI to submit a backup code
at all (TOTP/email only); Flutter's does.
**Errors:** `401 EX_AUTH_MFA_EXPIRED` (challenge not found/already consumed) · `401
EX_AUTH_MFA_NOT_ENABLED` · `401 EX_AUTH_MFA_INVALID_CODE`.
**Used by:** Frontend [login page](../../../frontend/auth/login/page.md) (`MfaChallengeForm`); Mobile
[login screen](../../../mobile/auth/login/screen.md) (MFA state).

### Resend a login MFA code

**Kind:** GraphQL Mutation · **`resendLoginCode(mfaToken: String!): String!`** · rate-limited 5/60s
**Source:** [`auth.resolver.ts#L140-L144`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts),
logic in [`auth.service.ts#L132-L163`](../../../../nest-js-boilerplate/src/auth/auth.service.ts) (`AuthService.resendLoginCode`)
**Auth:** none — same possession model as `verifyLoginMfa`.
**Request:** `mfaToken` (the current challenge token).
**Response:** a **new** `mfaToken` string — resending **rotates** the challenge token (old one is
consumed via `consumeMfaChallenge`, a fresh one written with the same `userId`/`email`/`role`/`tier`/
`mfaMethod`), so the caller must replace its stored `mfaToken` with the returned value or the next
`verifyLoginMfa` call 401s with `EX_AUTH_MFA_EXPIRED`. Only re-sends the email OTP (`EmailOtpService.resend`,
own 60s cooldown) — a `TOTP`-method challenge can still be "resent" (rotates the token) even though
there's no code to actually send, since TOTP codes come from the user's own authenticator app.
**Errors:** `401 EX_AUTH_MFA_EXPIRED` · `401 EX_AUTH_USER_NOT_FOUND`.
**Used by:** Frontend [login page](../../../frontend/auth/login/page.md) (`MfaChallengeForm`'s resend
link, email method only); Mobile [login screen](../../../mobile/auth/login/screen.md).

### Log in with OAuth

**Kind:** GraphQL Mutation · **`loginWithOAuth(input: OAuthLoginInput!): AuthPayload!`** ·
rate-limited 10/60s
**Source:** [`auth.resolver.ts#L120-L127`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts),
logic in [`auth.service.ts#L241-L264`](../../../../nest-js-boilerplate/src/auth/auth.service.ts) +
[`auth-login.service.ts#L214-L325`](../../../../nest-js-boilerplate/src/auth/auth-login.service.ts) (`AuthLoginService.loginWithOAuth`)
**Auth:** none — authenticated by possession of a `state` value that only resolves to a real profile
after [`OAuthService.handleCallback`](../../../../nest-js-boilerplate/src/auth/oauth/oauth.service.ts)
completed a genuine provider code exchange (see the [REST § Handle an OAuth provider callback](#handle-an-oauth-provider-callback)
entry below). **The profile is never accepted as caller-supplied input** — only a `state` string
(`OAuthLoginInput.state`) — this is the fix for a since-resolved account-takeover hole where an
earlier version of this flow trusted a client-submitted profile object directly (see the inline
comment on `AuthService.loginWithOAuth`).
**Response:** `AuthPayload`, same shape as a successful `login`. Never MFA-challenged — OAuth login
bypasses the `mfaEnabled` check entirely (no `mfaEnabled`/`device.trusted` branch in this path, unlike
`AuthLoginService.login`).
**Behavior:** matches an existing `Account` row by `(provider, providerAccountId)` first; if none,
looks up/creates a `User` by email inside one transaction (auto-generates a username via
[`UsernameService`](../../../../nest-js-boilerplate/src/auth/username.service.ts) for brand-new
users) and links a new `Account` row. A brand-new user gets a "welcome — set your password" email
carrying a standalone password-reset token (`issuePasswordResetTokenStandalone`), since an
OAuth-only account has no `passwordHash` yet.
**Errors:** thrown by `OAuthService.retrieveProfile` if `state` is unknown/expired/already consumed
(10-minute Redis TTL, single read) — surfaces as a generic GraphQL error, no `exc` code.
**Used by:** Frontend [login page](../../../frontend/auth/login/page.md), called server-side from the
[`/api/auth/oauth/[provider]/callback` BFF route](../../../frontend/auth/api.md#oauth--no-apiserver-file-at-all), not
directly from browser JS; Mobile [login screen](../../../mobile/auth/login/screen.md)
(`social_login_buttons.dart`, direct GraphQL call after the deep-link round-trip completes).

### Verify email

**Kind:** GraphQL Mutation · **`verifyEmail(token: String!): User!`**
**Source:** [`auth.resolver.ts#L50-L53`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts),
logic in [`auth-registration.service.ts#L169-L211`](../../../../nest-js-boilerplate/src/auth/auth-registration.service.ts) (`AuthRegistrationService.verifyEmail`)
**Auth:** none — the `token` (raw, from the emailed link) is the credential; looked up by
`sha256(token)` against `VerificationToken` (`type: EMAIL_VERIFICATION`).
**Behavior:** marks the token `consumedAt`, sets `user.emailVerifiedAt` + `status: ACTIVE`, inside one
transaction.
**Errors:** `401 EX_AUTH_INVALID_TOKEN` (unknown/wrong-type/already-consumed/expired token, or a token
with no `userId`).
**Used by:** Frontend [verify-email page](../../../frontend/auth/verify-email/page.md) (token mode,
auto-fires on mount); Mobile [verify-email screen](../../../mobile/auth/verify-email/screen.md) (same).

### Verify email with a code

**Kind:** GraphQL Mutation · **`verifyEmailCode(userId: String!, code: String!): User!`** ·
rate-limited 10/60s
**Source:** [`auth.resolver.ts#L55-L62`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts),
logic in [`auth-registration.service.ts#L136-L167`](../../../../nest-js-boilerplate/src/auth/auth-registration.service.ts) (`AuthRegistrationService.verifyEmailCode`)
**Auth:** none — the 6-digit `code` (delivered by `EmailOtpService`, purpose `REGISTRATION`) is the
credential.
**Behavior:** delegates the code check to `EmailOtpService.verify` (5-attempt cap, then a hard
lockout requiring a fresh `resendEmailCode`); already-verified users short-circuit to a plain return
(idempotent) rather than re-running the transaction.
**Errors:** `401 EX_AUTH_OTP_EXPIRED` · `400 EX_AUTH_OTP_MAX_ATTEMPTS` · `400 EX_AUTH_OTP_INVALID` ·
`401 EX_AUTH_USER_NOT_FOUND`.
**Used by:** Frontend [verify-email page](../../../frontend/auth/verify-email/page.md) (code mode —
used when the page loads with `?userId=&email=` instead of `?token=`, i.e. arriving straight from
registration rather than clicking the emailed link); Mobile
[verify-email screen](../../../mobile/auth/verify-email/screen.md) (same).

### Resend the email verification code

**Kind:** GraphQL Mutation · **`resendEmailCode(userId: String!, email: String!): Boolean!`** ·
rate-limited 5/60s
**Source:** [`auth.resolver.ts#L64-L71`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts)
**Behavior:** thin wrapper around `EmailOtpService.resend(userId, email, 'REGISTRATION')` — 60s
cooldown, deletes any still-pending code before generating a fresh one.
**Errors:** `400 EX_AUTH_OTP_RESEND_COOLDOWN`.
**Used by:** Frontend [verify-email page](../../../frontend/auth/verify-email/page.md); Mobile
[verify-email screen](../../../mobile/auth/verify-email/screen.md).

### Refresh the session

**Kind:** GraphQL Mutation · **`refresh: AuthPayload!`** · guarded by `CsrfGuard`
**Source:** [`auth.resolver.ts#L73-L77`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts),
logic in [`auth-session.service.ts#L143-L203`](../../../../nest-js-boilerplate/src/auth/auth-session.service.ts) (`AuthSessionService.refresh`)
**Auth:** none via `SessionAuthGuard` — authenticated by the **refresh token** itself (opaque,
30-day, `x-refresh-token` header or `refresh_token` cookie) plus a **double-submit CSRF check**
([`CsrfGuard`](../../../../nest-js-boilerplate/src/csrf/csrf.guard.ts) — echoes a token fetched from
`GET /csrf/token` back as `x-csrf-token`; applied here specifically because this mutation relies on
an ambient httpOnly cookie rather than a bearer token the caller had to explicitly attach). See
[README.md § SessionAuthGuard](./README.md) for why `CsrfGuard` exists as a separate class from the
guard's own internal CSRF step.
**Behavior:** resolves the current session from the refresh token, **revokes the old compound Redis
key**, then re-issues a full token quadruple — **every** token rotates on refresh (access, rbac,
device, user, refresh), not just the access token. The caller must persist all of them or the very
next authenticated request 401s (`session_miss`) even though the refresh itself just succeeded — see
the extensive comments in both
[`refresh_token.dart`](../../../../flutter-boilerplate/lib/api/server/auth/refresh_token.dart) and
[`app/api/auth/refresh/route.ts`](../../../../next-js-boilerplate/src/app/api/auth/refresh/route.ts)
about this exact trap.
**Errors:** `401 EX_AUTH_INVALID_TOKEN` (missing/invalid/expired refresh token) · `403` (CSRF guard
rejection, thrown before the resolver body runs) · `401 EX_AUTH_ACCOUNT_INACTIVE` (user no longer
exists).
**Used by:** app-wide, not page-specific — Frontend's `apiFetch`'s 401→refresh→retry cycle
(`refreshSession()` in [`src/lib/api-client.ts`](../../../../next-js-boilerplate/src/lib/api-client.ts),
via `/api/auth/refresh`) and Mobile's `AuthNotifier.refreshAccessToken()`
([`hooks/use_auth.dart`](../../../../flutter-boilerplate/lib/hooks/use_auth.dart)) — see
[frontend hooks.md](../../../frontend/auth/hooks.md) and
[mobile README.md](../../../mobile/auth/README.md).

### Log out

**Kind:** GraphQL Mutation · **`logout: Boolean!`** · guarded by `CsrfGuard`
**Source:** [`auth.resolver.ts#L79-L83`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts),
logic in [`auth-session.service.ts#L101-L141`](../../../../nest-js-boilerplate/src/auth/auth-session.service.ts) (`AuthSessionService.logout`)
**Auth:** same CSRF-guarded, cookie/header-token model as `refresh` — reads all four tokens directly
(not via `SessionAuthGuard`, so a partially-invalid session can still be revoked instead of just
401ing).
**Behavior:** revokes the compound Redis key, deletes the per-session wire-crypto keypair (see
[wire-crypto](../../messaging-realtime/wire-crypto/README.md)), and force-closes any live WS
sockets tied to that session (`RealtimeGateway.closeSocketsForSession`). Clears the rbac/user/refresh
cookies on the response (**not** the access-token cookie itself — that's a short-lived JWT the caller
already holds and it's the BFF layer's job to clear it, see the frontend logout route below; and
**not** `device_token` — it identifies the physical browser across logins, deliberately outlives one).
**Used by:** app-wide (`AuthStatus.tsx`'s sign-out button, `useAuth().logout()`'s auto-logout-on-401
path) — not one of the 6 in-scope pages themselves, see
[frontend hooks.md](../../../frontend/auth/hooks.md).

### Request a password reset

**Kind:** GraphQL Mutation · **`requestPasswordReset(input: RequestPasswordResetInput!): Boolean!`** ·
rate-limited 5/300s
**Source:** [`auth.resolver.ts#L85-L91`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts),
logic in [`auth-registration.service.ts#L232-L250`](../../../../nest-js-boilerplate/src/auth/auth-registration.service.ts) (`AuthRegistrationService.requestPasswordReset`)
**Auth:** none.
**Request:** [`RequestPasswordResetInput`](../../../../nest-js-boilerplate/src/auth/dto/request-password-reset.input.ts) — `email`.
**Behavior:** **always returns `true`**, even for an unknown email — deliberate
email-enumeration defense (no `exc`/error distinguishes "no such account" from "email sent"). Issues
a `PASSWORD_RESET` `VerificationToken` (24h TTL) and enqueues a `password-reset` mail linking to
`{FRONTEND_URL}/auth/reset-password?token=...`.
**Used by:** Frontend [forgot-password page](../../../frontend/auth/forgot-password/page.md); Mobile
[forgot-password screen](../../../mobile/auth/forgot-password/screen.md).

### Reset password

**Kind:** GraphQL Mutation · **`resetPassword(input: ResetPasswordInput!): Boolean!`** ·
rate-limited 5/300s
**Source:** [`auth.resolver.ts#L93-L97`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts),
logic in [`auth-registration.service.ts#L252-L310`](../../../../nest-js-boilerplate/src/auth/auth-registration.service.ts) (`AuthRegistrationService.resetPassword`)
**Auth:** none — the `token` (raw, emailed) is the credential.
**Request:** [`ResetPasswordInput`](../../../../nest-js-boilerplate/src/auth/dto/reset-password.input.ts) —
`token`, `newPassword` (same 8-128/`@Matches` DTO rule as `register`; see ⚠ note below).
**Behavior:** consumes the `PASSWORD_RESET` token, updates `passwordHash`, clears
`failedLoginCount`/`lockedUntil`, then **revokes every existing session for the user**
(`tokenStore.revokeAllForUser`) — unlike `changePassword` below, this has no "keep the current
session alive" carve-out, since there is no current session (the caller isn't logged in).
**Errors:** `401 EX_AUTH_INVALID_TOKEN` · `400 EX_AUTH_WEAK_PASSWORD`.
**Used by:** Frontend [reset-password page](../../../frontend/auth/reset-password/page.md); Mobile
[reset-password screen](../../../mobile/auth/reset-password/screen.md).

### Change password

**Kind:** GraphQL Mutation · **`changePassword(input: ChangePasswordInput!): Boolean!`** ·
`SessionAuthGuard` · rate-limited 5/300s
**Source:** [`auth.resolver.ts#L99-L112`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts),
logic in [`auth.service.ts#L207-L235`](../../../../nest-js-boilerplate/src/auth/auth.service.ts) +
[`auth-registration.service.ts#L319-L382`](../../../../nest-js-boilerplate/src/auth/auth-registration.service.ts) (`changePassword`)
**Auth:** `SessionAuthGuard` (full session required — this is the one auth mutation that needs the
caller already logged in). The frontend's BFF route sends the access token as `Authorization: Bearer`
rather than relying on the cookie, so `SessionAuthGuard`'s own internal CSRF step (README.md's step
10 — cookie-auth only) doesn't apply to this specific call path.
**Request:** [`ChangePasswordInput`](../../../../nest-js-boilerplate/src/auth/dto/change-password.input.ts) —
`currentPassword`, `newPassword`.
**Behavior:** verifies `currentPassword` against the stored hash, then updates it and **parks the
previous hash** on a new `PASSWORD_CHANGE_UNDO` `VerificationToken`'s `metadata` (24h TTL) — the same
single-use/expiry primitive `resetPassword`'s own token uses, no new table. Emails a "your password
was changed" notice linking to `{FRONTEND_URL}/auth/undo-password-change?token=...`. **Every other
session for the user is force-revoked** (mirrors `SessionsResolver.revokeAllOtherSessions`, a
different module) — the session that authenticated this very call is deliberately spared.
**Errors:** `401 EX_AUTH_INVALID_CREDENTIALS` (wrong current password) · `400 EX_AUTH_WEAK_PASSWORD`.
**Used by:** the `settings/security` page's change-password form — **out of scope for this pass**
(different vertical/agent; see
[`views/settings/security/SecurityChangePassword.tsx`](../../../../next-js-boilerplate/src/views/settings/security/SecurityChangePassword.tsx)
and its `useAuthActions().changePassword` call). Documented here because it's implemented in this
same resolver file and its output (the undo email) is what feeds the in-scope
[undo-password-change page](../../../frontend/auth/undo-password-change/page.md) below. Mobile:
[`ChangePassword` widget](../../../mobile/v1/settings/security/widgets/change-password.md)
(`flutter-boilerplate/lib/views/security/change_password/page_content.dart`), documented as part of
the settings/security vertical — see `CROSS-015` (resolved).

### Undo a password change

**Kind:** GraphQL Mutation · **`undoPasswordChange(token: String!): Boolean!`** · rate-limited 5/300s
**Source:** [`auth.resolver.ts#L114-L118`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts),
logic in [`auth-registration.service.ts#L384-L446`](../../../../nest-js-boilerplate/src/auth/auth-registration.service.ts) (`AuthRegistrationService.undoPasswordChange`)
**Auth:** none — the `token` (raw, emailed by `changePassword`) is the credential.
**Behavior:** reads the `PASSWORD_CHANGE_UNDO` token's `metadata.previousPasswordHash`, restores it
as the current `passwordHash`, consumes the token, then **revokes every session for the user** —
including whichever session (attacker's, if this is a real "someone changed my password" incident) is
still active under the *new* password, forcing a fresh login under the *restored* one.
**Errors:** `401 EX_AUTH_INVALID_TOKEN` (unknown/wrong-type/consumed/expired token, or metadata
missing `previousPasswordHash`).
**Used by:** Frontend [undo-password-change page](../../../frontend/auth/undo-password-change/page.md);
Mobile [undo-password-change screen](../../../mobile/auth/undo-password-change/screen.md).

### Activate a user for testing

**Kind:** GraphQL Mutation · **`devActivateUser(email: String!): Boolean!`** · `SessionAuthGuard` +
`RolesGuard` (`SUPERADMIN` only)
**Source:** [`auth.resolver.ts#L146-L158`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts)
**Behavior:** dev/e2e-only escape hatch to skip email verification — no-ops (`return false`) unless
`ALLOW_DEV_ACTIVATE=true` is set, matching the `LOAD_DEMO_MODULES` convention used elsewhere. Only
flips a `PENDING_VERIFICATION` user to `ACTIVE`.
**Used by:** e2e test tooling only — no frontend or mobile UI calls this.

### Get the current session user

**Kind:** GraphQL Query · **`me: SessionUserPayload!`** · `SessionAuthGuard`
**Source:** [`auth.resolver.ts#L160-L190`](../../../../nest-js-boilerplate/src/auth/auth.resolver.ts)
**Response:** [`SessionUserPayload`](../../../../nest-js-boilerplate/src/auth/auth.types.ts) — the
Redis session snapshot ([README.md § Session model](./README.md)'s `SessionUser`), **not** the full
Prisma `User` row — deliberately, so a guarded request stays off Postgres on the hot path. Two fields
(`mfaEnabled`, `hideAvatar`) are the sole exception: fetched via one `prisma.user.findUnique` because
they aren't part of the Redis snapshot.
**Used by:** Frontend — the real `/api/auth/me` BFF route's *fast path* reads a `session_user` cookie
instead of calling this; it only falls through to `me` when that cookie is absent or stale (see
[frontend api.md](../../../frontend/auth/api.md)). Also called directly (extra headers, not cookies)
by the login/register/MFA/OAuth BFF routes to overlay fields their own GraphQL mutation's `user`
selection can't carry (`hideAvatar` is `@HideField()`'d on `User`, so it's never selectable from
`login`/`register`/`loginWithOAuth`/`verifyLoginMfa` directly). Mobile: `MeServer.call()`
([`me.dart`](../../../../flutter-boilerplate/lib/api/server/auth/me.dart)) is called from
[settings/account](../../../mobile/v1/settings/account/screen.md)'s avatar-upload success path (a
best-effort session re-sync, out of scope for this pass to detail further) — ⚠ see
`MOB-002` (resolved) for a second, unrelated provider that duplicates its name
without ever calling it.

## REST

Two independent controllers expose REST here — `OAuthController` (`src/auth/oauth/`) and, in the
separate `devices/` module, `DeviceController`. Neither is guarded at the class level.

### List configured OAuth providers

**Kind:** REST · **`GET /auth/oauth/providers`**
**Source:** [`oauth.controller.ts#L61-L64`](../../../../nest-js-boilerplate/src/auth/oauth/oauth.controller.ts)
**Response:** `string[]` — provider names from
[`oauth-providers.ts`](../../../../nest-js-boilerplate/src/auth/oauth/oauth-providers.ts) (`google`,
`github`, `x`, `linkedin`, `huggingface`, `twitch`) filtered to whichever have a client-id env var set.
**Used by:** nobody. ⚠ `CROSS-008` (resolved) — both the web and mobile social-login buttons hardcode
their own identical 6-provider list instead of fetching this.

### Start an OAuth flow

**Kind:** REST · **`GET /auth/oauth/:provider`** · query `state` (required), `redirect_uri` (required)
**Source:** [`oauth.controller.ts#L74-L97`](../../../../nest-js-boilerplate/src/auth/oauth/oauth.controller.ts)
(`@Redirect()`)
**Behavior:** validates `redirect_uri`'s origin against an allow-list (`FRONTEND_URL` and
`MOBILE_OAUTH_REDIRECT_ORIGIN`, default `flutterboilerplate://oauth` — compared by scheme+host, since
`URL.origin` is the opaque string `"null"` for custom app URI schemes), stores `{provider,
redirectUri, codeVerifier?}` in Redis keyed by `state` (10-minute TTL), and issues a `302` to the
real provider's authorization endpoint (PKCE code-challenge attached when the provider supports it —
currently only `x`).
**Errors:** `400 EX_VALIDATION_FORM` (missing `state`/`redirect_uri`, or `redirect_uri` origin not
allow-listed).
**Used by:** Frontend — the browser never calls this directly; the
[`/api/auth/oauth/[provider]` BFF route](../../../frontend/auth/api.md#oauth--no-apiserver-file-at-all)
fetches it server-to-server (`redirect: "manual"`) and relays the `Location` header. Mobile —
[`social_login_buttons.dart`](../../../../flutter-boilerplate/lib/components/auth/social_login_buttons.dart)
opens this URL **directly** in the system browser (`launchUrl`, `LaunchMode.externalApplication`) —
no BFF hop.

### Handle an OAuth provider callback

**Kind:** REST · **`GET /auth/oauth/:provider/callback`** · query `code`, `state`, `error?`
**Source:** [`oauth.controller.ts#L105-L159`](../../../../nest-js-boilerplate/src/auth/oauth/oauth.controller.ts)
**Behavior:** the provider redirects here after the user consents. Exchanges `code` for a provider
access token server-to-server
([`oauth.service.ts#L112-L182`](../../../../nest-js-boilerplate/src/auth/oauth/oauth.service.ts)),
fetches the provider profile, stores it in Redis under the **same** `state` key (`oauth:profile:` prefix,
10-minute TTL) — this is the profile `loginWithOAuth` later redeems — then `302`s to whichever
`redirect_uri` was recorded for this `state` (validated against the same allow-list as above,
falling back to `frontendOrigin` if unsafe), appending `?state=...`.
**Errors:** provider-side `error` query param, or a token-exchange/profile-fetch failure, both `302`
to `{origin}/auth/login?error=...` rather than a JSON error (this is a browser redirect target, not
an API a client parses).
**Used by:** nothing in this codebase calls this URL directly — the OAuth **provider itself**
redirects the user's browser here as the last leg of the standard authorization-code flow. Frontend's
own callback landing point is a **different** URL
([`/api/auth/oauth/[provider]/callback`](../../../frontend/auth/api.md#oauth--no-apiserver-file-at-all), which this
backend route redirects *to*); Mobile's is the `flutterboilerplate://oauth/callback` deep link.

### Get a stored OAuth profile

**Kind:** REST · **`GET /auth/oauth/:provider/profile`** · query `state`
**Source:** [`oauth.controller.ts#L166-L170`](../../../../nest-js-boilerplate/src/auth/oauth/oauth.controller.ts)
**Response:** the stored [`OAuthProfileResult`](../../../../nest-js-boilerplate/src/auth/oauth/oauth-providers.ts)
(`email`, `name`, `provider`, `providerAccountId`) — deletes it from Redis on read (single-use).
**Errors:** generic `UnauthorizedException` if `state` is unknown/expired/already consumed.
**Used by:** nobody in current frontend/mobile code. ⚠ `BE-005` (resolved) — this method's own doc
comment says it "requires an authenticated session," but **no guard is applied** (no
`@UseGuards`, no class-level guard either); it is also dead — `loginWithOAuth` retrieves the profile
itself, server-to-server, via the same `OAuthService.retrieveProfile` this delegates to, so no current
client-facing code path calls this REST endpoint at all.

## The device-handshake exception

Lives in the separate `devices/` module (out of this pass's scope — see
[project boundary note](#known-issues)), but auth's login flow depends on it directly, so it's
documented here as the one exception.

### Device handshake

**Kind:** REST · **`POST /devices/handshake`**
**Source:** [`device.controller.ts#L13-L16`](../../../../nest-js-boilerplate/src/devices/device.controller.ts),
logic in [`device.service.ts#L81-L94`](../../../../nest-js-boilerplate/src/devices/device.service.ts) (`DeviceService.handshake`)
**Auth:** none — public, called on every page load before any session exists.
**Response:** `{ deviceToken: string }`.
**Behavior:** if a `device_token` cookie is already present, slides its expiry and echoes it back
unchanged — **no `Device` row is created here**, only at actual login/register (`resolveForLogin`,
see [README.md § Session model](./README.md)). If absent, mints a fresh random "landing" token and
sets the cookie. This is what lets a never-logged-in visitor already carry a stable device identity
into their eventual first login.
**Used by:** Frontend — the
[`/api/auth/device-handshake` BFF route](../../../frontend/auth/api.md#server--bff-srcapiserverauth)
proxies this 1:1; called from `useAuth.tsx`'s mount effect (both the SSR-hydrated and cold-load
branches) before anything else. Mobile —
[`device_handshake.dart`](../../../../flutter-boilerplate/lib/api/server/auth/device_handshake.dart)
calls this path **directly**, no BFF hop (confirmed: the REST path matches this controller's own
native route, not a frontend-namespaced one — see
[conventions.md § 9](../../../../docs/conventions.md#9-flutters-call-shapes--verify-per-vertical-dont-assume-bff-involvement)).

## Known issues

- [BE-004](../../../issues.md#be-004) — `register`/`resetPassword`/`changePassword`'s
  `validatePasswordStrength()` length/variety checks are unreachable dead code; the DTO's
  class-validator rule is already stricter.
- `BE-005` (resolved) — `GET /auth/oauth/:provider/profile` has no auth guard
  despite its own doc comment claiming one; also dead code.
- `CROSS-008` (resolved) — `GET /auth/oauth/providers` is dead; both clients
  hardcode their own provider list instead.
- `CROSS-009` (resolved) — the web MFA challenge form has no backup-code UI path;
  Flutter's does.
- `MOB-002` (resolved) — Flutter's `currentUserProvider` is defined twice with
  incompatible types; one copy is dead.
- Full findings with severity and evidence are filed in [`issues.md`](../../../issues.md).
