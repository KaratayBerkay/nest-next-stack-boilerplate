# common/crypto (backend)

**Source:** [`nest-js-boilerplate/src/common/crypto/`](../../../../../nest-js-boilerplate/src/common/crypto/) ·
**Category:** [Platform / Core](../../README.md) · **Parent:** [common](../README.md)

## What this owns

General-purpose, dependency-free (`node:crypto` only) cryptographic primitives shared by auth/MFA/mail
flows — deliberately **not** the same code path as [`id-codec`](../id-codec/README.md)/[`token-codec`](../token-codec/README.md)
below, which solve a narrower, different problem (deterministic transport-boundary encoding of
uuids/tokens). `CryptoService` (`@Global()`, via
[`crypto.module.ts`](../../../../../nest-js-boilerplate/src/common/crypto/crypto.module.ts)) provides:

- **`randomToken(bytes?)`** — a URL-safe random token, length driven by `TOKEN_LENGTH` (default 90
  chars) — used for verification tokens, password-reset tokens, backup codes.
- **`sha256(value)`** — deterministic hash for storing/looking up verification tokens: the raw token
  lives only in the email link the user clicks, never in the database.
- **`hmacSha256(key, data)`** / **`timingSafeEqual(a, b)`** — token-derivation building blocks, used
  by [identity-access/auth](../../../identity-access/auth/README.md)'s
  `TokenDerivationService` for the date-bound rbac/user-token scheme (see
  [../../architecture.md § Session authentication](../../../../architecture.md#session-authentication--redis-backed-four-token-compound-key)).
- **`encrypt(plaintext)` / `decrypt(packed)`** — AES-256-GCM, packed as `iv(12) | authTag(16) |
  ciphertext` into one `Buffer`. Used for MFA TOTP secrets at rest (`MfaFactor.secret`, a `Bytes`
  column) and — see [mail/README.md](../../mail/README.md#mxrouteaccountsservice--a-rotating-sender-mailbox-pool) —
  MXRoute pool-account passwords.
- **`hashSessionId(sessionId)`** — exported as a standalone function (not a `CryptoService` method) so
  call sites that don't already inject the service can use it too. One-way fingerprint of a session id
  safe to log or return over an API, where the raw value must never appear — `sessionId` **is** the
  refresh-token bearer credential (set directly as the refresh cookie, used as a plain Redis lookup
  key), not an opaque correlation id. Same algorithm as `CryptoService.sha256`, so a hash computed
  either way matches for cross-referencing. Used by
  [identity-access/sessions](../../../identity-access/sessions/README.md#sessionid-is-hashed-not-encrypted)'s
  `mySessions` query and by [activity-log](../../activity-log/README.md)'s event logger.

The encryption key itself: `ENCRYPTION_KEY` is accepted either as a 64-char hex string (used directly
as 32 bytes) or an arbitrary string (SHA-256-derived into 32 bytes) — resolved once in
`onModuleInit()`, not the constructor, since `ConfigService` reads must happen after the module's own
DI wiring completes.

## Interfaces

None. Internal-only.

## Depends on

Nothing backend-internal.

## Used by (who imports this, and why)

Broad — confirmed via grep across most of the token/secret-handling surface of the app:
`identity-access/auth` (token derivation, hashing), `identity-access/mfa` (TOTP secret encryption),
`identity-access/devices`, `messaging-realtime/messaging`, `messaging-realtime/realtime`,
`messaging-realtime/wire-crypto`, `messaging-realtime/upload`,
[`mail`](../../mail/README.md) (`MxrouteAccountsService`, pool-account password encryption), and
[`activity-log`](../../activity-log/README.md) (the standalone `hashSessionId` function, for log
correlation without leaking the raw session id). Not an exhaustive enumeration — this is the default
reach-for-it helper anywhere the app needs a hash, HMAC, random token, or small-value AES-GCM
encrypt/decrypt.

## Known issues

None specific to this module.
