/**
 * Double Ratchet implementation (§1.4 of the plan).
 *
 * Symmetric-key ratchet (chain step) + DH-ratchet step on direction change.
 * Provides forward secrecy + post-compromise recovery for DM sessions.
 *
 * Skipped-message-key cache is mandatory: this app's delivery (WS + Redis
 * pub/sub + REST fallback) can reorder messages.  A bounded map of
 * derived-but-unused message keys per peer (~200 cap, evict oldest) prevents
 * out-of-order arrivals from desynchronizing the ratchet.
 */

import {
  chainStep,
  rootStep,
  x25519SharedSecret,
  generateEphemeralKey,
  xchachaEncrypt,
  xchachaDecrypt,
  buildAad,
} from "./primitives";
import { getRatchetSession, setRatchetSession } from "./store";
import type { RatchetSession, RatchetHeader } from "./types";

// ── Constants ───────────────────────────────────────────────────────────

const ALG_VERSION = 1;
const MAX_SKIPPED_KEYS = 200;

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Initialize a new sending ratchet session after X3DH completes.
 *
 * The initiator (Alice) calls this after x3dhInitiate() to create the
 * first outbound ratchet session.
 *
 * Both sides start with SK as their initial chain key.  The DH ratchet
 * step fires when a *new* DH public key appears in a message header
 * on a subsequent exchange — not the very first message.
 */
export async function initSenderSession(
  peerUserId: string,
  peerDeviceId: string,
  sessionKey: string,
): Promise<void> {
  const dh = generateEphemeralKey();

  const session: RatchetSession = {
    peerUserId,
    peerDeviceId,
    rootKey: sessionKey,
    sendingChainKey: sessionKey, // initial chain = SK
    receivingChainKey: sessionKey, // initial chain = SK (for first reply)
    dhPub: dh.publicKey,
    dhPriv: dh.privateKey,
    peerDhPub: "", // unknown until first reply
    sendingChainIndex: 0,
    receivingChainIndex: 0,
    receivingChainCount: 0,
    skippedMessageKeys: {},
    updatedAt: new Date().toISOString(),
  };

  await setRatchetSession(session);
}

/**
 * Initialize a receiver ratchet session from Alice's X3DH first message.
 *
 * Bob calls this after x3dhRespond() to set up his side of the ratchet.
 * Both sending and receiving chains start at SK.
 */
export async function initReceiverSession(
  peerUserId: string,
  peerDeviceId: string,
  sessionKey: string,
  aliceDhPub: string,
): Promise<void> {
  const dh = generateEphemeralKey();

  const session: RatchetSession = {
    peerUserId,
    peerDeviceId,
    rootKey: sessionKey,
    sendingChainKey: sessionKey, // initial chain = SK (for replies)
    receivingChainKey: sessionKey, // initial receiving chain = SK
    dhPub: dh.publicKey,
    dhPriv: dh.privateKey,
    peerDhPub: aliceDhPub, // track Alice's initial DH key
    sendingChainIndex: 0,
    receivingChainIndex: 0,
    receivingChainCount: 0,
    skippedMessageKeys: {},
    updatedAt: new Date().toISOString(),
  };

  await setRatchetSession(session);
}

/**
 * Encrypt a plaintext message for a peer.
 *
 * Performs the symmetric chain step, derives a message key, encrypts with
 * XChaCha20-Poly1305, and advances the sending chain.  Returns the
 * ciphertext, nonce, and header (which goes on the wire in the clear).
 */
export async function ratchetEncrypt(
  peerUserId: string,
  plaintext: Uint8Array,
  senderId: string,
  recipientId: string,
): Promise<{
  ciphertext: string;
  nonce: string;
  header: RatchetHeader;
}> {
  const session = await getRatchetSession(peerUserId);
  if (!session) {
    throw new Error(`No ratchet session for peer ${peerUserId}`);
  }

  // Derive message key from the sending chain
  const { messageKey, nextChainKey } = chainStep(session.sendingChainKey);

  // Encrypt
  const aad = buildAad(senderId, recipientId, ALG_VERSION);

  const cipherInput = xchachaEncrypt(messageKey, plaintext, aad);

  // Build header
  const header: RatchetHeader = {
    dhPub: session.dhPub,
    pn: session.sendingChainIndex,
    n: session.sendingChainIndex,
  };

  // Advance chain
  session.sendingChainKey = nextChainKey;
  session.sendingChainIndex += 1;
  session.updatedAt = new Date().toISOString();
  await setRatchetSession(session);

  return {
    ciphertext: cipherInput.ciphertext,
    nonce: cipherInput.nonce,
    header,
  };
}

/**
 * Decrypt a ciphertext message from a peer.
 *
 * May perform a DH-ratchet step if the header's dhPub differs from the
 * last known.  Handles out-of-order messages via the skipped-message-key
 * cache.  Returns the plaintext Uint8Array.
 */
export async function ratchetDecrypt(
  peerUserId: string,
  ciphertext: string,
  nonce: string,
  header: RatchetHeader,
  senderId: string,
  recipientId: string,
): Promise<Uint8Array> {
  const session = await getRatchetSession(peerUserId);
  if (!session) {
    throw new Error(`No ratchet session for peer ${peerUserId}`);
  }

  // Check if we need a DH ratchet step (new DH key from peer, NOT the first message)
  // The first message carries the peer's initial DH key — we just record it.
  // The DH ratchet fires on SUBSEQUENT messages with a different DH key.
  if (session.peerDhPub && header.dhPub !== session.peerDhPub) {
    // Skip any pending receiving chain keys
    await skipMessageKeys(session, header.pn);

    // DH ratchet step
    const dhOutput = x25519SharedSecret(session.dhPriv, header.dhPub);
    const { rootKey, chainKey } = rootStep(session.rootKey, dhOutput);

    // Generate new DH keypair for our next send
    const newDh = generateEphemeralKey();

    session.rootKey = rootKey;
    session.receivingChainKey = chainKey;
    session.sendingChainKey = chainKey; // symmetric: both sides share after DH step
    session.dhPub = newDh.publicKey;
    session.dhPriv = newDh.privateKey;
    session.peerDhPub = header.dhPub; // track this peer DH key
    session.receivingChainIndex = 0;
    session.receivingChainCount = 0;
  } else if (header.n < session.receivingChainIndex) {
    // Out-of-order: use the cached skipped message key
    const idx = String(header.n);
    const cachedKey = session.skippedMessageKeys[idx];
    if (!cachedKey) {
      throw new Error(
        `Skipped message key for index ${header.n} not found in cache`,
      );
    }
    delete session.skippedMessageKeys[idx];

    const aad = buildAad(senderId, recipientId, ALG_VERSION);
    const plaintext = xchachaDecrypt(cachedKey, ciphertext, nonce, aad);

    session.receivingChainCount += 1;
    session.updatedAt = new Date().toISOString();
    await setRatchetSession(session);
    return plaintext;
  } else {
    // Same ratchet epoch, in-order or first message — skip ahead if needed
    await skipMessageKeys(session, header.n);
  }

  // Derive message key from receiving chain
  const { messageKey, nextChainKey } = chainStep(session.receivingChainKey);

  // Decrypt
  const aad = buildAad(senderId, recipientId, ALG_VERSION);
  const plaintext = xchachaDecrypt(messageKey, ciphertext, nonce, aad);

  // Advance receiving chain
  session.receivingChainKey = nextChainKey;
  session.receivingChainIndex = header.n + 1;
  session.receivingChainCount += 1;
  session.updatedAt = new Date().toISOString();
  await setRatchetSession(session);

  return plaintext;
}

// ── Skipped message key handling ────────────────────────────────────────

/**
 * Derive and cache message keys for any skipped chain indices.
 * Called before advancing the receiving chain during a DH ratchet step
 * or when processing an out-of-order message.
 */
async function skipMessageKeys(
  session: RatchetSession,
  until: number,
): Promise<void> {
  let count = session.receivingChainIndex;
  while (count < until) {
    const { messageKey, nextChainKey } = chainStep(session.receivingChainKey);
    session.skippedMessageKeys[String(count)] = messageKey;
    session.receivingChainKey = nextChainKey;
    count += 1;

    // Enforce cap — evict oldest entries
    const keys = Object.keys(session.skippedMessageKeys);
    if (keys.length > MAX_SKIPPED_KEYS) {
      const sorted = keys.sort((a, b) => Number(a) - Number(b));
      const toRemove = sorted.slice(0, keys.length - MAX_SKIPPED_KEYS);
      for (const k of toRemove) {
        delete session.skippedMessageKeys[k];
      }
    }
  }
  session.receivingChainIndex = count;
}

// ── Helpers ─────────────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
