# Wire Crypto (backend)

**Source:** [`nest-js-boilerplate/src/wire-crypto/`](../../../../nest-js-boilerplate/src/wire-crypto/) ·
**Category:** [Messaging & Realtime](../README.md)

> ⚠ **This module replaced a different, deleted system.** See
> [../../../issues.md#cross-004](../../../issues.md#cross-004) before reading further if you've seen
> references elsewhere (old comments, prior documentation) to X3DH, Double Ratchet, safety numbers,
> or a `src/e2ee/` module — that system was removed 2026-08-04 and nothing below describes it. This
> module is a trusted-server transport + at-rest encryption scheme, not client-side E2EE.

## What this module owns

Two independent, server-held-key encryption layers, both using XChaCha20-Poly1305
(`@noble/ciphers`):

1. **Transport encryption** (`WireCryptoService`) — encrypts individual WebSocket frames between one
   client connection and the server, so a network observer (browser devtools of a MITM proxy, a
   compromised CDN hop) sees only ciphertext. Per-session or per-device shared secret, derived via
   ECDH (X25519) + HKDF-SHA256 from a server keypair (held in Redis) and the client's public key
   (posted at handshake).
2. **At-rest encryption** (`StorageCryptoService`) — encrypts message bodies before they're written
   to Postgres (`Message`/`RoomMessage`'s `v`/`ct`/`nonce` columns), so a raw DB dump or backup leak
   reveals only ciphertext. Per-user key (DMs) or one shared key (rooms), both HKDF-derived from a
   single server-held `MESSAGE_STORAGE_MASTER_KEY`.

**Neither layer is end-to-end.** The server holds (or can re-derive) every key involved in both —
compromise of the running server process or its `MESSAGE_STORAGE_MASTER_KEY`/Redis exposes message
content. This is a deliberate trade-off (see
[../../../architecture.md § Wire encryption](../../../architecture.md#wire-encryption--trusted-server-transport--at-rest-encryption)):
smaller crypto surface, and the server can still do things a true E2EE system couldn't (content
moderation, search) — at the cost of the stronger guarantee the previous design attempted.

## Key material

| Key | Location | Lifecycle |
|---|---|---|
| Server session X25519 keypair | Redis, per session | Generated at token issue (`AuthTokenService.issueTokens`), TTL = session TTL, deleted on logout |
| Client device/session X25519 keypair | Browser IndexedDB / app-local storage | Generated lazily on first handshake, never leaves the client |
| Transport shared secret | ECDH(serverPriv, clientPub) + HKDF-SHA256 | Derived at handshake, cached server-side in Redis |
| At-rest storage key | `MESSAGE_STORAGE_MASTER_KEY` env (falls back to a hash of `ENCRYPTION_KEY` in dev — logged as a warning, not for production use) → HKDF per user (DMs) or a single fixed context (rooms) | Server-only, never transmitted |

Replay protection on the transport layer uses a per-session monotonic sequence counter
(`c2sSeq`/`s2cSeq`, both directions), returned by the handshake/server-key endpoints below and
tracked in Redis.

## Interfaces

| Kind | Source | Documented in |
|---|---|---|
| REST controller | [`wire-crypto.controller.ts`](../../../../nest-js-boilerplate/src/wire-crypto/wire-crypto.controller.ts) | [endpoints.md](./endpoints.md) |

`WireCryptoService` and `StorageCryptoService` are also consumed directly (not just via the REST
controller) by [`realtime.gateway.ts`](../realtime/README.md) (transport encrypt/decrypt on every
WS emit) and by [`messaging`](../messaging/README.md)'s DM/room services (at-rest encrypt/decrypt).

## Wire format (transport layer)

```ts
interface WireEnvelopeV2 { v: 2; nonce: string; ct: string }
```

Any WS frame carrying this shape (`data.v === 2 && typeof data.nonce === 'string' && typeof
data.ct === 'string'`) is detected and decrypted centrally by `realtime.gateway.ts`'s
`handleMessage()` before normal frame routing — every registered handler (including
[messaging](../messaging/README.md)'s) always sees a plaintext, already-decrypted payload. Every
outbound `.send()` on an authenticated socket is likewise wrapped once, centrally, in the gateway's
`connection` handler.

**On decrypt failure** (desynced sequence counter, corrupted frame): the server sends a plaintext
`{type:'crypto-resync'}` control frame (throttled to once per 5s per device —
`RESYNC_THROTTLE_MS`) rather than closing the connection; the client re-handshakes and adopts the
server's counters. No key material is invalidated by a resync.

## At-rest storage format

`Message`/`RoomMessage` rows carry nullable `v`/`ct`/`nonce` columns. `StorageCryptoService`:

- `encryptForStorage(userId, payload)` / `decryptFromStorage(userId, envelope)` — DM bodies, one key
  per user.
- `encryptForRoom(payload)` / `decryptForRoom(envelope)` — room bodies, one shared key for all rooms.
- `flattenEnvelope(envelope)` — if the caller already supplied a transport-shaped envelope with
  string `v`/`ct`/`nonce`, store it as-is instead of re-encrypting; returns `null` (triggering
  server-side encryption instead) for anything malformed.
- `toEnvelope(row)` — the inverse, rebuilding `{v, ct, nonce}` from stored columns for decrypt calls;
  returns `null` for legacy rows missing any of the three (pre-encryption history).

Source: [`storage-crypto.service.ts`](../../../../nest-js-boilerplate/src/wire-crypto/storage-crypto.service.ts).

## Depends on

`AuthContractsModule` (`forwardRef`, for session identity). Exports `WireCryptoService` and
`StorageCryptoService` for [`realtime`](../realtime/README.md) and
[`messaging`](../messaging/README.md) to consume directly.

## Used by

Every WS connection ([realtime](../realtime/README.md)) and every message send
([messaging](../messaging/README.md)) — not a page-level dependency in its own right. The frontend
handshake trigger is `useSessionCrypto.ts` (documented in
[frontend/v1/messages/hooks.md](../../../frontend/v1/messages/hooks.md)).

## Known issues

- [CROSS-004](../../../issues.md#cross-004) — surviving pre-rewrite documentation described a
  different system this module replaced; resolved by this rewrite, kept here as a pointer in case
  the old confusion resurfaces from cached knowledge, comments, or memory elsewhere.
