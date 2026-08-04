/**
 * Per-session wire encryption (trusted-server model).
 *
 * After WS connection the client generates an X25519 keypair, posts the
 * public half to `POST /api/crypto/handshake`, and receives the server's
 * public half. Both sides derive the same shared secret via ECDH + HKDF.
 *
 * Every message body crossing the wire is XChaCha20-Poly1305 ciphertext
 * bound to (sessionId, direction, seq) via AAD — matching the backend
 * implementation in `wire-crypto.service.ts` exactly.
 */

import { x25519 } from "@noble/curves/ed25519.js";
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { apiFetchJson } from "@/lib/api-client";

// ── Types ─────────────────────────────────────────────────────────────────

export interface WireEnvelopeV2 {
  v: 2;
  nonce: string; // base64
  ct: string; // base64
}

interface SessionState {
  sessionId: string;
  sharedKey: Uint8Array;
  clientPubHex: string;
  sendSeq: number;
  recvSeq: number;
}

// ── Module-level state (one per browser tab) ──────────────────────────────

let state: SessionState | null = null;

// ── HKDF info context (must match WIRE_CRYPTO_CONTEXT on server) ──────────

const WIRE_CRYPTO_CONTEXT = "session-crypto-v1";

// ── Key generation + handshake ────────────────────────────────────────────

/**
 * Perform the wire-crypto handshake. Call this once after the WS connection
 * is authenticated and you have the `sessionId`.
 *
 * 1. Generate an ephemeral X25519 keypair.
 * 2. POST the public key to `/api/crypto/handshake`.
 * 3. Derive the shared secret via ECDH + HKDF.
 */
export async function performHandshake(
  sessionId: string,
): Promise<{ clientPublicKey: string }> {
  const privKey = x25519.utils.randomSecretKey();
  const pubKey = x25519.getPublicKey(privKey);
  const clientPubHex = bytesToHex(pubKey);

  // Exchange public keys with the server.
  const { serverPublicKey } = await apiFetchJson<{ serverPublicKey: string }>(
    "/api/crypto/handshake",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicKey: clientPubHex }),
    },
  );

  // Derive the shared secret — must match server's setPeerPublicKey().
  const shared = x25519.getSharedSecret(privKey, hexToBytes(serverPublicKey));
  const info = new TextEncoder().encode(`${WIRE_CRYPTO_CONTEXT}:${sessionId}`);
  const derived = hkdf(sha256, shared, new Uint8Array(0), info, 32);

  state = {
    sessionId,
    sharedKey: derived,
    clientPubHex,
    sendSeq: 0,
    recvSeq: 0,
  };

  // Notify React hooks that a session is now active.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("session-crypto-change"));
  }

  return { clientPublicKey: clientPubHex };
}

// ── Encrypt (client → server) ─────────────────────────────────────────────

/**
 * Encrypt a payload for the server (client→server direction).
 * Returns a `WireEnvelopeV2` that the server will decrypt.
 */
export function encryptForServer(payload: unknown): WireEnvelopeV2 {
  if (!state)
    throw new Error("No wire-crypto session — call performHandshake first");

  const seq = ++state.sendSeq;
  const aad = buildAad(state.sessionId, "c2s", seq);
  const nonce = crypto.getRandomValues(new Uint8Array(24));

  const cipher = xchacha20poly1305(state.sharedKey, nonce, aad);
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ct = cipher.encrypt(plaintext);

  return {
    v: 2,
    nonce: uint8ToBase64(nonce),
    ct: uint8ToBase64(ct),
  };
}

// ── Decrypt (server → client) ─────────────────────────────────────────────

/**
 * Decrypt a `WireEnvelopeV2` received from the server (server→client direction).
 * Returns the parsed JSON payload.
 */
export function decryptFromServer(envelope: WireEnvelopeV2): unknown {
  if (!state)
    throw new Error("No wire-crypto session — call performHandshake first");
  if (envelope.v !== 2)
    throw new Error(`Unsupported wire envelope version: ${envelope.v}`);

  const seq = ++state.recvSeq;
  const aad = buildAad(state.sessionId, "s2c", seq);

  const nonce = base64ToUint8(envelope.nonce);
  const ct = base64ToUint8(envelope.ct);

  const cipher = xchacha20poly1305(state.sharedKey, nonce, aad);
  const plain = cipher.decrypt(ct);

  return JSON.parse(new TextDecoder().decode(plain));
}

// ── Session lifecycle ─────────────────────────────────────────────────────

/** Check whether a handshake has been performed. */
export function hasSession(): boolean {
  return state !== null;
}

/** Get the current session ID (or null). */
export function getSessionId(): string | null {
  return state?.sessionId ?? null;
}

/** Tear down the session (on logout / disconnect). */
export function destroySession(): void {
  state = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("session-crypto-change"));
  }
}

// ── AAD construction ──────────────────────────────────────────────────────

/**
 * Build the AAD string: `session-crypto-v1|<sessionId>|<direction>|<seq>`.
 * Must match `WireCryptoService.buildAad()` on the server exactly.
 */
function buildAad(
  sessionId: string,
  direction: "c2s" | "s2c",
  seq: number,
): Uint8Array {
  const aad = `${WIRE_CRYPTO_CONTEXT}|${sessionId}|${direction}|${seq}`;
  return new TextEncoder().encode(aad);
}

// ── Base64 helpers (chunked to avoid call-stack overflow on large buffers) ─

const CHUNK = 8192;

function uint8ToBase64(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i += CHUNK) {
    const chunk = data.subarray(i, i + CHUNK);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
