# ADR 006: End-to-end encryption for chat

**Status:** Accepted

## Context

Chat messages (DMs and rooms) were fully plaintext at every layer: `Message.body`/`RoomMessage.body` were plain `String @db.Text` columns, the WS gateway and REST/GraphQL endpoints moved plaintext JSON, and the server actively read plaintext for push-notification previews and conversation-list previews. There was no crypto library, no key storage, and no device-identity concept anywhere in either application.

The goal is to make the backend and browser incapable of reading message content — only ciphertext should ever cross the wire or land in Postgres — for both direct messages and chat rooms.

Three scoping decisions were made before implementation:

1. **Pragmatic audited-primitives** over a pre-built Double Ratchet library (libsignal, MLS). Build a lightweight custom protocol on Cure53-audited `@noble/*` primitives.
2. **Single-active-device first.** A user's key material lives on one browser at a time; multi-device fan-out is deferred.
3. **Both DMs and rooms in scope**, DMs first. Rooms require a real membership table as a prerequisite.

## Decision

### Protocol

- **DMs**: X3DH handshake for first contact, Double Ratchet (symmetric + DH ratchet steps) for ongoing sessions. The DH-ratchet step provides post-compromise self-healing that a pure hash ratchet cannot.
- **Rooms**: Forward-only sender-key hash chain per sender per epoch. Distribution reuses the DM pairwise mechanism. Rotation on membership change and optionally on a time basis.
- **Attachments**: Symmetric XChaCha20-Poly1305 key per file, traveling inside the message's encrypted plaintext. Encrypted before upload to MinIO; decrypted lazily on render.

### Cryptographic primitives

| Purpose | Primitive | Library |
| --- | --- | --- |
| Identity/prekey signing | Ed25519 | `@noble/curves/ed25519` |
| Key agreement | X25519 | `@noble/curves/ed25519` (x25519 export) |
| Message encryption | XChaCha20-Poly1305 | `@noble/ciphers/chacha` |
| KDF / MAC | HKDF-SHA256, HMAC-SHA256 | `@noble/hashes` |

XChaCha20-Poly1305 was chosen over AES-256-GCM because its 192-bit nonce is safe to pick with `randomBytes()` per message with no cross-message nonce bookkeeping. AES-GCM's 96-bit nonce is not safe at volume without a synchronized counter.

### Key storage

- **Server (Redis)**: Public key bundles, one-time prekeys, active-device index. Session-scoped TTL, refreshed in lockstep with `TokenStoreService.extendTTL()`. Explicitly deleted on logout.
- **Client (IndexedDB)**: All private key material, ratchet session state, sender-key chains, safety-number verification state. Origin-scoped, not additionally encrypted at rest.

### Safety numbers

Per-user fingerprint = `SHA-256(userId || IK_sig_pub)` displayed as grouped decimal digits with a QR code. DM safety number = both parties' fingerprints in canonical order. Verification state in IndexedDB with "safety number changed" warning on fingerprint mismatch.

### Wire format

`Message`/`RoomMessage` gained nullable `envelope Json? @db.JsonB`, `encrypted Boolean`, `algVersion Int?`. `body` became nullable. Legacy plaintext rows keep `body`; new encrypted rows leave it null and use `envelope`.

### Backend API

New `src/e2ee/` module with REST endpoints behind `SessionAuthGuard`: bundle registration, OPK-atomic claim, status check, identity key retrieval, one-time prekey replenishment, device wipe, and room sender-key distribution.

## Alternatives considered

### libsodium-wrappers (WASM)

Rejected for engineering simplicity: no async WASM init on the send/receive path, no `.wasm` asset to serve, easier to audit line-by-line. Not a CSP constraint — the chat pages' CSP already permits `'unsafe-eval'`/`'unsafe-inline'`.

### Pre-built Double Ratchet (libsignal)

Rejected because the "pragmatic, no prebuilt library" constraint is about not taking a dependency on libsignal. The actual Double Ratchet construction is reimplemented with our own primitives.

### MLS (Messaging Layer Security)

Deferred. MLS solves multi-device and large-group key management but adds significant complexity (a WASM or native dependency, a federation protocol) that isn't justified for the current single-device, small-room scope.

### Durable key storage (Postgres)

Rejected in favor of session-scoped Redis. The tradeoff: offline conversation-initiation is impossible (you can't message someone who isn't logged in), but keys can never be read from a data-at-rest breach of Postgres. This is a deliberate security-vs-availability tradeoff.

## Consequences

- **Positive:** Server/DB compromise exposes no message content.
- **Positive:** Passive network observation sees only ciphertext.
- **Positive:** Push-notification and conversation-preview plaintext leaks are closed.
- **Positive:** Safety numbers provide human-verifiable protection against server-side key substitution.
- **Negative:** Device loss = key loss (no backup mechanism in this phase).
- **Negative:** Push notifications degrade to "New message" for encrypted conversations.
- **Negative:** Search/moderation over message content is permanently impossible for encrypted messages.
- **Negative:** Cannot initiate a new encrypted conversation with a fully logged-out user.
- **Negative:** Chat rooms remain open-to-join — room E2EE does not protect against legitimate members who join after the message was sent.
