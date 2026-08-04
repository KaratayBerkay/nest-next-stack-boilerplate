/**
 * Sender-key chain management for room encryption (§1.5).
 *
 * Each member maintains their own forward-only hash chain per room "epoch".
 * A new epoch is created when membership changes (mandatory rotation) or on
 * a time-based schedule (defense-in-depth). Distribution of the new chain key
 * to existing members happens via the pairwise DM mechanism.
 */

import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import {
  xchachaEncrypt,
  xchachaDecrypt,
  x25519SharedSecret,
  hkdfDerive,
} from "./primitives";
import { getSenderKeyChain, setSenderKeyChain } from "./store";
import type { SenderKeyChain, RoomMessageEnvelopeV1 } from "./types";

// ── Constants ──────────────────────────────────────────────────────────

const MAX_CHAIN_ADVANCE = 100_000;

const CHAIN_KEY_LABEL = new TextEncoder().encode("SK-CRK");
const MESSAGE_KEY_LABEL = new TextEncoder().encode("SK-MK");

// ── Chain step (§1.5) ─────────────────────────────────────────────────

/** Advance the chain: derive { messageKey, nextChainKey } from chainKey. */
function chainStep(chainKeyHex: string): {
  messageKey: string;
  nextChainKey: string;
} {
  const chainKey = hexToBytes(chainKeyHex);

  const messageKey = new Uint8Array(hmac(sha256, chainKey, MESSAGE_KEY_LABEL));
  const nextChainKey = new Uint8Array(hmac(sha256, chainKey, CHAIN_KEY_LABEL));

  return {
    messageKey: bytesToHex(messageKey),
    nextChainKey: bytesToHex(nextChainKey),
  };
}

// ── AAD construction for rooms ────────────────────────────────────────

/** Build AAD for room message: roomId||senderDeviceId||epoch||chainIndex. */
function buildRoomAad(
  roomId: string,
  senderDeviceId: string,
  epoch: number,
  chainIndex: number,
): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(`${roomId}|${senderDeviceId}|${epoch}|${chainIndex}`);
}

// ── Get or create sender key chain ────────────────────────────────────

/**
 * Get the current sender key chain for a room, or create a new one (epoch 0).
 * Caller must check membershipVersion before using this — if stale, rotate first.
 */
export async function getOrCreateSenderKeyChain(
  ownUserId: string,
  roomId: string,
): Promise<SenderKeyChain> {
  const existing = await getSenderKeyChain(ownUserId, roomId);
  if (existing) return existing;

  // Generate a random initial chain key
  const chainKey = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));

  const chain: SenderKeyChain = {
    roomId,
    epoch: 0,
    chainKey,
    chainIndex: 0,
  };
  await setSenderKeyChain(ownUserId, chain);
  return chain;
}

// ── Rotate sender key chain ───────────────────────────────────────────

/**
 * Start a new epoch: generate a fresh chain key, reset chain index.
 * Returns the new chain and the old chain's key material (for distribution).
 */
export async function rotateSenderKeyChain(
  ownUserId: string,
  roomId: string,
): Promise<{ newChain: SenderKeyChain; previousEpoch: number }> {
  const oldChain = await getSenderKeyChain(ownUserId, roomId);
  const previousEpoch = oldChain?.epoch ?? 0;

  const newChainKey = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));

  const newChain: SenderKeyChain = {
    roomId,
    epoch: previousEpoch + 1,
    chainKey: newChainKey,
    chainIndex: 0,
  };
  await setSenderKeyChain(ownUserId, newChain);

  return { newChain, previousEpoch };
}

// ── Encrypt room message ──────────────────────────────────────────────

/**
 * Encrypt a plaintext message using the current sender key chain.
 * Advances the chain index after encryption.
 * Returns the envelope and the current chain (for caller to persist).
 */
export async function encryptRoomMessage(
  roomId: string,
  senderDeviceId: string,
  plaintext: string,
  senderId: string,
): Promise<{
  envelope: RoomMessageEnvelopeV1;
  chain: SenderKeyChain;
}> {
  const chain = await getOrCreateSenderKeyChain(senderId, roomId);

  // Decrypting our own echoed-back messages (history reload, the WS delivery
  // of our own send) looks up the chain under `${roomId}:${senderId}` — the
  // same key ensureReceivedSenderKey uses for chains received from other
  // members — never under the bare `roomId` this function's own send-state
  // lives under. A sender never wraps a copy of its key for itself (it
  // already has it), so without this there is nothing for that lookup to
  // ever find and every self-sent message is permanently undecryptable to
  // its own sender. Mirror the received-chain convention: once per epoch,
  // at chainIndex 0 (before this call advances chain.chainKey past it),
  // snapshot the epoch-start key under the self-keyed slot so decrypt can
  // fast-forward it exactly like a chain received from someone else.
  if (chain.chainIndex === 0) {
    await setSenderKeyChain(senderId, {
      roomId: `${roomId}:${senderId}`,
      epoch: chain.epoch,
      chainKey: chain.chainKey,
      chainIndex: 0,
    });
  }

  const { messageKey, nextChainKey } = chainStep(chain.chainKey);

  const aad = buildRoomAad(
    roomId,
    senderDeviceId,
    chain.epoch,
    chain.chainIndex,
  );
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const { ciphertext, nonce } = xchachaEncrypt(messageKey, plaintextBytes, aad);

  const envelope: RoomMessageEnvelopeV1 = {
    v: 1,
    senderDeviceId,
    ciphertext,
    nonce,
    senderKeyEpoch: chain.epoch,
    chainIndex: chain.chainIndex,
  };

  // Advance the chain
  chain.chainKey = nextChainKey;
  chain.chainIndex += 1;
  await setSenderKeyChain(senderId, chain);

  return { envelope, chain };
}

// ── Decrypt room message ──────────────────────────────────────────────

/**
 * Decrypt a room message envelope using the sender's key chain.
 * The caller must have received the sender's chain key via the distribution
 * mechanism. For now, this uses a locally-stored per-sender chain.
 */
export async function decryptRoomMessage(
  envelope: RoomMessageEnvelopeV1,
  senderChainKey: string,
  roomId: string,
  senderId: string,
): Promise<string> {
  // envelope.chainIndex is wire-supplied and unauthenticated until the AEAD
  // tag check below — cap how far we'll fast-forward so a malicious or
  // corrupted envelope can't force an unbounded synchronous HMAC loop.
  if (envelope.chainIndex > MAX_CHAIN_ADVANCE) {
    throw new Error(
      `Refusing to advance sender-key chain ${envelope.chainIndex} steps (max ${MAX_CHAIN_ADVANCE})`,
    );
  }

  // Advance the chain to the right position
  let chainKey = senderChainKey;
  let chainIndex = 0;

  // Fast-forward to the target chain index
  while (chainIndex < envelope.chainIndex) {
    const { nextChainKey } = chainStep(chainKey);
    chainKey = nextChainKey;
    chainIndex++;
  }

  // Derive the message key for this position
  const { messageKey, nextChainKey: _next } = chainStep(chainKey);

  const aad = buildRoomAad(
    roomId,
    envelope.senderDeviceId,
    envelope.senderKeyEpoch,
    envelope.chainIndex,
  );

  const plaintext = xchachaDecrypt(
    messageKey,
    envelope.ciphertext,
    envelope.nonce,
    aad,
  );
  return new TextDecoder().decode(plaintext);
}

// ── Key wrapping for distribution (§1.5) ──────────────────────────────

/**
 * Derive the per-recipient secret used to wrap a room sender-key chain,
 * via a static X25519 DH between both parties' identity agreement keys
 * (the same stable keys used to bootstrap X3DH), HKDF'd with a distinct
 * domain-separation label so this secret can never collide with an actual
 * DM ratchet/X3DH derivation even if computed from the same DH output.
 * By DH symmetry, the sender and the recipient each compute the identical
 * value from their own private key + the other's public key — no round
 * trip, no consumed one-time-prekey, since both agreement keys are stable
 * public values fetched via the non-consuming identity/status endpoints.
 */
export function deriveRoomWrapSecret(
  myAgreementPrivateKey: string,
  peerAgreementPublicKey: string,
): string {
  const dh = x25519SharedSecret(myAgreementPrivateKey, peerAgreementPublicKey);
  return hkdfDerive(
    hexToBytes(dh),
    new Uint8Array(32),
    "E2EE-room-sender-key-wrap-v1",
  );
}

/**
 * Wrap a sender key chain for distribution to a recipient device, using a
 * secret only the sender and that specific recipient can derive (see
 * deriveRoomWrapSecret) — the server that stores/relays the wrapped blob
 * never has access to it.
 */
export function wrapSenderKey(
  chainKey: string,
  epoch: number,
  wrappingKeyHex: string,
): { wrappedKey: string; wrapNonce: string } {
  const plaintext = new TextEncoder().encode(
    JSON.stringify({ chainKey, epoch }),
  );
  const { ciphertext, nonce } = xchachaEncrypt(wrappingKeyHex, plaintext);
  return { wrappedKey: ciphertext, wrapNonce: nonce };
}

/**
 * Unwrap a sender key chain received from distribution.
 */
export function unwrapSenderKey(
  wrappedKey: string,
  wrapNonce: string,
  wrappingKeyHex: string,
): { chainKey: string; epoch: number } {
  const plaintext = xchachaDecrypt(wrappingKeyHex, wrappedKey, wrapNonce);
  return JSON.parse(new TextDecoder().decode(plaintext));
}

// ── Distribution orchestration (§1.5, §3) ──────────────────────────────

/**
 * Rotate (if membership has moved on) and (re-)distribute this device's
 * room sender-key chain to every other current member, wrapped
 * per-recipient-device. Client-initiated, lazy, per-sender: called right
 * before a send; a no-op if nothing has changed since the last time this
 * device distributed for this room.
 */
export async function distributeSenderKeyIfNeeded(
  roomSlug: string,
  ownUserId: string,
  ownDeviceId: string,
): Promise<void> {
  const { fetchRoomMembersServer } =
    await import("@/api/server/e2ee/room-members");
  const { membershipVersion, members } = await fetchRoomMembersServer(roomSlug);

  const existingChain = await getSenderKeyChain(ownUserId, roomSlug);
  const lastDistributed = existingChain?.lastDistributedMembershipVersion;
  if (
    existingChain &&
    lastDistributed !== undefined &&
    lastDistributed >= membershipVersion
  ) {
    return; // already distributed for the current membership state
  }

  const chain = existingChain
    ? (await rotateSenderKeyChain(ownUserId, roomSlug)).newChain
    : await getOrCreateSenderKeyChain(ownUserId, roomSlug);

  const { getIdentityAgreementPrivateKey } = await import("./identity");
  const myAgreementPrivateKey = await getIdentityAgreementPrivateKey(ownUserId);

  const { fetchPeerAgreementKey } =
    await import("@/api/server/e2ee/peer-identity");
  const { getBundleStatusServer } =
    await import("@/api/server/e2ee/bundle-status");
  const { publishSenderKeysServer } =
    await import("@/api/server/e2ee/publish-sender-keys");

  const otherMembers = members.filter((m) => m.userId !== ownUserId);
  const wrapped: Array<{
    recipientDeviceId: string;
    wrappedKey: string;
    wrapNonce: string;
  }> = [];

  for (const member of otherMembers) {
    // Both lookups are the non-consuming endpoints — no one-time-prekey is
    // spent just to distribute a room key (only a real DM handshake does).
    const [peerAgreementKey, status] = await Promise.all([
      fetchPeerAgreementKey(member.userId),
      getBundleStatusServer(member.userId),
    ]);
    if (!peerAgreementKey || !status.registered || !status.deviceId) {
      continue; // member hasn't enabled secure messaging yet — they'll
      // catch up next time this device rotates after they register.
    }

    const secret = deriveRoomWrapSecret(
      myAgreementPrivateKey,
      peerAgreementKey,
    );
    const { wrappedKey, wrapNonce } = wrapSenderKey(
      chain.chainKey,
      chain.epoch,
      secret,
    );
    wrapped.push({ recipientDeviceId: status.deviceId, wrappedKey, wrapNonce });
  }

  if (wrapped.length > 0) {
    await publishSenderKeysServer(roomSlug, {
      senderDeviceId: ownDeviceId,
      epoch: chain.epoch,
      keys: wrapped,
    });
  }

  chain.lastDistributedMembershipVersion = membershipVersion;
  await setSenderKeyChain(ownUserId, chain);
}

// ── Reception orchestration (§1.5, §4) ─────────────────────────────────

/**
 * Ensure we have a locally-stored copy of `senderUserId`'s current room
 * sender-key chain, fetching and unwrapping any wrapped copies addressed
 * to this device that we haven't already applied. No-op if we're already
 * caught up. Call this before attempting to decrypt a room message from a
 * sender we don't yet have (or might have a stale epoch for).
 */
export async function ensureReceivedSenderKey(
  ownUserId: string,
  roomSlug: string,
  senderUserId: string,
  senderDeviceId: string,
): Promise<void> {
  const storeKey = `${roomSlug}:${senderUserId}`;
  const existing = await getSenderKeyChain(ownUserId, storeKey);

  const { fetchSenderKeysServer } =
    await import("@/api/server/e2ee/fetch-sender-keys");
  const wrappedEntries = await fetchSenderKeysServer(roomSlug);

  const candidates = wrappedEntries
    .filter((e) => e.senderDeviceId === senderDeviceId)
    .filter((e) => existing === null || e.epoch > existing.epoch)
    .sort((a, b) => b.epoch - a.epoch); // newest epoch first
  if (candidates.length === 0) return;

  const latest = candidates[0];

  const { fetchPeerAgreementKey } =
    await import("@/api/server/e2ee/peer-identity");
  const { getIdentityAgreementPrivateKey } = await import("./identity");
  const [peerAgreementKey, myAgreementPrivateKey] = await Promise.all([
    fetchPeerAgreementKey(senderUserId),
    getIdentityAgreementPrivateKey(ownUserId),
  ]);
  if (!peerAgreementKey) return;

  const secret = deriveRoomWrapSecret(myAgreementPrivateKey, peerAgreementKey);
  const { chainKey, epoch } = unwrapSenderKey(
    latest.wrappedKey,
    latest.wrapNonce,
    secret,
  );

  await setSenderKeyChain(ownUserId, {
    roomId: storeKey,
    epoch,
    chainKey,
    chainIndex: 0,
  });
}
