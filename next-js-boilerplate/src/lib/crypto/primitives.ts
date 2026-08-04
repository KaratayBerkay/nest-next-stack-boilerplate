/**
 * Low-level cryptographic primitives wrapping @noble/* libraries.
 *
 * This is the ONLY file in the crypto module that directly imports @noble/*
 * — all other files consume these functions.  This keeps the audit surface
 * small and makes it trivial to swap implementations if needed.
 */

import { x25519 } from "@noble/curves/ed25519.js";
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";

// ── Encoding helpers ────────────────────────────────────────────────────

function toHex(data: Uint8Array): string {
  return bytesToHex(data);
}

function fromHex(hex: string): Uint8Array {
  return hexToBytes(hex);
}

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

// ── X25519 Diffie-Hellman ───────────────────────────────────────────────

/** Generate an X25519 keypair. */
export function generateX25519Keypair(): {
  privateKey: string;
  publicKey: string;
} {
  const priv = x25519.utils.randomSecretKey();
  const pub = x25519.getPublicKey(priv);
  return { privateKey: toHex(priv), publicKey: toHex(pub) };
}

/** Compute X25519 DH shared secret. Returns hex. */
export function x25519SharedSecret(
  privateKeyHex: string,
  publicKeyHex: string,
): string {
  return toHex(
    x25519.getSharedSecret(fromHex(privateKeyHex), fromHex(publicKeyHex)),
  );
}

// ── HKDF ────────────────────────────────────────────────────────────────

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

// ── XChaCha20-Poly1305 encryption ───────────────────────────────────────

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

// ── Utility ──────────────────────────────────────────────────────────────

// Re-export hex/base64 utilities for other crypto files
export { toHex, fromHex, toBase64, fromBase64 };
