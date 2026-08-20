import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
} from 'node:crypto';

// Deterministic, authenticated encryption for database uuids sent to the frontend
// (see [[encrypt database uuids at the transport boundary]] plan). Deliberately
// deterministic — same uuid always produces the same token — because both
// frontend cache keys and this backend's own internal `===`/Set/Map id
// comparisons depend on equality holding across separate reads. That trades
// away semantic security (an observer can tell two tokens refer to the same
// row) for the property this feature actually needs: no raw db id ever
// leaves the process, and every previously-issued token keeps resolving.
//
// Construction: nonce = HMAC-SHA256(macKey, plaintext)[:12] (so it's a pure
// function of the plaintext, not random), then AES-256-GCM(encKey, nonce,
// plaintext). Same idea as AES-SIV, built from node:crypto primitives only —
// matches CryptoService's existing "small, dependency-free" convention. The
// GCM auth tag still makes a tampered/forged token fail loudly instead of
// silently decrypting to garbage.
//
// The 16-byte uuid is encrypted directly (not the 36-char string form), so
// the output token is shorter: 12 (nonce) + 16 (tag) + 16 (ciphertext) = 44
// bytes -> 59 base64url chars, vs ~86 for the string form.

let encKey: Buffer | undefined;
let macKey: Buffer | undefined;

function deriveKeys(): { encKey: Buffer; macKey: Buffer } {
  if (encKey && macKey) return { encKey, macKey };
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      'ENCRYPTION_KEY is not set — required to encrypt/decrypt ids',
    );
  }
  // Same acceptance rule as CryptoService: a 64-char hex key (32 bytes) used
  // directly, otherwise SHA-256-derive 32 bytes from whatever string is set.
  const key = /^[0-9a-f]{64}$/i.test(raw)
    ? Buffer.from(raw, 'hex')
    : createHash('sha256').update(raw).digest();
  // Domain-separated subkeys so the nonce-derivation key and the cipher key
  // are never the same bytes.
  encKey = createHmac('sha256', key).update('id-codec:enc').digest();
  macKey = createHmac('sha256', key).update('id-codec:mac').digest();
  return { encKey, macKey };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uuidToBytes(id: string): Buffer {
  if (!UUID_RE.test(id)) {
    throw new Error(`Not a uuid: ${id}`);
  }
  return Buffer.from(id.replace(/-/g, ''), 'hex');
}

function bytesToUuid(bytes: Buffer): string {
  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

/** Encrypts a raw uuid into an opaque, deterministic, url-safe token. */
export function encryptId(id: string): string {
  const { encKey: ek, macKey: mk } = deriveKeys();
  const plaintext = uuidToBytes(id);
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
 * Reverses {@link encryptId}. Throws on anything that isn't a well-formed,
 * untampered token — a malformed length fails fast, a forged/corrupted one
 * fails the GCM auth tag. Callers must catch this and turn it into a clean
 * client-facing error rather than letting it reach Prisma as a raw
 * "invalid input syntax for type uuid" failure.
 */
export function decryptId(token: string): string {
  const { encKey: ek } = deriveKeys();
  const packed = Buffer.from(token, 'base64url');
  if (packed.length !== 44) {
    throw new Error(
      `Malformed id token (expected 44 bytes, got ${packed.length})`,
    );
  }
  const nonce = packed.subarray(0, 12);
  const authTag = packed.subarray(12, 28);
  const ciphertext = packed.subarray(28, 44);
  const decipher = createDecipheriv('aes-256-gcm', ek, nonce);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return bytesToUuid(plaintext);
}

/** Test-only: force a key re-derivation on the next call (env var changed). */
export function _resetKeysForTests(): void {
  encKey = undefined;
  macKey = undefined;
}
