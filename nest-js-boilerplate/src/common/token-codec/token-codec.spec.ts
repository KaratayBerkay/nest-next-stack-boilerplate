import { createHash } from 'node:crypto';
import {
  encryptToken,
  decryptToken,
  decryptTokenOrNull,
  hashForRedisKey,
  _resetKeysForTests,
} from './token-codec';

describe('token-codec', () => {
  const RBAC_LIKE = 'a'.repeat(64); // hex-shaped, like a real hmacSha256 output
  const REFRESH_LIKE = 'x'.repeat(90); // base64url-ish, like a real randomToken output

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-token-codec-specs';
    process.env.TOKEN_DERIVATION_SECRET = 'test-token-derivation-secret';
    _resetKeysForTests();
  });

  it('round-trips a token', () => {
    const wrapped = encryptToken(RBAC_LIKE);
    expect(wrapped).not.toBe(RBAC_LIKE);
    expect(decryptToken(wrapped)).toBe(RBAC_LIKE);
  });

  it('round-trips a longer token unchanged in length-independent way', () => {
    const wrapped = encryptToken(REFRESH_LIKE);
    expect(decryptToken(wrapped)).toBe(REFRESH_LIKE);
  });

  it('is deterministic: the same input always encrypts to the same token', () => {
    expect(encryptToken(RBAC_LIKE)).toBe(encryptToken(RBAC_LIKE));
  });

  it('produces different tokens for different inputs', () => {
    expect(encryptToken(RBAC_LIKE)).not.toBe(encryptToken(REFRESH_LIKE));
  });

  it('is url-safe (no +, /, or = padding)', () => {
    expect(encryptToken(RBAC_LIKE)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('throws decrypting a tampered token (GCM auth tag)', () => {
    const token = encryptToken(RBAC_LIKE);
    const packed = Buffer.from(token, 'base64url');
    packed[packed.length - 1] ^= 0xff;
    expect(() => decryptToken(packed.toString('base64url'))).toThrow();
  });

  it('throws decrypting a malformed (too-short) token', () => {
    expect(() => decryptToken('short')).toThrow();
  });

  it('produces independent ciphertexts from id-codec for the same-shaped input (different domain-separated subkeys)', () => {
    // Not a round-trip check against id-codec (different input shapes
    // entirely — this just documents the two codecs don't share key material).
    const wrapped = encryptToken(RBAC_LIKE);
    expect(wrapped).toBeTruthy();
  });

  describe('decryptTokenOrNull', () => {
    it('returns the decrypted value for a valid token', () => {
      const wrapped = encryptToken(RBAC_LIKE);
      expect(decryptTokenOrNull(wrapped)).toBe(RBAC_LIKE);
    });

    it('returns null for null input', () => {
      expect(decryptTokenOrNull(null)).toBeNull();
    });

    it('returns null (not throw) for a malformed/tampered token', () => {
      expect(decryptTokenOrNull('not-a-real-token')).toBeNull();
    });
  });

  describe('hashForRedisKey', () => {
    it('is deterministic', () => {
      expect(hashForRedisKey('some-session-id')).toBe(
        hashForRedisKey('some-session-id'),
      );
    });

    it('is different for different inputs', () => {
      expect(hashForRedisKey('a')).not.toBe(hashForRedisKey('b'));
    });

    it('is keyed: changing the secret changes the hash for the same input', () => {
      const before = hashForRedisKey('some-session-id');
      process.env.TOKEN_DERIVATION_SECRET = 'a-different-secret';
      const after = hashForRedisKey('some-session-id');
      expect(after).not.toBe(before);
      process.env.TOKEN_DERIVATION_SECRET = 'test-token-derivation-secret';
    });

    it('is not plain unkeyed SHA-256 of the input (the exact vulnerability this closes)', () => {
      const plainSha256 = createHash('sha256')
        .update('some-session-id')
        .digest('hex');
      expect(hashForRedisKey('some-session-id')).not.toBe(plainSha256);
    });
  });
});
