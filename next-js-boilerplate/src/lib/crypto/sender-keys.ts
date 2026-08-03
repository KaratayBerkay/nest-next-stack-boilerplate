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
import { xchachaEncrypt, xchachaDecrypt } from "./primitives.js";
import { getSenderKeyChain, setSenderKeyChain } from "./store.js";
import type { SenderKeyChain, RoomMessageEnvelopeV1 } from "./types.js";

// ── Constants ──────────────────────────────────────────────────────────

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
  roomId: string,
): Promise<SenderKeyChain> {
  const existing = await getSenderKeyChain(roomId);
  if (existing) return existing;

  // Generate a random initial chain key
  const chainKey = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));

  const chain: SenderKeyChain = {
    roomId,
    epoch: 0,
    chainKey,
    chainIndex: 0,
  };
  await setSenderKeyChain(chain);
  return chain;
}

// ── Rotate sender key chain ───────────────────────────────────────────

/**
 * Start a new epoch: generate a fresh chain key, reset chain index.
 * Returns the new chain and the old chain's key material (for distribution).
 */
export async function rotateSenderKeyChain(
  roomId: string,
): Promise<{ newChain: SenderKeyChain; previousEpoch: number }> {
  const oldChain = await getSenderKeyChain(roomId);
  const previousEpoch = oldChain?.epoch ?? 0;

  const newChainKey = bytesToHex(crypto.getRandomValues(new Uint8Array(32)));

  const newChain: SenderKeyChain = {
    roomId,
    epoch: previousEpoch + 1,
    chainKey: newChainKey,
    chainIndex: 0,
  };
  await setSenderKeyChain(newChain);

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
  const chain = await getOrCreateSenderKeyChain(roomId);
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
  await setSenderKeyChain(chain);

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
 * Wrap a sender key chain for distribution to a recipient device.
 * The wrapping uses XChaCha20 with a derived shared key.
 * In the full protocol this would use the pairwise DM ratchet session;
 * for now we use a simplified key-wrapping approach.
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
