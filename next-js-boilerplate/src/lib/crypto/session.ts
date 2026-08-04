/**
 * Per-device wire encryption (trusted-server model).
 *
 * On first handshake the client generates an X25519 keypair, persists it in
 * IndexedDB (with localStorage fallback), and exchanges public keys with the
 * server. The shared secret is derived via ECDH + HKDF. On subsequent page
 * reloads the stored keypair is reused — no new keypair is generated unless
 * the server has no matching keys (e.g. after a flush).
 *
 * Every message body crossing the wire is XChaCha20-Poly1305 ciphertext
 * bound to (deviceHash, direction, seq) via AAD — matching the backend
 * implementation in `wire-crypto.service.ts`.
 */

import { x25519 } from "@noble/curves/ed25519.js";
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { apiFetch, apiFetchJson } from "@/lib/api-client";
import {
  getDeviceToken,
  setDeviceToken,
  loadKeys,
  storeKeys,
  flushKeys,
  type DeviceKeyPair,
} from "@/lib/crypto/device-storage";

// ── Types ─────────────────────────────────────────────────────────────────

export interface WireEnvelopeV2 {
  v: 2;
  nonce: string; // base64
  ct: string; // base64
}

interface SessionState {
  deviceToken: string;
  sharedKey: Uint8Array;
  clientPubKey: string;
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
 * Flow:
 * 1. Read or generate an X25519 keypair (persisted in IndexedDB/localStorage).
 * 2. POST the public key to `/api/rest/crypto/handshake` with device token.
 * 3. Derive the shared secret via ECDH + HKDF.
 *
 * If the server already has keys for this device, it re-derives using the
 * stored server private key. If not, it generates a fresh server keypair.
 */
export async function performHandshake(
  sessionId: string,
): Promise<{ clientPublicKey: string }> {
  let deviceToken = getDeviceToken();

  // If the device token isn't in localStorage yet (race with
  // deviceHandshakeServer on first load), fetch it from the BFF endpoint
  // directly. This is a quick POST that slides the cookie and returns the
  // token value.
  if (!deviceToken) {
    try {
      const res = await fetch("/api/auth/device-handshake", {
        method: "POST",
      });
      if (res.ok) {
        const body = (await res.json()) as { deviceToken?: string };
        if (body.deviceToken) {
          setDeviceToken(body.deviceToken);
          deviceToken = body.deviceToken;
        }
      }
    } catch {
      /* ignore — will throw below if still null */
    }
  }

  if (!deviceToken) {
    throw new Error("No device token — cannot perform device handshake");
  }

  // Load existing keys or generate new ones.
  const keys: DeviceKeyPair | null = await loadKeys(deviceToken);
  let privKey: Uint8Array;
  let pubKey: Uint8Array;

  if (keys) {
    // Reuse persisted keypair.
    privKey = hexToBytes(keys.clientPrivKey);
    pubKey = hexToBytes(keys.clientPubKey);
  } else {
    // Generate fresh keypair and persist.
    privKey = x25519.utils.randomSecretKey();
    pubKey = x25519.getPublicKey(privKey);
    await storeKeys(deviceToken, {
      clientPrivKey: bytesToHex(privKey),
      clientPubKey: bytesToHex(pubKey),
    });
  }

  const clientPubHex = bytesToHex(pubKey);

  // Exchange public keys with the server via the REST proxy.
  const { serverPublicKey } = await apiFetchJson<{ serverPublicKey: string }>(
    "/api/rest/crypto/handshake",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-token": deviceToken,
      },
      body: JSON.stringify({ publicKey: clientPubHex }),
    },
  );

  // Derive the shared secret — must match server's setDevicePeerPublicKey().
  const shared = x25519.getSharedSecret(privKey, hexToBytes(serverPublicKey));
  const info = new TextEncoder().encode(
    `${WIRE_CRYPTO_CONTEXT}:${deviceToken}`,
  );
  const derived = hkdf(sha256, shared, new Uint8Array(0), info, 32);

  state = {
    deviceToken,
    sharedKey: derived,
    clientPubKey: clientPubHex,
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
  const aad = buildAad(state.deviceToken, "c2s", seq);
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
  const aad = buildAad(state.deviceToken, "s2c", seq);

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

/** Get the current device token (or null). */
export function getActiveDeviceToken(): string | null {
  return state?.deviceToken ?? null;
}

/** Tear down the session (on logout / disconnect). */
export function destroySession(): void {
  state = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("session-crypto-change"));
  }
}

/**
 * Re-key: flush stored keys and re-handshake with a fresh keypair.
 * Call this when decryption fails (stale keys / server flush).
 */
export async function reKey(
  sessionId: string,
): Promise<{ clientPublicKey: string } | null> {
  const deviceToken = getDeviceToken();
  if (!deviceToken) return null;

  // Flush old keys from IndexedDB and localStorage.
  await flushKeys(deviceToken);

  // Also tell the server to flush its device keys.
  try {
    await apiFetch("/api/rest/crypto/re-key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-device-token": deviceToken,
      },
    });
  } catch {
    // Best effort — server might already have flushed.
  }

  // Destroy current session state.
  destroySession();

  // Perform a fresh handshake with new keys.
  return performHandshake(sessionId);
}

// ── AAD construction ──────────────────────────────────────────────────────

/**
 * Build the AAD string: `session-crypto-v1|<deviceHash>|<direction>|<seq>`.
 * Must match `WireCryptoService.buildAad()` on the server exactly.
 */
function buildAad(
  context: string,
  direction: "c2s" | "s2c",
  seq: number,
): Uint8Array {
  const aad = `${WIRE_CRYPTO_CONTEXT}|${context}|${direction}|${seq}`;
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
