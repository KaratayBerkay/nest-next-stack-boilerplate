# MFA (backend)

**Source:** [`nest-js-boilerplate/src/mfa/`](../../../../nest-js-boilerplate/src/mfa/) ·
**Category:** [Identity & Access](../README.md) · **Interface docs:** [endpoints.md](./endpoints.md)

## What this module owns

TOTP-based (RFC 6238) two-factor authentication: enrollment, verification, and disable, plus one-time
backup codes. One resolver (`MfaResolver`), one service (`MfaService`). Wired into
[`app.module.ts`](../../../../nest-js-boilerplate/src/app.module.ts)'s `CORE_MODULES` directly. See
[`mfa.module.ts`](../../../../nest-js-boilerplate/src/mfa/mfa.module.ts).

Only **one** MFA method exists end-to-end: `MfaFactor.method` is a `MfaMethod` enum in
[`schema.prisma`](../../../../nest-js-boilerplate/prisma/schema.prisma) with columns for a WebAuthn
credential (`credentialId`, `publicKey`, `counter`, `transports`) sitting unused alongside the TOTP
`secret` column — `MfaService` only ever writes/reads `method: 'TOTP'`. Worth knowing before assuming
WebAuthn is reachable from either app: it isn't (see [Known issues](#known-issues)).

## Enrollment flow

1. **`enroll(userId)`** — generates a random Base32 secret (`otplib`'s `generateSecret()`) and an
   `otpauthUrl` (for a QR code), deletes any prior *unverified* TOTP factor for the user (so retrying
   enrollment doesn't accumulate pending rows), and stores the new factor with the secret **encrypted
   at rest** via [`CryptoService.encrypt`](../../../../nest-js-boilerplate/src/common/crypto/crypto.service.ts)
   — `verifiedAt: null` until step 2 confirms it.
2. **`verify(userId, code)`** — looks up the pending (`verifiedAt: null`) factor, decrypts its secret,
   verifies the TOTP code. On success: stamps `verifiedAt`/`lastUsedAt`, sets `user.mfaEnabled = true`,
   deletes any prior backup codes and generates 10 new ones (`randomBytes(5).toString('hex')`, 10 hex
   chars each) — **the plaintext codes are returned exactly once**; only their SHA-256 hashes
   (`MfaBackupCode.codeHash`) are persisted. All three writes + an outbox `mfa.enabled` event share one
   `$transaction`.
3. **`disable(userId, code)`** — requires `user.mfaEnabled` (else `400 EX_AUTH_MFA_NOT_ENABLED`),
   re-verifies a fresh TOTP code against the *verified* factor, then deletes the factor + all backup
   codes and flips `mfaEnabled = false`. **The user must prove current possession of their
   authenticator to turn MFA off** — this is the self-service path.

## `AdminResolver.resetMfa` vs. the user's own `disable`

**`resetMfa(targetUserId)`** (called only from
[authorization/admin.resolver.ts](../authorization/README.md#setusertier--setuserstatus--resetmfa-in-detail),
`SUPERADMIN`-gated there — this module has no route to it of its own) is a **different, TOTP-free**
code path: no code verification, straight `deleteMany` on both `MfaFactor` and `MfaBackupCode`, then
`mfaEnabled = false`. It exists for the "user is locked out, lost their authenticator and their backup
codes" support case. Returns `false` (no-op) if the target didn't have MFA enabled — it does not throw.

## Interfaces

| Kind | Source | Documented in |
|---|---|---|
| GraphQL resolver | [`mfa.resolver.ts`](../../../../nest-js-boilerplate/src/mfa/mfa.resolver.ts) | [endpoints.md](./endpoints.md) |

All three mutations guard with `SessionAuthGuard` only — see
[identity-access/auth](../auth/README.md). No role/tier gate: any authenticated user manages their
*own* MFA. (The admin-only reset path lives in `authorization/`'s resolver, not here — see above.)

## Depends on

`AuthModule` (`SessionAuthGuard`), `CryptoService` (TOTP secret at rest), `OutboxService` (audit
events for enable/disable/admin-reset — see
[architecture.md § Transactional outbox](../../../architecture.md#transactional-outbox--reliable-event-emission)).

## Used by

| App | Page / Screen | Calls |
|---|---|---|
| Frontend | [settings/security](../../../frontend/v1/settings/security/page.md) | `enrollMfa`, `verifyMfa`, `disableMfa` |
| Mobile | [security](../../../mobile/v1/settings/security/screen.md) (`mfa_enroll/` sub-screen + the security screen's own MFA toggle) | same three |

The *login-time* MFA challenge (a different flow: verifying a 6-digit code to complete sign-in, not
managing the factor) calls a **different** mutation,
[`verifyLoginMfa`](../auth/endpoints.md#verify-a-login-mfa-code) — defined in
[`auth.resolver.ts`](../../../../nest-js-boilerplate/src/auth/), not this module. It's colocated in
the same frontend/mobile source files as this module's calls (`api/server/auth/mfa.ts` /
`lib/api/server/auth/mfa.dart` bundle both concerns — see
[frontend api.md](../../../frontend/v1/settings/security/api.md) and
[mobile api.md](../../../mobile/v1/settings/security/api.md) for exactly which functions are which)
but belongs to [identity-access/auth](../auth/README.md)'s login flow — not duplicated here. The
"resend" half of the same challenge,
[`resendLoginCode`](../auth/endpoints.md#resend-a-login-mfa-code), is the same story.

## Known issues

- **`MfaFactor`'s WebAuthn columns are unused.** `credentialId`/`publicKey`/`counter`/`transports`
  exist on the Prisma model and `MfaMethod` is an enum (implying more than one method was planned),
  but `MfaService` hard-codes `method: 'TOTP'` on every read and write — `grep -rn "WebAuthn\|FIDO2"
  src/mfa` returns nothing beyond the unused columns themselves. Not necessarily a bug (may simply be
  unbuilt), but worth knowing before assuming a second factor type is reachable. Logged as
  `BE-008` (resolved — fixed 2026-09-03: the WebAuthn columns were dropped from `MfaFactor` by migration).
