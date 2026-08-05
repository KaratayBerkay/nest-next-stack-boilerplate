import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
