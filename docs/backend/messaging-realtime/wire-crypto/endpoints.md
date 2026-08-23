# Wire Crypto — Endpoints

Module: [README.md](./README.md) · Source: [`nest-js-boilerplate/src/wire-crypto/`](../../../../nest-js-boilerplate/src/wire-crypto/)

## REST

Base path: `/api/crypto` (see `@Controller('api/crypto')` in
[`wire-crypto.controller.ts`](../../../../nest-js-boilerplate/src/wire-crypto/wire-crypto.controller.ts)).
**Auth:** `SessionAuthGuard` on the whole controller.

### Handshake

**Kind:** REST · **`POST /api/crypto/handshake`**
**Source:** [`wire-crypto.controller.ts#L43-L97`](../../../../nest-js-boilerplate/src/wire-crypto/wire-crypto.controller.ts)
**Request:** `{ publicKey: string }` (`HandshakeDto`) + optional `x-device-token` header.
**Behavior:** two modes, chosen by whether `x-device-token` is present:
- **Device-based** (header present): persistent keys keyed by `sha256(deviceToken)`. Registers the
  client's public key, returns the server's — the same device keeps the same server keypair across
  sessions/logins.
- **Session-based** (header absent): ephemeral keys, created fresh if none exist for this session id.

**Response:** `{ serverPublicKey, ok: true, device: boolean, c2sSeq, s2cSeq }`.
**Errors:** `400` (no session bound to the request) · `404` (device mode: key creation failed;
session mode: no session crypto keys registered — shouldn't happen given `createSessionKeys` is
called just before this check, but the controller checks anyway).
**Used by:** not page-specific on either platform — triggered from the shared realtime connection
setup, see [README.md § Used by](./README.md#used-by) for both platforms' exact call sites (Frontend
[`realtime-client.ts`](../../../../next-js-boilerplate/src/lib/realtime/realtime-client.ts) /
`useSessionCrypto.ts`; Mobile
[`api/server/crypto/handshake.dart`](../../../../flutter-boilerplate/lib/api/server/crypto/handshake.dart),
called from [`realtime_provider.dart`](../../../../flutter-boilerplate/lib/lib/realtime/realtime_provider.dart)).

### Re-key

**Kind:** REST · **`POST /api/crypto/re-key`**
**Source:** [`wire-crypto.controller.ts#L103-L121`](../../../../nest-js-boilerplate/src/wire-crypto/wire-crypto.controller.ts)
**Request:** no body, requires `x-device-token` header.
**Behavior:** flushes this device's stored keys server-side. The client must also flush its own
stored keys and perform a fresh handshake — this endpoint alone doesn't restore anything.
**Errors:** `400` (missing `x-device-token`).
**Response:** `{ ok: true }`.

### Get server key

**Kind:** REST · **`GET /api/crypto/server-key`**
**Source:** [`wire-crypto.controller.ts#L123-L158`](../../../../nest-js-boilerplate/src/wire-crypto/wire-crypto.controller.ts)
**Behavior:** re-fetches the current server public key (+ sequence counters) without generating a
new keypair — used to re-establish state after a page reload without a full re-handshake. Same
device/session branching as the handshake endpoint.
**Errors:** `400` (no session bound) · `404` (no keys registered for this device/session — client
must fall back to a full handshake).
