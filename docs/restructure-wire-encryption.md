# Wire-Encryption Restructure Plan

Status: Approved (2026-08-04) — replaces the peer-to-peer X3DH/Double-Ratchet E2EE with a
trusted-server, per-session transport-encryption scheme.

## Goal

No message text is ever readable by inspecting network traffic (browser Network tab, WS
frames, HTTP bodies) or by reading Postgres directly. The backend is a **trusted decryptor**:
it holds a per-session X25519 keypair in Redis, each browser holds a device keypair in
IndexedDB, ECDH derives a shared secret, and every message body crossing WS/HTTP is
XChaCha20-Poly1305 ciphertext bound to (sessionId, seq).

X3DH / Double Ratchet / sender keys / safety numbers / key backup are deleted. A future
ephemeral "tunnel message" feature can reintroduce X3DH without touching this transport layer.

## Design decisions (user-confirmed 2026-08-04)

1. **Trusted server** — backend participates in encrypt/decrypt (keys in Redis per session).
2. **Ciphertext-only at rest** — Postgres stores encrypted envelopes; keys never in Postgres.
3. **Replace** the existing X3DH/Double-Ratchet/sender-key code; keep `@noble` primitives and
   IndexedDB plumbing.

## Key material

| Key | Location | Lifecycle |
|---|---|---|
| Server session X25519 keypair | Redis `crypto:session:<sessionId>` `{priv,pub}` | Created in `AuthTokenService.issueTokens` (next to `sessionId`), TTL = session TTL, deleted on logout, extended with `extendTTL()` |
| Client device X25519 keypair | IndexedDB per-user DB `e2ee:<userId>`, store `deviceKeys` | One per browser+account, generated lazily, never leaves browser |
| Shared secret | ECDH(priv, peerPub) + HKDF-SHA256, context `session-crypto-v1:<sessionId>` | Derived on handshake; server caches in Redis |
| At-rest storage key | `MESSAGE_STORAGE_MASTER_KEY` env (32B hex) → HKDF per user | Server-only, never sent |

Replay protection: per-session monotonic `seq` counter (Redis, both directions) included in AAD.

## Wire format

```ts
interface WireEnvelopeV2 { v: 2; nonce: string; ct: string }
```

- WS out (client→server): `{type:'direct-message', envelope:{v:2,...}, tempId, ...}` —
  server decrypts, validates plaintext, saves, re-encrypts per recipient session.
- WS in (server→client): text-bearing fields encrypted under the recipient's shared key.
- HTTP: `POST /api/messages/:id/messages` body `{envelope:{v:2,...}}`; GET responses wrapped
  `{enc:{nonce,ct}}` on messaging routes (route-scoped interceptor).

## Deletions

### Backend — `nest-js-boilerplate/src/e2ee/`
Whole module (`e2ee-keys.service.ts`, `e2ee-keys.controller.ts`, `e2ee-rooms.service.ts`,
`e2ee-rooms.controller.ts`, `e2ee-lifecycle.tokens.ts`, `dto/`) except
`envelope-size.constraint.ts` (moves to `messaging/dto`). Prisma: drop
`RoomSenderKeyDistribution` + migration, drop `User.e2eeEnabled`, drop `e2ee` from auth
hooks/resolver.

### Frontend — `next-js-boilerplate/src/lib/crypto/`
`x3dh.ts`, `ratchet.ts`, `sender-keys.ts`, `identity.ts`, `fingerprint.ts`,
`key-recovery.ts`, `envelope.ts`, `e2ee-preference.ts`; rewrite `attachments.ts`, `chat.ts`.
Components: `E2eeErrorState.tsx`, `SafetyNumberModal.tsx`, `SafetyNumberBadge.tsx`,
`EncryptedAttachmentPreview.tsx`. Hooks: `useE2eeIdentity.ts`. API layers:
`src/api/server/e2ee/*`, `src/api/client/e2ee/*` (keep handshake/server-key). WS:
`e2ee-rekey` handler + `ChatView.tsx:149-166` rekey logic + "Re-syncing keys…" state.

## Additions

### Backend — `nest-js-boilerplate/src/wire-crypto/`
- `wire-crypto.service.ts` — Redis key store, ECDH/HKDF derive, `encryptForSession` /
  `decryptForSession`, seq counters.
- `storage-crypto.service.ts` — master-key at-rest encrypt/decrypt for DB writes/reads.
- `wire-crypto.controller.ts` — `POST /api/crypto/handshake` (`{clientPub}`),
  `GET /api/crypto/server-key` (re-login refetch).
- `session-crypto.interceptor.ts` — decrypt request / encrypt response on messaging routes.
- Integrations: `auth-token.service.ts` (keypair gen + `serverPub` in AuthPayload),
  `auth-session.service.ts` logout, `token-store.service.ts` `extendTTL`,
  `messaging-ws.gateway.ts` `handleDirectMessage:195` / `handleRoomMessage:321`,
  `messaging-dm.service.ts` `saveMessage:208` + `getConversations:78-113` (previews
  restored, drop "New message" degradation at `:343-356`), `messaging-room.service.ts:158-204`,
  `upload.controller.ts:138-176`.

### Frontend
- `src/lib/crypto/session.ts` — device keypair in IndexedDB, ECDH+HKDF, encrypt/decrypt, seq.
- `src/hooks/messages/useSessionCrypto.ts` — handshake on WS open + after login; no blocking
  gates (server always has keys).
- `realtime-client.ts` — `crypto-hello` frame on connect; encrypt/decrypt messaging frames.
- `event-dispatch.ts` / `renew-dispatch.ts` — session decrypt only; no `needsRekey`, no
  `ensureReceivedSenderKey`.
- `api-client.ts` — transparent wire encrypt/decrypt keyed by messaging route prefixes.

## Phase order (each lands green)

1. Backend crypto core (modules + handshake + session keypair + lifecycle). ✅ in progress
2. Backend messaging switch; delete `src/e2ee/`; Prisma migration fixes — **add missing
   migration for `envelope/encrypted/algVersion` columns** (present in schema.prisma but not
   in `prisma/migrations/`), drop sender-key table + `e2eeEnabled`.
3. Frontend session core (session.ts, handshake, WS+HTTP encryption, dispatch rewrites).
   Legacy v1 history is undecryptable by the new server — mark unreadable or purge.
4. Frontend deletions (protocol modules, components, hooks, API layers; restore previews).
5. Attachments — server decrypt/re-encrypt blob under storage key; metadata inside body.
6. Docs + tests + Playwright Network-tab verification (zero plaintext visible).

## Risks / tradeoffs

- Server can read messages — inherent to the chosen model; win is wire + at-rest opacity and
  a ~10x smaller crypto codebase.
- Master key loss = history unreadable; store in K8s secret, document rotation.
- Session key rotation is automatic (new keypair per login; Redis TTL cleans up).
- Old X3DH envelopes in Postgres are undecryptable by the new server — purge or mark legacy.
