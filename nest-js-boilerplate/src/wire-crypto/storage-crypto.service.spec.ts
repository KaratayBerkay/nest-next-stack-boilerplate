import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { StorageCryptoService } from './storage-crypto.service';

function buildService(masterKey?: string) {
  const config = new ConfigService(
    masterKey ? { MESSAGE_STORAGE_MASTER_KEY: masterKey } : {},
  );
  return new StorageCryptoService(config);
}

describe('StorageCryptoService', () => {
  it('round-trips a payload for a user', () => {
    const service = buildService();
    const envelope = service.encryptForStorage('u1', {
      text: 'hello at rest',
      nested: { n: 1 },
    });
    expect(envelope.v).toBe('storage-v1');
    expect(envelope.ct).not.toContain('hello at rest');
    expect(service.decryptFromStorage('u1', envelope)).toEqual({
      text: 'hello at rest',
      nested: { n: 1 },
    });
  });

  it('explicit sha256("<ENCRYPTION_KEY>:storage") hex key decrypts fallback-encrypted data', () => {
    // Locks in the production migration: MESSAGE_STORAGE_MASTER_KEY set to the
    // hex the dev fallback was deriving must be byte-identical to that
    // fallback, so pre-existing ciphertext survives the env change.
    const ek = 'test-encryption-key-123';
    const fallback = new StorageCryptoService(
      new ConfigService({ ENCRYPTION_KEY: ek }),
    );
    const derivedHex = createHash('sha256')
      .update(`${ek}:storage`)
      .digest('hex');
    const explicit = buildService(derivedHex);

    const envelope = fallback.encryptForStorage('u1', {
      text: 'survives the env migration',
    });
    expect(explicit.decryptFromStorage('u1', envelope)).toEqual({
      text: 'survives the env migration',
    });
  });

  it('isolates ciphertext per user — cross-user decrypt fails', () => {
    const service = buildService();
    const envelope = service.encryptForStorage('u1', { text: 'secret' });
    expect(() => service.decryptFromStorage('u2', envelope)).toThrow(
      UnauthorizedException,
    );
  });

  it('produces different ciphertext for the same payload (random nonce)', () => {
    const service = buildService();
    const a = service.encryptForStorage('u1', { text: 'same' });
    const b = service.encryptForStorage('u1', { text: 'same' });
    expect(a.nonce).not.toBe(b.nonce);
    expect(a.ct).not.toBe(b.ct);
  });

  it('rejects malformed envelopes', () => {
    const service = buildService();
    expect(() => service.decryptFromStorage('u1', { v: 'v1' })).toThrow();
    expect(() => service.decryptFromStorage('u1', null)).toThrow();
  });

  it('accepts an explicit hex master key', () => {
    const service = buildService('ab'.repeat(32));
    const envelope = service.encryptForStorage('u1', { text: 'x' });
    expect(service.decryptFromStorage('u1', envelope)).toEqual({ text: 'x' });
  });
});
