import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service';

// Unit-proves the crypto primitives auth/MFA depend on: AES-256-GCM round-trips,
// SHA-256 is deterministic, and random tokens are unique.
describe('CryptoService', () => {
  let crypto: CryptoService;

  beforeAll(() => {
    const config = {
      getOrThrow: () =>
        'ced15b2ae4e4ea91413c96ccffbf0b974f8a0c038c77a43eac6d0f053217deca',
      get: () => '90',
    } as unknown as ConfigService;
    crypto = new CryptoService(config);
    crypto.onModuleInit();
  });

  it('round-trips encrypt/decrypt for a TOTP secret', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const packed = crypto.encrypt(secret);
    expect(Buffer.isBuffer(packed)).toBe(true);
    expect(packed.length).toBeGreaterThan(secret.length); // iv + tag + ciphertext
    expect(crypto.decrypt(packed)).toBe(secret);
  });

  it('fails to decrypt tampered ciphertext (GCM auth tag)', () => {
    const packed = crypto.encrypt('top-secret');
    packed[packed.length - 1] ^= 0xff; // flip a byte
    expect(() => crypto.decrypt(packed)).toThrow();
  });

  it('hashes deterministically and generates unique tokens', () => {
    expect(crypto.sha256('hello')).toBe(crypto.sha256('hello'));
    expect(crypto.sha256('hello')).not.toBe(crypto.sha256('world'));
    expect(crypto.randomToken()).not.toBe(crypto.randomToken());
  });
});
