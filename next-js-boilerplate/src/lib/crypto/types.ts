/**
 * Type definitions for the E2EE protocol (§1.2, §1.7 of the plan).
 *
 * These types mirror the wire envelope shapes and key material stored in
 * IndexedDB.  They are deliberately versioned (v: 1) so the protocol can
 * evolve without breaking existing sessions.
 */

// ── Device identity (§1.2) ──────────────────────────────────────────────

export interface DeviceIdentity {
  /** Protocol version — currently 1. */
  v: 1;
  /** Opaque device identifier (matches the auth-session deviceId). */
  deviceId: string;
  /** Ed25519 public key — identity signing key. */
  identitySigningKey: string;
  /** X25519 public key — identity agreement key. */
  identityAgreementKey: string;
  /** Ed25519 signature of identityAgreementKey by identitySigningKey. */
  identityAgreementKeySignature: string;
  /** ISO timestamp of creation. */
  createdAt: string;
}

// ── Signed prekey (§1.2) ────────────────────────────────────────────────

export interface SignedPrekey {
  keyId: number;
  publicKey: string;
  signature: string;
  createdAt: string;
}

// ── One-time prekey (§1.2) ──────────────────────────────────────────────

export interface OneTimePrekey {
  keyId: string;
  publicKey: string;
}

// ── X3DH bundle (what gets registered with the server) ──────────────────

export interface DeviceBundle {
  identitySigningKey: string;
  identityAgreementKey: string;
  identityAgreementKeySignature: string;
  signedPrekey: string;
  signedPrekeySignature: string;
  signedPrekeyId: number;
  previousSignedPrekey?: string;
  previousSignedPrekeyId?: number;
  algVersion: number;
}

// ── X3DH handshake preamble (sent in first message, §1.3) ───────────────

export interface X3dhInit {
  identityKey: string;
  ephemeralKey: string;
  usedSignedPrekeyId: number;
  usedOneTimePrekeyId?: string;
}

// ── Double Ratchet header (§1.4) ────────────────────────────────────────

export interface RatchetHeader {
  dhPub: string;
  pn: number;
  n: number;
}

// ── Wire envelope (§1.7) ────────────────────────────────────────────────

export interface MessagePlaintextV1 {
  text?: string;
  attachment?: {
    key: string;
    nonce: string;
    originalName: string;
    originalType: string;
    originalSize: number;
  };
}

export interface MessageEnvelopeV1 {
  v: 1;
  senderDeviceId: string;
  ciphertext: string;
  nonce: string;
  header: RatchetHeader;
  x3dhInit?: X3dhInit;
}

export interface RoomMessageEnvelopeV1 {
  v: 1;
  senderDeviceId: string;
  ciphertext: string;
  nonce: string;
  senderKeyEpoch: number;
  chainIndex: number;
}

// ── Per-peer ratchet session state (stored in IndexedDB) ────────────────

export interface RatchetSession {
  /** Peer's user ID. */
  peerUserId: string;
  /** Peer's device ID (for this session). */
  peerDeviceId: string;
  /** Root key (HKDF output). */
  rootKey: string;
  /** Sending chain key. */
  sendingChainKey: string;
  /** Receiving chain key. */
  receivingChainKey: string;
  /** Our current DH ratchet public key. */
  dhPub: string;
  /** Our current DH ratchet private key (hex). */
  dhPriv: string;
  /** The last DH ratchet public key we received from the peer. */
  peerDhPub: string;
  /** Number of messages sent in current sending chain. */
  sendingChainIndex: number;
  /** Highest receiving chain index seen. */
  receivingChainIndex: number;
  /** Number of messages received in current receiving chain. */
  receivingChainCount: number;
  /** Skipped message keys: Map of `${messageKeyIndex}` -> messageKey. */
  skippedMessageKeys: Record<string, string>;
  /** ISO timestamp of last activity. */
  updatedAt: string;
}

// ── Per-room sender key chain (§1.5, stored in IndexedDB) ───────────────

export interface SenderKeyChain {
  roomId: string;
  epoch: number;
  chainKey: string;
  chainIndex: number;
}
