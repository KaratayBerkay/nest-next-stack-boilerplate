import { encryptId, decryptId, _resetKeysForTests } from './id-codec';

// Unit-proves the primitive every transport boundary relies on: deterministic
// (same uuid -> same token, always — required for frontend cache keys and
// this backend's own internal id equality checks to keep working), and
// tamper-evident (a forged/corrupted token fails loudly, never silently).
describe('id-codec', () => {
  const UUID_A = '01890a5d-ac96-774b-bcce-b302099a8057';
  const UUID_B = '01890a5d-ac96-774b-bcce-b302099a8058';

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-id-codec-specs';
    _resetKeysForTests();
  });

  it('round-trips a uuid', () => {
    const token = encryptId(UUID_A);
    expect(token).not.toBe(UUID_A);
    expect(decryptId(token)).toBe(UUID_A);
  });

  it('is deterministic: the same uuid always encrypts to the same token', () => {
    expect(encryptId(UUID_A)).toBe(encryptId(UUID_A));
  });

  it('produces different tokens for different uuids', () => {
    expect(encryptId(UUID_A)).not.toBe(encryptId(UUID_B));
  });

  it('is url-safe (no +, /, or = padding)', () => {
    expect(encryptId(UUID_A)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('throws decrypting a tampered token (GCM auth tag)', () => {
    const token = encryptId(UUID_A);
    const packed = Buffer.from(token, 'base64url');
    packed[packed.length - 1] ^= 0xff;
    expect(() => decryptId(packed.toString('base64url'))).toThrow();
  });

  it('throws decrypting a malformed token', () => {
    expect(() => decryptId('not-a-real-token')).toThrow();
  });

  it('throws encrypting a non-uuid string', () => {
    expect(() => encryptId('not-a-uuid')).toThrow();
  });
});
