/**
 * Low-level cryptographic primitives wrapping @noble/* libraries.
 *
 * This is the ONLY file in the crypto module that directly imports @noble/*
 * — all other files consume these functions.  This keeps the audit surface
 * small and makes it trivial to swap implementations if needed.
 */

import { ed25519, x25519 } from "@noble/curves/ed25519.js";
import { chacha20poly1305, xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";

// ── Encoding helpers ────────────────────────────────────────────────────

function toHex(data: Uint8Array): string {
  return bytesToHex(data);
}

function fromHex(hex: string): Uint8Array {
  return hexToBytes(hex);
}

// Spreading a whole typed array into String.fromCharCode(...data) blows
// the JS engine's max-call-arguments limit (~64K-128K depending on engine)
// for anything larger than that — attachments are explicitly expected to
// be megabytes (§4 of the plan), so this must chunk rather than spread.
const TO_BASE64_CHUNK_SIZE = 8192;

function toBase64(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i += TO_BASE64_CHUNK_SIZE) {
    const chunk = data.subarray(i, i + TO_BASE64_CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

// ── Identity key generation (§1.2) ──────────────────────────────────────

/** Generate an Ed25519 identity signing key pair. */
export function generateIdentitySigningKey(): {
  privateKey: string;
  publicKey: string;
} {
  const priv = ed25519.utils.randomSecretKey();
  const pub = ed25519.getPublicKey(priv);
  return { privateKey: toHex(priv), publicKey: toHex(pub) };
}

/** Generate an X25519 identity agreement key pair. */
export function generateIdentityAgreementKey(): {
  privateKey: string;
  publicKey: string;
} {
  const priv = x25519.utils.randomSecretKey();
  const pub = x25519.getPublicKey(priv);
  return { privateKey: toHex(priv), publicKey: toHex(pub) };
}

/** Sign data with an Ed25519 private key. Returns hex-encoded signature. */
export function ed25519Sign(
  privateKeyHex: string,
  message: Uint8Array,
): string {
  return toHex(ed25519.sign(message, fromHex(privateKeyHex)));
}

/** Verify an Ed25519 signature. */
export function ed25519Verify(
  publicKeyHex: string,
  signatureHex: string,
  message: Uint8Array,
): boolean {
  return ed25519.verify(fromHex(signatureHex), message, fromHex(publicKeyHex));
}

// ── Signed prekey generation (§1.2) ─────────────────────────────────────

/** Generate an X25519 signed prekey and sign it with the identity signing key. */
export function generateSignedPrekey(identitySigningKeyHex: string): {
  privateKey: string;
  publicKey: string;
  signature: string;
} {
  const priv = x25519.utils.randomSecretKey();
  const pub = x25519.getPublicKey(priv);
  const signature = ed25519Sign(identitySigningKeyHex, pub);
  return { privateKey: toHex(priv), publicKey: toHex(pub), signature };
}

/** Generate a batch of X25519 one-time prekeys. */
export function generateOneTimePrekeys(
  count: number,
): Array<{ keyId: string; privateKey: string; publicKey: string }> {
  const prekeys = [];
  for (let i = 0; i < count; i++) {
    const priv = x25519.utils.randomSecretKey();
    const pub = x25519.getPublicKey(priv);
    prekeys.push({
      keyId: `otpk-${Date.now()}-${i}`,
      privateKey: toHex(priv),
      publicKey: toHex(pub),
    });
  }
  return prekeys;
}

// ── X25519 Diffie-Hellman (§1.3, §1.4) ─────────────────────────────────

/** Compute X25519 DH shared secret. Returns hex. */
export function x25519SharedSecret(
  privateKeyHex: string,
  publicKeyHex: string,
): string {
  return toHex(
    x25519.getSharedSecret(fromHex(privateKeyHex), fromHex(publicKeyHex)),
  );
}

/** Generate an ephemeral X25519 keypair for X3DH. */
export function generateEphemeralKey(): {
  privateKey: string;
  publicKey: string;
} {
  const priv = x25519.utils.randomSecretKey();
  const pub = x25519.getPublicKey(priv);
  return { privateKey: toHex(priv), publicKey: toHex(pub) };
}

// ── HKDF (§1.3, §1.4) ──────────────────────────────────────────────────

/** HKDF-SHA256 derive. Returns hex. */
export function hkdfDerive(
  ikm: Uint8Array,
  salt: Uint8Array,
  info: string,
  length = 32,
): string {
  const infoBytes = new TextEncoder().encode(info);
  const derived = hkdf(sha256, ikm, salt, infoBytes, length);
  return toHex(derived);
}

/** HKDF-SHA256 for X3DH: derive session key from DH outputs. */
export function x3dhDeriveSessionKey(
  dh1: string,
  dh2: string,
  dh3: string,
  dh4?: string,
): string {
  const parts = [fromHex(dh1), fromHex(dh2), fromHex(dh3)];
  if (dh4) parts.push(fromHex(dh4));
  const ikm = concatBytes(...parts);
  const salt = new Uint8Array(32); // empty salt
  return hkdfDerive(ikm, salt, "X3DH-SK", 32);
}

// ── Chain ratchet (§1.4) ────────────────────────────────────────────────

/** HMAC chain step: derive messageKey and nextChainKey. */
export function chainStep(chainKeyHex: string): {
  messageKey: string;
  nextChainKey: string;
} {
  const ck = fromHex(chainKeyHex);
  const messageKey = hmac(sha256, ck, new Uint8Array([0x01]));
  const nextChainKey = hmac(sha256, ck, new Uint8Array([0x02]));
  return {
    messageKey: toHex(messageKey),
    nextChainKey: toHex(nextChainKey),
  };
}

/** Root ratchet step: derive new rootKey and chainKey from DH output. */
export function rootStep(
  rootKeyHex: string,
  dhOutputHex: string,
): { rootKey: string; chainKey: string } {
  const salt = fromHex(rootKeyHex);
  const ikm = fromHex(dhOutputHex);
  const info = new TextEncoder().encode("DR-RK");
  const derived = hkdf(sha256, ikm, salt, info, 64);
  const rootKey = toHex(derived.slice(0, 32));
  const chainKey = toHex(derived.slice(32, 64));
  return { rootKey, chainKey };
}

// ── XChaCha20-Poly1305 encryption (§1.4) ────────────────────────────────

/** Encrypt with XChaCha20-Poly1305. Returns { ciphertext, nonce } as base64. */
export function xchachaEncrypt(
  keyHex: string,
  plaintext: Uint8Array,
  aad?: Uint8Array,
): { ciphertext: string; nonce: string } {
  const key = fromHex(keyHex);
  const nonce = crypto.getRandomValues(new Uint8Array(24));
  const cipher = xchacha20poly1305(key, nonce, aad);
  const ciphertext = cipher.encrypt(plaintext);
  return {
    ciphertext: toBase64(ciphertext),
    nonce: toBase64(nonce),
  };
}

/** Decrypt with XChaCha20-Poly1305. Returns plaintext Uint8Array. */
export function xchachaDecrypt(
  keyHex: string,
  ciphertextBase64: string,
  nonceBase64: string,
  aad?: Uint8Array,
): Uint8Array {
  const key = fromHex(keyHex);
  const nonce = fromBase64(nonceBase64);
  const ciphertext = fromBase64(ciphertextBase64);
  const cipher = xchacha20poly1305(key, nonce, aad);
  return cipher.decrypt(ciphertext);
}

// ── AAD construction (§1.4) ─────────────────────────────────────────────

/** Build AAD for DM message encryption: senderId||recipientId||algVersion. */
export function buildAad(
  senderId: string,
  recipientId: string,
  algVersion: number,
): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(`${senderId}|${recipientId}|${algVersion}`);
}

// ── Fingerprint (§1.6) ──────────────────────────────────────────────────

/** Compute a device fingerprint: SHA-256(userId || IK_sig_pub). */
export function computeFingerprint(
  userId: string,
  identityKey: string,
): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId + identityKey);
  return toHex(sha256(data));
}

// ── Utility ──────────────────────────────────────────────────────────────

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// Re-export hex utilities for other crypto files
export { toHex, fromHex, toBase64, fromBase64 };
