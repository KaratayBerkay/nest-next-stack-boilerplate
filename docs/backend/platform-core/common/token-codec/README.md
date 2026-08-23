# common/token-codec (backend)

**Source:** [`nest-js-boilerplate/src/common/token-codec/`](../../../../../nest-js-boilerplate/src/common/token-codec/) ·
**Category:** [Platform / Core](../../README.md) · **Parent:** [common](../README.md)

## What this owns

The same idea as [`id-codec`](../id-codec/README.md) — deterministic, authenticated AES-256-GCM
encryption at the transport boundary — applied to **session tokens** (`rbac_token`, `user_token`,
`refresh_token`) instead of database uuids, so a value a client holds in a cookie isn't directly usable
to compute this app's Redis keys. Deliberately a **separate module** from `id-codec`, per its own
source comment: different concern (opaque session tokens, not database ids) and a different input
shape (arbitrary-length strings — 64-char hex HMAC outputs, ~90-char random tokens — not 16-byte
uuids), so `id-codec`'s uuid-shaped fixed-length packing doesn't apply. Same construction otherwise:
HMAC-derived deterministic nonce + AES-256-GCM, keyed from `ENCRYPTION_KEY` (domain-separated
`token-codec:enc`/`token-codec:mac` subkeys — different subkeys than `id-codec`'s, even though both
derive from the same root `ENCRYPTION_KEY`), base64url output, deterministic for the same reason
`id-codec` is deterministic: these values get compared/looked-up repeatedly across a session's
lifetime.

**`device_token` is deliberately excluded** — it's never run through this codec anywhere in the app.
Both web and Flutter independently SHA-256 its literal raw value client-side to derive wire-crypto
(session-transport encryption) keys, and the server must arrive at the identical hash; wrapping the
token here would break that shared, by-design-computable value. See
[messaging-realtime/wire-crypto](../../../messaging-realtime/wire-crypto/README.md) for the fuller
rationale.

## Exports

- **`encryptToken(plain)` / `decryptToken(token)`** — the core pair; `decryptToken` throws on anything
  that isn't a well-formed, untampered token.
- **`decryptTokenOrNull(value)`** — used at every real token-extraction call site (cookie/header
  readers across the app), where a malformed/tampered/missing value should be treated the same as
  "credential not present" rather than surfaced as a distinct error class.
- **`hashForRedisKey(value)`** — a *different* primitive from the encrypt/decrypt pair above: a
  deterministic, HMAC-keyed (by `TOKEN_DERIVATION_SECRET`, not `ENCRYPTION_KEY`) hash for turning a raw
  token/session id into a Redis key component. Replaces plain unkeyed SHA-256 (a public, reproducible
  computation — anyone holding the raw token could compute the exact Redis key themselves) in Redis key
  construction. Exported as a plain function rather than a `TokenDerivationService` method specifically
  so `WireCryptoService` (a different top-level module) can use it without introducing a new
  cross-module DI dependency.

## Interfaces

None. Internal-only — plain exported functions, no DI, no module wrapper (module-scoped key cache
instead, reset via `_resetKeysForTests()`).

## Depends on

Nothing backend-internal (reads `ENCRYPTION_KEY`/`TOKEN_DERIVATION_SECRET` from `process.env` directly,
same acceptance rule as [`common/crypto`](../crypto/README.md)/[`id-codec`](../id-codec/README.md):
64-char hex used directly, any other string SHA-256-derived).

## Used by (who imports this, and why)

Every cookie/header reader for the rbac/user/refresh tokens across the app — confirmed consumers
include `identity-access/auth`'s `SessionAuthGuard`/`AuthTokenService`/`TokenStoreService`,
[activity-log](../../activity-log/README.md)'s `OptionalAuthGuard`, and
`messaging-realtime/realtime`'s `RealtimeGateway` (decrypting the same cookies at the WS-upgrade
handshake — see [architecture.md § Realtime transport](../../../../architecture.md#realtime-transport--raw-websocket-not-socketio)).
`hashForRedisKey` specifically is used by `auth/token-store.service.ts` and
`messaging-realtime/wire-crypto`'s `WireCryptoService`. See
[identity-access/auth](../../../identity-access/auth/README.md) for the concrete four-token session
model these tokens belong to.

## Known issues

None specific to this module.
