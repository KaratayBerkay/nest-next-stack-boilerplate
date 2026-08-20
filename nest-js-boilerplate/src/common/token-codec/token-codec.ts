import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
} from 'node:crypto';

// Encrypt/decrypt session tokens (rbac_token, user_token, refresh_token) for
// transport, so the value a client holds isn't directly usable to compute
// our Redis keys (see id-encryption-transport-boundary-2026-08-19 memory for
// the sibling feature this mirrors — database uuids). Deliberately a
// separate module from ../id-codec/id-codec.ts: different concern (session
// tokens, not database ids) and a different input shape — these are
// arbitrary-length strings (64-char hex HMAC outputs, ~90-char random
// tokens), not 16-byte uuids, so id-codec's uuid-shaped packing doesn't
// apply. Same construction otherwise: HMAC-derived deterministic nonce +
// AES-256-GCM, keyed from ENCRYPTION_KEY, base64url output. Deterministic
// for the same reason id-codec is — these values get compared/looked-up
// repeatedly across a session's lifetime.
//
// device_token is deliberately never run through this codec anywhere in the
// app — both web and Flutter independently SHA-256 its literal value
// client-side to derive wire-crypto (E2EE messaging) keys, and the server
// must arrive at the identical hash. Wrapping it would break that shared,
// by-design-computable value.

let encKey: Buffer | undefined;
let macKey: Buffer | undefined;

function deriveKeys(): { encKey: Buffer; macKey: Buffer } {
  if (encKey && macKey) return { encKey, macKey };
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      'ENCRYPTION_KEY is not set — required to encrypt/decrypt tokens',
    );
  }
  const key = /^[0-9a-f]{64}$/i.test(raw)
    ? Buffer.from(raw, 'hex')
    : createHash('sha256').update(raw).digest();
  encKey = createHmac('sha256', key).update('token-codec:enc').digest();
  macKey = createHmac('sha256', key).update('token-codec:mac').digest();
  return { encKey, macKey };
}

/** Encrypts an arbitrary string into an opaque, deterministic, url-safe token. */
export function encryptToken(plain: string): string {
  const { encKey: ek, macKey: mk } = deriveKeys();
  const plaintext = Buffer.from(plain, 'utf8');
  const nonce = createHmac('sha256', mk)
    .update(plaintext)
    .digest()
    .subarray(0, 12);
  const cipher = createCipheriv('aes-256-gcm', ek, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([nonce, authTag, ciphertext]).toString('base64url');
}

/**
 * Reverses {@link encryptToken}. Throws on anything that isn't a
 * well-formed, untampered token.
 */
export function decryptToken(token: string): string {
  const { encKey: ek } = deriveKeys();
  const packed = Buffer.from(token, 'base64url');
  if (packed.length < 28) {
    throw new Error(
      `Malformed token (expected at least 28 bytes, got ${packed.length})`,
    );
  }
  const nonce = packed.subarray(0, 12);
  const authTag = packed.subarray(12, 28);
  const ciphertext = packed.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', ek, nonce);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString('utf8');
}

/**
 * Same as {@link decryptToken}, but returns null instead of throwing — used
 * at every token-extraction call site, where a malformed/tampered/missing
 * value should be treated the same as "credential not present" (the
 * existing validation logic already rejects that cleanly) rather than a new
 * error class.
 */
export function decryptTokenOrNull(value: string | null): string | null {
  if (!value) return null;
  try {
    return decryptToken(value);
  } catch {
    return null;
  }
}

/**
 * Deterministic, keyed hash for turning a raw token/sessionId into a Redis
 * key component. Keyed by TOKEN_DERIVATION_SECRET (same secret
 * TokenDerivationService already uses to HMAC-derive rbac_token/user_token,
 * and the same 'namespace.v1:...' domain-separation convention) — a plain
 * exported function rather than a method on TokenDerivationService so
 * WireCryptoService (a different top-level module) can use it without
 * introducing a new cross-module DI dependency; TokenStoreService (same
 * src/auth/ module family) uses it the same way for consistency.
 *
 * Replaces plain unkeyed SHA-256 / no hash at all in Redis key construction:
 * unkeyed SHA-256 is a public, reproducible computation — anyone holding the
 * raw token values could compute our exact Redis key themselves. HMAC with a
 * server-only secret closes that off.
 */
export function hashForRedisKey(value: string): string {
  const secret = process.env.TOKEN_DERIVATION_SECRET;
  if (!secret) {
    throw new Error(
      'TOKEN_DERIVATION_SECRET is not set — required to derive Redis keys safely',
    );
  }
  return createHmac('sha256', secret)
    .update(`redis-key.v1:${value}`)
    .digest('hex');
}

/** Test-only: force a key re-derivation on the next call (env var changed). */
export function _resetKeysForTests(): void {
  encKey = undefined;
  macKey = undefined;
}
