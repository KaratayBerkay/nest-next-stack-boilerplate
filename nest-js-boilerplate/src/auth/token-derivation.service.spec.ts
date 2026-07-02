import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../common/crypto/crypto.service';
import { TokenDerivationService } from './token-derivation.service';

const TEST_SECRET =
  'ced15b2ae4e4ea91413c96ccffbf0b974f8a0c038c77a43eac6d0f053217deca';

function createDerivation() {
  const config = {
    getOrThrow: () => TEST_SECRET,
    get: (_key: string, _default?: string) => undefined,
  } as unknown as ConfigService;
  const crypto = new CryptoService(config);
  crypto.onModuleInit();
  return new TokenDerivationService(crypto, config);
}

describe('TokenDerivationService', () => {
  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const fixedDate = new Date('2026-07-03T12:00:00Z');

  it('dateOnly returns YYYY-MM-DD in UTC', () => {
    const svc = createDerivation();
    expect(svc.dateOnly(fixedDate)).toBe('2026-07-03');
    // Midnight UTC boundary
    expect(svc.dateOnly(new Date('2026-07-03T00:00:00Z'))).toBe('2026-07-03');
    expect(svc.dateOnly(new Date('2026-07-03T23:59:59Z'))).toBe('2026-07-03');
    expect(svc.dateOnly(new Date('2026-07-04T00:00:00Z'))).toBe('2026-07-04');
  });

  it('deriveUserToken is deterministic for same date', () => {
    const svc = createDerivation();
    const a = svc.deriveUserToken(userId, fixedDate);
    const b = svc.deriveUserToken(userId, fixedDate);
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it('deriveUserToken changes on day rollover', () => {
    const svc = createDerivation();
    const today = svc.deriveUserToken(userId, new Date('2026-07-03T12:00:00Z'));
    const tomorrow = svc.deriveUserToken(
      userId,
      new Date('2026-07-04T12:00:00Z'),
    );
    expect(today).not.toBe(tomorrow);
  });

  it('deriveRbacToken is deterministic and tier-dependent', () => {
    const svc = createDerivation();
    const basic = svc.deriveRbacToken(userId, 'BASIC', fixedDate);
    const basic2 = svc.deriveRbacToken(userId, 'BASIC', fixedDate);
    expect(basic).toBe(basic2);
    expect(basic).toHaveLength(64);

    const premium = svc.deriveRbacToken(userId, 'PREMIUM', fixedDate);
    expect(basic).not.toBe(premium);
  });

  it('deriveRbacToken changes on day rollover', () => {
    const svc = createDerivation();
    const today = svc.deriveRbacToken(
      userId,
      'BASIC',
      new Date('2026-07-03T12:00:00Z'),
    );
    const tomorrow = svc.deriveRbacToken(
      userId,
      'BASIC',
      new Date('2026-07-04T12:00:00Z'),
    );
    expect(today).not.toBe(tomorrow);
  });

  it('deriveUserToken and deriveRbacToken differ for same user', () => {
    const svc = createDerivation();
    const userToken = svc.deriveUserToken(userId, fixedDate);
    const rbacToken = svc.deriveRbacToken(userId, 'FREE', fixedDate);
    expect(userToken).not.toBe(rbacToken);
  });

  it('different userIds produce different tokens', () => {
    const svc = createDerivation();
    const u1 = svc.deriveUserToken('user-a', fixedDate);
    const u2 = svc.deriveUserToken('user-b', fixedDate);
    expect(u1).not.toBe(u2);
  });

  it('timingSafeEqual returns true for matching hex strings', () => {
    const svc = createDerivation();
    const token = svc.deriveUserToken(userId, fixedDate);
    expect(svc.timingSafeEqual(token, token)).toBe(true);
    expect(svc.timingSafeEqual(token, token + 'ff')).toBe(false);
    const other = svc.deriveUserToken('other-id', fixedDate);
    expect(svc.timingSafeEqual(token, other)).toBe(false);
  });
});
