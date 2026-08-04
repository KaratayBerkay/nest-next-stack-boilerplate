# End-to-End Encryption — Normative Reference

Single source of truth for the E2EE system in chat (DMs + rooms).  
Related: [REALTIME.md](REALTIME.md) (WebSocket transport), `docs/progress/end-2-end.md` (design + tracker).

## 1 — Protocol overview

| Property | Value |
| --- | --- |
| Key agreement | X3DH (Extended Triple Diffie-Hellman) |
| Ongoing DM ratchet | Double Ratchet (symmetric + DH ratchet steps) |
| Room encryption | Forward-only sender-key hash chain per sender per epoch |
| Message encryption | XChaCha20-Poly1305 (192-bit nonce, safe with random per-message nonces) |
| Identity signing | Ed25519 |
| Key agreement curves | X25519 |
| KDF / MAC | HKDF-SHA256, HMAC-SHA256 |
| Crypto library | `@noble/curves`, `@noble/ciphers`, `@noble/hashes` (Cure53-audited, pure TS) |
| Enable/disable | Per-user `User.e2eeEnabled` (default on), toggled at Settings → Privacy. Gates encryption of outgoing messages only — decryption of anything received is always attempted regardless of the viewer's own setting, since a viewer with the identity keys needed to decrypt already holds them independent of it. Backend is otherwise flag-agnostic. |

## 2 — Per-device identity and prekey bundle

Each device generates keys once on first use of Messages/Chat Rooms:

| Key | Algorithm | Published to server? |
| --- | --- | --- |
| Identity Signing Key `IK_sig` | Ed25519 | Public half only |
| Identity Agreement Key `IK_dh` | X25519 | Public half + self-signature by `IK_sig` |
| Signed Prekey `SPK` | X25519 (rotated ~30d) | Public half + signature by `IK_sig` |
| One-Time Prekeys `OPK_1..N` | X25519 (consumed once) | Public halves, one at a time |

Private keys never leave IndexedDB. Only public halves + signatures are POSTed to the server.

## 3 — Key storage

### 3.1 Server-side (Redis, session-scoped)

| Redis key | Type | Content |
| --- | --- | --- |
| `e2ee:bundle:<deviceId>` | String (JSON) | Public key bundle + userId |
| `e2ee:otpk:<deviceId>` | List (JSON elements) | One-time prekeys, claimed via atomic `LPOP` |
| `e2ee:active-device:<userId>` | String | Device ID holding this user's active bundle |

All keys share a dedicated `E2EE_BUNDLE_TTL` (default 30d) — deliberately *not* the
session's own `SESSION_TTL` (900s): a bundle must stay claimable by other users through
ordinary idle periods where its owner makes no requests of their own to slide it. It's
still refreshed opportunistically on every authenticated request
(`TokenStoreService.extendTTL()` → `E2eeKeysService.touchTTL()`), so an active session's
bundle effectively never expires — the long default is the floor for an idle-but-not-logged-out
device. Explicitly `DEL`eted on logout (`AuthSessionService` lifecycle hooks) so keys are
removed immediately, not left to expire.

### 3.2 Client-side (IndexedDB, `e2ee` database)

| Store | Content |
| --- | --- |
| `identity` | Device private keys (signing, agreement, signed prekey, one-time prekeys) |
| `ratchet` | Per-peer Double Ratchet session state |
| `senderKeys` | Per-room sender key chain |
| `safetyNumbers` | Last-seen peer fingerprints for verification |

Trust model: origin-scoped, not additionally encrypted at rest — same as WhatsApp Web,
Signal Desktop. Device loss = key loss.

## 4 — REST API endpoints

All endpoints require `SessionAuthGuard`.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/e2ee/keys/bundle` | Register/replace this device's bundle |
| `POST` | `/api/e2ee/keys/bundle/:userId/claim` | Fetch a peer's bundle, consuming one OPK |
| `GET` | `/api/e2ee/keys/status/:userId` | Check if a user has registered keys |
| `GET` | `/api/e2ee/keys/identity/:userId` | Get a peer's public identity signing key |
| `POST` | `/api/e2ee/keys/one-time-prekeys` | Replenish the one-time prekey pool |
| `POST` | `/api/e2ee/keys/wipe` | Self-service key wipe for this device |
| `POST` | `/api/e2ee/rooms/:roomId/sender-keys` | Publish wrapped sender keys |
| `GET` | `/api/e2ee/rooms/:roomId/sender-keys` | Fetch wrapped sender keys |
| `GET` | `/api/e2ee/rooms/:roomId/members` | Get room member device IDs |

### Single-active-device enforcement

`registerBundle()` checks `e2ee:active-device:<userId>`. If a different device is active,
that device's bundle + OTPK are deleted before the new ones are written. A superseded
device's keys stop being discoverable immediately.

## 5 — Wire format

### 5.1 DM message envelope (`MessageEnvelopeV1`)

```ts
{
  v: 1;
  senderDeviceId: string;
  ciphertext: string;     // base64
  nonce: string;          // base64
  header: { dhPub: string; pn: number; n: number };
  x3dhInit?: {            // present only on first message of a session
    identityKey: string;
    ephemeralKey: string;
    usedSignedPrekeyId: number;
    usedOneTimePrekeyId?: string;
  };
}
```

### 5.2 Room message envelope (`RoomMessageEnvelopeV1`)

```ts
{
  v: 1;
  senderDeviceId: string;
  ciphertext: string;     // base64
  nonce: string;          // base64
  senderKeyEpoch: number;
  chainIndex: number;
}
```

### 5.3 Inner plaintext (`MessagePlaintextV1`)

```ts
{
  text?: string;
  attachment?: {
    key: string;          // symmetric key (hex)
    nonce: string;        // nonce (base64)
    originalName: string;
    originalType: string;
    originalSize: number;
  };
}
```

Attachment symmetric key travels inside the encrypted payload — server never sees
plaintext file content, filename, or MIME type for encrypted messages.

## 6 — Room encryption

Rooms use sender-key chains (forward-only hash chain per sender per epoch), not pairwise
ratchets:

- Each member maintains their own chain per room epoch.
- Distribution reuses the DM pairwise mechanism (a room-key-distribution message is a
  DM-shaped ciphertext whose plaintext is `{roomId, epoch, chainKey}`).
- **Rotation**: mandatory on member leave/removal; recommended additionally on a 7-day
  schedule. Rotation is client-initiated, lazy, per-sender — each member compares the
  room's `membershipVersion` against their last distributed epoch before sending.
- Joining members never get past epochs — enforced cryptographically (they're never
  handed wrapped keys from prior epochs).

## 7 — Safety numbers

Per-user fingerprint: `SHA-256(userId || IK_sig_pub)` displayed as grouped decimal
digits with a QR code (via `qrcode.react`). A DM's safety number is both parties'
fingerprints in canonical (lexicographic) order.

- Verification state stored in IndexedDB (`safetyNumbers` store).
- On bundle refresh, compare the peer's current fingerprint against the last-seen one.
  Mismatch shows a "safety number changed" warning banner.
- For rooms: the same modal, invoked per-member from the room's member list.

## 8 — Plaintext leak fixes

Two mandatory server-side fixes applied when E2EE went live:

1. **Push notification preview** (`messaging-dm.service.ts`): encrypted messages send a
   generic "New message" label instead of truncating the plaintext body.
2. **Conversation preview** (`getConversations` + live WS renew): for encrypted rows,
   the raw `envelope` is sent to the client instead of `message.body` — the client's own
   decrypt function produces the preview.

## 9 — Data model

### Postgres columns (additive, nullable)

`Message` and `RoomMessage` both gained:
- `encrypted Boolean @default(false)`
- `algVersion Int?`
- `envelope Json? @db.JsonB`
- `body` became nullable (legacy rows keep it; new encrypted rows leave it null)

### Room membership

- `Room` — `id`, `slug` (unique), `type`, `membershipVersion`
- `RoomParticipant` — `roomId`, `userId`, `role`, `joinedAt`, `leftAt`
- `RoomSenderKeyDistribution` — wrapped sender keys for offline member delivery

## 10 — Migration tradeoffs

- **Existing plaintext rows** are left as-is, distinguished forever by `encrypted = false`.
- **No silent downgrade** — missing recipient keys block the send visibly.
- **Public keys are session-scoped** — discoverable only while a session is alive.
- **Search/moderation over content** is permanently impossible for encrypted messages.
- **Push notification previews** degrade to "New message" for encrypted conversations.
- **Device loss is unrecoverable** in this single-device-first phase.
- **Chat-rooms remain open-to-join** — room E2EE does not protect against legitimate
  members who join after the message was sent.
