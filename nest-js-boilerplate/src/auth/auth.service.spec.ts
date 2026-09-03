import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hash } from '@node-rs/argon2';
import { verify as verifyTotp } from 'otplib';
import { CryptoService } from '../common/crypto/crypto.service';
import { DeviceService } from '../devices/device.service';
import type { RequestContext } from '../devices/device.service';
import { MailService } from '../mail/mail.service';
import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { TokenDerivationService } from './token-derivation.service';
import { TokenStoreService } from './token-store.service';
import { SessionHydrationService } from './session-hydration.service';
import { UsernameService } from './username.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { EmailOtpService } from './email-otp.service';
import { WireCryptoService } from '../wire-crypto/wire-crypto.service';
import { OAuthService } from './oauth/oauth.service';
import { NotificationService } from '../notification/notification.service';

jest.mock('otplib', () => ({
  verify: jest.fn(),
}));

const mockedVerifyTotp = verifyTotp as jest.Mock;

const mockPrisma = {
  verificationToken: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  mfaFactor: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  mfaBackupCode: {
    findFirst: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
  },
  account: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
};

const mockCrypto = {
  sha256: jest.fn((s: string) => `sha256(${s})`),
  randomToken: jest.fn(() => 'rand_token'),
  decrypt: jest.fn((buf: Buffer) => buf.toString()),
};

const mockOutbox = {
  emit: jest.fn(),
};

const mockConfig = {
  get: jest.fn((key: string, def?: unknown) => def),
};

const mockNotifications = { create: jest.fn().mockResolvedValue(undefined) };

const mockOAuthService = {
  retrieveProfile: jest.fn(),
};

const mockTokenStore = {
  buildKey: jest.fn(),
  read: jest.fn(),
  write: jest.fn(),
  revoke: jest.fn(),
  extendTTL: jest.fn(),
  updateFields: jest.fn(),
  revokeAllForUser: jest.fn(),
  writeMfaChallenge: jest.fn(),
  consumeMfaChallenge: jest.fn(),
  peekMfaChallenge: jest.fn(),
  deleteMfaChallenge: jest.fn(),
  recordMfaChallengeFailure: jest.fn().mockResolvedValue(1),
  markMfaFresh: jest.fn().mockResolvedValue(undefined),
};

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfig },
        { provide: CryptoService, useValue: mockCrypto },
        { provide: OutboxService, useValue: mockOutbox },
        { provide: MailService, useValue: { enqueue: jest.fn() } },
        { provide: NotificationService, useValue: mockNotifications },
        { provide: DeviceService, useValue: { resolveForLogin: jest.fn() } },
        { provide: TokenStoreService, useValue: mockTokenStore },
        { provide: SessionHydrationService, useValue: { hydrate: jest.fn() } },
        {
          provide: TokenDerivationService,
          // Real TokenDerivationService always returns a string — issueTokens
          // now wraps this for transport (encryptToken), which requires an
          // actual string input, not the bare jest.fn()'s default undefined.
          useValue: {
            deriveRbacToken: jest.fn().mockReturnValue('mock-rbac-token'),
            deriveUserToken: jest.fn().mockReturnValue('mock-user-token'),
          },
        },
        { provide: UsernameService, useValue: { generate: jest.fn() } },
        { provide: RealtimeGateway, useValue: { emitToUser: jest.fn() } },
        {
          provide: EmailOtpService,
          useValue: {
            generate: jest.fn().mockResolvedValue(undefined),
            verify: jest.fn().mockResolvedValue(true),
            resend: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: WireCryptoService,
          useValue: {
            createSessionKeys: jest.fn().mockResolvedValue('a'.repeat(64)),
            deleteForSession: jest.fn().mockResolvedValue(undefined),
            touchTTL: jest.fn().mockResolvedValue(undefined),
          },
        },
        { provide: OAuthService, useValue: mockOAuthService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // resetPassword now does its lookup inside $transaction (closes the TOCTOU race —
    // enhancements1 #7), so the mocked `tx` needs the same methods as `mockPrisma`
    // itself. Reusing the same jest.fn()s means each test's
    // `mockPrisma.verificationToken.findUnique.mockResolvedValue(...)` still applies.
    mockPrisma.$transaction.mockImplementation(
      (cb: (tx: typeof mockPrisma) => unknown) => cb(mockPrisma),
    );
  });

  describe('changePassword', () => {
    it('emits an in-app SECURITY notification once the password is changed (BE-014)', async () => {
      const passwordHash = await hash('OldPassword!123');
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.c',
        passwordHash,
      });
      mockPrisma.$transaction.mockImplementation(
        (cb: (tx: typeof mockPrisma) => unknown) => cb(mockPrisma),
      );

      await service.changePassword(
        'u1',
        undefined,
        'OldPassword!123',
        'BrandNewPassw0rd!xyz',
      );

      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u1',
          actorId: 'u1',
          type: 'SECURITY',
          payload: { kind: 'security-password-changed' },
        }),
      );
    });

    it('does not notify when the current password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'a@b.c',
        passwordHash: await hash('OldPassword!123'),
      });
      await expect(
        service.changePassword('u1', undefined, 'nope', 'BrandNewPassw0rd!xyz'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(mockNotifications.create).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const rawToken = 'valid_reset_token';
    const newPassword = 'NewP@ss123';

    it('throws when token does not exist', async () => {
      mockPrisma.verificationToken.findUnique.mockResolvedValue(null);

      await expect(
        service.resetPassword(rawToken, newPassword),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrisma.verificationToken.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: `sha256(${rawToken})` },
      });
    });

    it('throws when token type is not PASSWORD_RESET', async () => {
      mockPrisma.verificationToken.findUnique.mockResolvedValue({
        id: 't1',
        type: 'EMAIL_VERIFICATION',
        userId: 'u1',
        consumedAt: null,
        expiresAt: new Date(Date.now() + 3600000),
      });

      await expect(
        service.resetPassword(rawToken, newPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when token is already consumed', async () => {
      mockPrisma.verificationToken.findUnique.mockResolvedValue({
        id: 't1',
        type: 'PASSWORD_RESET',
        userId: 'u1',
        consumedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
      });

      await expect(
        service.resetPassword(rawToken, newPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when token is expired', async () => {
      mockPrisma.verificationToken.findUnique.mockResolvedValue({
        id: 't1',
        type: 'PASSWORD_RESET',
        userId: 'u1',
        consumedAt: null,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.resetPassword(rawToken, newPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when token has no userId', async () => {
      mockPrisma.verificationToken.findUnique.mockResolvedValue({
        id: 't1',
        type: 'PASSWORD_RESET',
        userId: null,
        consumedAt: null,
        expiresAt: new Date(Date.now() + 3600000),
      });

      await expect(
        service.resetPassword(rawToken, newPassword),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('consumes the token, updates the password, emits event, and returns true', async () => {
      const token = {
        id: 't1',
        type: 'PASSWORD_RESET',
        userId: 'u1',
        consumedAt: null,
        expiresAt: new Date(Date.now() + 3600000),
      };
      mockPrisma.verificationToken.findUnique.mockResolvedValue(token);

      mockPrisma.verificationToken.update.mockResolvedValue({
        ...token,
        consumedAt: new Date(),
      });
      mockPrisma.user.update.mockResolvedValue({ id: 'u1' });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'alice@example.com',
      });

      const result = await service.resetPassword(rawToken, newPassword);

      expect(result).toBe(true);
      expect(mockPrisma.verificationToken.update).toHaveBeenCalledWith({
        where: { id: token.id },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { consumedAt: expect.any(Date) },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          passwordHash: expect.any(String),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          passwordSetAt: expect.any(Date),
          // Clears any account lockout — enhancements1 #5: a password reset is a
          // strong enough proof of ownership that a lockout shouldn't survive it.
          failedLoginCount: 0,
          lockedUntil: null,
        },
      });
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateType: 'User',
          eventType: 'user.password_reset',
          action: 'PASSWORD_CHANGED',
        }),
        expect.anything(),
      );
      // enhancements1 #2: a successful reset must revoke every other existing
      // session, not just leave old (possibly attacker-held) tokens valid.
      expect(mockTokenStore.revokeAllForUser).toHaveBeenCalledWith('u1');
    });
  });

  describe('verifyLoginMfa — backup codes', () => {
    const code = 'a1b2c3d4e5'; // 10 hex chars — valid backup code

    beforeEach(() => {
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      mockTokenStore.peekMfaChallenge.mockResolvedValue({
        userId: '01890a5d-ac96-774b-bcce-b302099a8060',
        email: 'mfa@example.com',
        role: 'USER',
        tier: 'FREE',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '01890a5d-ac96-774b-bcce-b302099a8060',
        mfaEnabled: true,
        email: 'mfa@example.com',
      });
    });

    it('accepts a 10-char backup code when TOTP fails', async () => {
      mockPrisma.mfaFactor.findFirst.mockResolvedValue(null);
      mockPrisma.mfaBackupCode.findFirst.mockResolvedValue({
        id: 'bc1',
        codeHash: `sha256(${code})`,
        usedAt: null,
      });
      mockPrisma.mfaBackupCode.findFirst.mockResolvedValue({
        id: 'bc1',
        codeHash: `sha256(${code})`,
        usedAt: null,
      });

      const result = await service.verifyLoginMfa('valid-token', code);

      expect(result).toBeDefined();
      expect(result.mfaRequired).toBeFalsy();
      expect(mockPrisma.mfaBackupCode.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'bc1', usedAt: null },
          data: { usedAt: expect.any(Date) as never },
        }),
      );
      // BE-030: only a session issued by a completed second factor is marked
      // MFA-fresh — the one-shot proof trustCurrentDevice requires.
      expect(mockTokenStore.markMfaFresh).toHaveBeenCalledTimes(1);
      expect(mockTokenStore.markMfaFresh).toHaveBeenCalledWith('rand_token');
    });

    it('rejects a used backup code on second attempt (single-use)', async () => {
      mockPrisma.mfaFactor.findFirst.mockResolvedValue(null);
      mockPrisma.mfaBackupCode.findFirst.mockResolvedValueOnce({
        id: 'bc1',
        codeHash: `sha256(${code})`,
        usedAt: null,
      });

      // First use succeeds
      await service.verifyLoginMfa('valid-token', code);

      // Second use with same code — code already has usedAt set
      mockPrisma.mfaBackupCode.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.verifyLoginMfa('another-token', code),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects when the atomic claim loses a race — two concurrent verifies both reading the code as unused before either commits must not both succeed', async () => {
      mockPrisma.mfaFactor.findFirst.mockResolvedValue(null);
      mockPrisma.mfaBackupCode.findFirst.mockResolvedValue({
        id: 'bc1',
        codeHash: `sha256(${code})`,
        usedAt: null,
      });
      // Simulates the loser: another request's updateMany already flipped
      // usedAt between this findFirst and this updateMany, so the WHERE
      // clause (id + usedAt: null) matches zero rows.
      mockPrisma.mfaBackupCode.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(service.verifyLoginMfa('valid-token', code)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('resets failedLoginCount/lockedUntil and audits the login on a successful MFA verification — regression: this path never reset the counter at all, so a user who mistyped their password a few times before completing MFA kept carrying that count forever, and MFA-gated logins were invisible to the audit log (only the non-MFA and OAuth paths emitted auth.login)', async () => {
      mockPrisma.mfaFactor.findFirst.mockResolvedValue(null);
      mockPrisma.mfaBackupCode.findFirst.mockResolvedValue({
        id: 'bc1',
        codeHash: `sha256(${code})`,
        usedAt: null,
      });

      await service.verifyLoginMfa('valid-token', code);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '01890a5d-ac96-774b-bcce-b302099a8060' },
        data: {
          failedLoginCount: 0,
          lockedUntil: null,
          lastLoginAt: expect.any(Date) as never,
        },
      });
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'auth.login',
          aggregateId: '01890a5d-ac96-774b-bcce-b302099a8060',
        }),
        mockPrisma,
      );
    });
  });

  describe('verifyLoginMfa — TOTP retry', () => {
    beforeEach(() => {
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');
      mockCrypto.decrypt.mockReturnValue('BASE32SECRET');

      mockTokenStore.peekMfaChallenge.mockResolvedValue({
        userId: '01890a5d-ac96-774b-bcce-b302099a8061',
        email: 'totp@example.com',
        role: 'USER',
        tier: 'FREE',
        mfaMethod: 'TOTP',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: '01890a5d-ac96-774b-bcce-b302099a8061',
        mfaEnabled: true,
        email: 'totp@example.com',
      });
      mockPrisma.mfaFactor.findFirst.mockResolvedValue({
        secret: Buffer.from('encrypted-secret'),
      });
      mockPrisma.mfaBackupCode.findFirst.mockResolvedValue(null);
    });

    it('does not burn the challenge on a wrong code — a later correct code still works', async () => {
      mockedVerifyTotp
        .mockReturnValueOnce({ valid: false })
        .mockReturnValueOnce({ valid: true });

      await expect(
        service.verifyLoginMfa('mfa-token', '000000'),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockTokenStore.deleteMfaChallenge).not.toHaveBeenCalled();

      const result = await service.verifyLoginMfa('mfa-token', '111111');

      expect(result).toBeDefined();
      expect(result.mfaRequired).toBeFalsy();
      expect(mockTokenStore.peekMfaChallenge).toHaveBeenCalledTimes(2);
    });

    it('deletes the challenge only once verification actually succeeds', async () => {
      mockedVerifyTotp.mockReturnValue({ valid: true });

      await service.verifyLoginMfa('mfa-token', '111111');

      expect(mockTokenStore.deleteMfaChallenge).toHaveBeenCalledWith(
        'sha256(mfa-token)',
      );
    });

    it('records the failed attempt against the challenge on a wrong code', async () => {
      mockedVerifyTotp.mockReturnValue({ valid: false });
      mockTokenStore.recordMfaChallengeFailure.mockResolvedValue(1);

      await expect(
        service.verifyLoginMfa('mfa-token', '000000'),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockTokenStore.recordMfaChallengeFailure).toHaveBeenCalledWith(
        'sha256(mfa-token)',
      );
      expect(mockTokenStore.deleteMfaChallenge).not.toHaveBeenCalled();
    });

    it('burns the challenge after the attempt cap so a stolen mfaToken cannot be brute-forced', async () => {
      mockedVerifyTotp.mockReturnValue({ valid: false });
      mockTokenStore.recordMfaChallengeFailure.mockResolvedValue(5);

      await expect(
        service.verifyLoginMfa('mfa-token', '000000'),
      ).rejects.toMatchObject({
        response: expect.objectContaining({
          exc: 'EX_AUTH_MFA_EXPIRED',
        }) as object,
      });
      expect(mockTokenStore.deleteMfaChallenge).toHaveBeenCalledWith(
        'sha256(mfa-token)',
      );
    });
  });

  describe('login', () => {
    it('blocks login when user status is PENDING_VERIFICATION', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u2',
        email: 'bob@example.com',
        passwordHash: '$argon2id$fakehash',
        status: 'PENDING_VERIFICATION',
        mfaEnabled: false,
        lockedUntil: null,
        failedLoginCount: 0,
        role: 'USER',
        subscriptionTier: 'FREE',
      });

      await expect(
        service.login({ email: 'bob@example.com', password: 'pass123' }),
      ).rejects.toThrow(UnauthorizedException);
      // Verify it was the status check, not the password check that rejected
      expect(mockPrisma.user.findUnique).toHaveBeenCalled();
    });

    it('blocks login when user status is BANNED', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u3',
        email: 'banned@example.com',
        passwordHash: '$argon2id$fakehash',
        status: 'BANNED',
        mfaEnabled: false,
        lockedUntil: null,
        failedLoginCount: 0,
        role: 'USER',
        subscriptionTier: 'FREE',
      });

      await expect(
        service.login({ email: 'banned@example.com', password: 'pass123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns mfaRequired when user has MFA enabled', async () => {
      // login() calls verify(user.passwordHash, input.password) which requires argon2.
      // Use a real argon2 hash so the password check passes before MFA gate.
      const realHash = await hash('pass123');

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u4',
        email: 'mfa@example.com',
        passwordHash: realHash,
        status: 'ACTIVE',
        mfaEnabled: true,
        lockedUntil: null,
        failedLoginCount: 0,
        role: 'USER',
        subscriptionTier: 'FREE',
      });

      mockTokenStore.writeMfaChallenge.mockResolvedValue(undefined);

      const result = await service.login({
        email: 'mfa@example.com',
        password: 'pass123',
      });

      expect(result.mfaRequired).toBe(true);
      expect(result.mfaToken).toBeDefined();
      expect(mockTokenStore.writeMfaChallenge).toHaveBeenCalled();
      // Should NOT issue full session tokens
      expect(mockTokenStore.write).not.toHaveBeenCalled();
      // BE-033: a password alone proves nothing yet — the challenge response
      // must not carry the account row (role, tier, status, ...).
      expect(result.user).toBeUndefined();
      // And a plain password login never leaves the post-MFA marker behind
      // that trustCurrentDevice consumes.
      expect(mockTokenStore.markMfaFresh).not.toHaveBeenCalled();
    });

    it('skips MFA challenge when device is trusted', async () => {
      const realHash = await hash('pass123');

      const mockCtx = {
        req: { cookies: {}, headers: {}, res: { cookie: jest.fn() } },
      } as unknown as RequestContext;
      const deviceService = module.get<{ resolveForLogin: jest.Mock }>(
        DeviceService,
      );
      deviceService.resolveForLogin.mockResolvedValue({
        deviceId: 'dev-trusted',
        deviceToken: 'trusted-token',
        changed: false,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        trusted: true,
      });

      mockPrisma.user.findUnique.mockResolvedValue({
        id: '01890a5d-ac96-774b-bcce-b302099a8062',
        email: 'mfa@example.com',
        passwordHash: realHash,
        status: 'ACTIVE',
        mfaEnabled: true,
        lockedUntil: null,
        failedLoginCount: 0,
        role: 'USER',
        subscriptionTier: 'FREE',
      });

      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await service.login(
        { email: 'mfa@example.com', password: 'pass123' },
        mockCtx,
      );

      expect(result.mfaRequired).toBeFalsy();
      expect(mockTokenStore.writeMfaChallenge).not.toHaveBeenCalled();
      expect(mockTokenStore.write).toHaveBeenCalled();
    });

    it('requires MFA when device is untrusted', async () => {
      const realHash = await hash('pass123');

      const mockCtx = {
        req: { cookies: {}, headers: {}, res: { cookie: jest.fn() } },
      } as unknown as RequestContext;
      const deviceService = module.get<{ resolveForLogin: jest.Mock }>(
        DeviceService,
      );
      deviceService.resolveForLogin.mockResolvedValue({
        deviceId: 'dev-untrusted',
        deviceToken: 'untrusted-token',
        changed: false,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        trusted: false,
      });

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u4',
        email: 'mfa@example.com',
        passwordHash: realHash,
        status: 'ACTIVE',
        mfaEnabled: true,
        lockedUntil: null,
        failedLoginCount: 0,
        role: 'USER',
        subscriptionTier: 'FREE',
      });

      mockTokenStore.writeMfaChallenge.mockResolvedValue(undefined);

      const result = await service.login(
        { email: 'mfa@example.com', password: 'pass123' },
        mockCtx,
      );

      expect(result.mfaRequired).toBe(true);
      expect(mockTokenStore.writeMfaChallenge).toHaveBeenCalled();
      expect(mockTokenStore.write).not.toHaveBeenCalled();
    });

    it('fires the new-device notification even when the login goes on to require MFA — regression: resolveForLogin() persists a Device row on first call, so a second resolveForLogin() call from the follow-up verifyLoginMfa() request always sees changed:false for the same device; deferring the notification until after the (still-pending) MFA branch silently dropped it for every MFA-gated login', async () => {
      const realHash = await hash('pass123');
      const mockCtx = {
        req: { cookies: {}, headers: {}, res: { cookie: jest.fn() } },
      } as unknown as RequestContext;
      const deviceService = module.get<{ resolveForLogin: jest.Mock }>(
        DeviceService,
      );
      deviceService.resolveForLogin.mockResolvedValue({
        deviceId: 'dev-new',
        deviceToken: 'new-token',
        changed: true,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        trusted: false,
      });
      const realtime = module.get<{ emitToUser: jest.Mock }>(RealtimeGateway);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: '01890a5d-ac96-774b-bcce-b302099a8065',
        email: 'newdevice@example.com',
        passwordHash: realHash,
        status: 'ACTIVE',
        mfaEnabled: true,
        lockedUntil: null,
        failedLoginCount: 0,
        role: 'USER',
        subscriptionTier: 'FREE',
      });
      mockTokenStore.writeMfaChallenge.mockResolvedValue(undefined);

      const result = await service.login(
        { email: 'newdevice@example.com', password: 'pass123' },
        mockCtx,
      );

      expect(result.mfaRequired).toBe(true);
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'auth.device.new' }),
      );
      expect(realtime.emitToUser).toHaveBeenCalledWith(
        '01890a5d-ac96-774b-bcce-b302099a8065',
        expect.objectContaining({ type: 'device-logged-in' }),
      );
    });

    it('commits the login-state reset and its audit event as one transaction — regression for a bug where emitting the outbox event outside the transaction meant a crash in between left the reset silently unaudited', async () => {
      const realHash = await hash('pass123');
      const mockCtx = {
        req: { cookies: {}, headers: {}, res: { cookie: jest.fn() } },
      } as unknown as RequestContext;
      const deviceService = module.get<{ resolveForLogin: jest.Mock }>(
        DeviceService,
      );
      deviceService.resolveForLogin.mockResolvedValue({
        deviceId: 'dev-trusted',
        deviceToken: 'trusted-token',
        changed: false,
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        trusted: true,
      });
      const userId = '01890a5d-ac96-774b-bcce-b302099a8063';
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'ok@example.com',
        passwordHash: realHash,
        status: 'ACTIVE',
        mfaEnabled: false,
        lockedUntil: null,
        failedLoginCount: 3,
        role: 'USER',
        subscriptionTier: 'FREE',
      });
      mockPrisma.user.update.mockResolvedValue({ id: userId });
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      await service.login(
        { email: 'ok@example.com', password: 'pass123' },
        mockCtx,
      );

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: userId } }),
      );
      const updateCall = mockPrisma.user.update.mock.calls[0] as [
        { data: { failedLoginCount: number } },
      ];
      expect(updateCall[0].data).toMatchObject({ failedLoginCount: 0 });
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'auth.login' }),
        mockPrisma,
      );
    });

    it('locks the account and audits the failed attempt inside one transaction once MAX_FAILED_LOGINS is reached — regression for a bug where the increment and the lockout write were separate top-level calls, so a crash in between could leave a past-threshold account permanently unlocked', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u8',
        email: 'baduser@example.com',
        passwordHash: await hash('correct-password'),
        status: 'ACTIVE',
        mfaEnabled: false,
        lockedUntil: null,
        failedLoginCount: 4,
        role: 'USER',
        subscriptionTier: 'FREE',
      });
      mockPrisma.user.update.mockResolvedValue({
        id: 'u8',
        failedLoginCount: 5,
      });

      await expect(
        service.login({
          email: 'baduser@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrisma.user.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'u8' },
        data: { failedLoginCount: { increment: 1 } },
      });
      const secondUpdateCall = mockPrisma.user.update.mock.calls[1] as [
        { where: { id: string }; data: { lockedUntil: Date } },
      ];
      expect(secondUpdateCall[0]).toMatchObject({ where: { id: 'u8' } });
      expect(secondUpdateCall[0].data.lockedUntil).toBeInstanceOf(Date);
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'auth.login.failed' }),
        mockPrisma,
      );
      const emitCall = mockOutbox.emit.mock.calls[0] as [
        { summary: string },
        unknown,
      ];
      expect(emitCall[0].summary).toContain('locked');
    });
  });

  describe('loginWithOAuth', () => {
    afterEach(() => {
      mockOAuthService.retrieveProfile.mockReset();
    });

    it('retrieves the profile via the state token rather than trusting a caller-supplied one', async () => {
      mockOAuthService.retrieveProfile.mockRejectedValueOnce(
        new UnauthorizedException('OAuth profile expired or not found'),
      );

      await expect(
        service.loginWithOAuth({ state: 'some-state', claim: 'claim-1' }),
      ).rejects.toThrow(UnauthorizedException);
      // state + the callback-minted claim (+ the optional mobile verifier)
      // all go to OAuthService — it, not this layer, decides redeemability.
      expect(mockOAuthService.retrieveProfile).toHaveBeenCalledWith(
        'some-state',
        'claim-1',
        undefined,
      );
      // An unverified state must never reach account lookup/creation — this
      // is the account-takeover fix's core guarantee.
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('retries with a freshly generated username after losing a concurrent username race — regression: UsernameService.generate() only checks-then-suggests (it cannot reserve the name), so two concurrent signups deriving the same base username could both pass the check and only one would win the DB @unique constraint; the loser must retry, not dead-end with a raw 500', async () => {
      mockOAuthService.retrieveProfile.mockResolvedValueOnce({
        type: 'oauth',
        provider: 'google',
        providerAccountId: 'g-race-1',
        email: 'racer@example.com',
        name: 'Racer',
      });
      mockPrisma.account.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null); // brand-new email both attempts
      const usernameService = module.get<{ generate: jest.Mock }>(
        UsernameService,
      );
      usernameService.generate
        .mockResolvedValueOnce('racer')
        .mockResolvedValueOnce('racer_x1a2b3');

      const raceError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`username`)',
        {
          code: 'P2002',
          clientVersion: '7.0.0',
          meta: { target: 'User_username_key' },
        },
      );
      mockPrisma.user.create
        .mockRejectedValueOnce(raceError)
        .mockResolvedValueOnce({
          id: '01890a5d-ac96-774b-bcce-b302099a8064',
          email: 'racer@example.com',
          username: 'racer_x1a2b3',
          name: 'Racer',
          // Real tx.user.create() always sets these for a brand-new OAuth
          // signup (see auth-login.service.ts) — matched here so the new
          // assertOAuthAccountActive() status gate doesn't reject a
          // legitimately-new user in this test.
          status: 'ACTIVE',
          emailVerifiedAt: new Date('2026-01-01'),
        });
      mockPrisma.account.create.mockResolvedValue({});
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      await service.loginWithOAuth({
        state: 'race-state',
        claim: 'claim-race',
      });

      expect(usernameService.generate).toHaveBeenCalledTimes(2);
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(2);
      const secondCreateCall = mockPrisma.user.create.mock.calls[1] as [
        { data: { username: string } },
      ];
      expect(secondCreateCall[0].data).toMatchObject({
        username: 'racer_x1a2b3',
      });
    });

    it('rejects a banned user even when a linked OAuth account already exists — ban-bypass fix', async () => {
      mockOAuthService.retrieveProfile.mockResolvedValueOnce({
        type: 'oauth',
        provider: 'google',
        providerAccountId: 'g-banned-1',
        email: 'banned@example.com',
        name: 'Banned User',
      });
      mockPrisma.account.findUnique.mockResolvedValue({
        userId: 'u-banned',
        user: { id: 'u-banned', status: 'BANNED', email: 'banned@example.com' },
      });

      await expect(
        service.loginWithOAuth({ state: 's', claim: 'c' }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({
          exc: 'EX_AUTH_ACCOUNT_INACTIVE',
        }) as object,
      });
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('refuses to link a new OAuth identity onto an existing but unverified account — pre-hijacking fix', async () => {
      mockOAuthService.retrieveProfile.mockResolvedValueOnce({
        type: 'oauth',
        provider: 'google',
        providerAccountId: 'g-hijack-1',
        email: 'victim@example.com',
        name: 'Victim',
      });
      mockPrisma.account.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-attacker-stub',
        email: 'victim@example.com',
        status: 'PENDING_VERIFICATION',
        emailVerifiedAt: null,
      });

      await expect(
        service.loginWithOAuth({ state: 's', claim: 'c' }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({
          exc: 'EX_AUTH_ACCOUNT_UNVERIFIED_CONFLICT',
        }) as object,
      });
      expect(mockPrisma.account.create).not.toHaveBeenCalled();
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('rejects a banned-but-verified existing account after linking, without issuing tokens', async () => {
      mockOAuthService.retrieveProfile.mockResolvedValueOnce({
        type: 'oauth',
        provider: 'google',
        providerAccountId: 'g-banned-verified-1',
        email: 'banned-verified@example.com',
        name: 'Banned Verified',
      });
      mockPrisma.account.findUnique.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-banned-verified',
        email: 'banned-verified@example.com',
        status: 'BANNED',
        emailVerifiedAt: new Date('2026-01-01'),
      });
      mockPrisma.account.create.mockResolvedValue({});

      await expect(
        service.loginWithOAuth({ state: 's', claim: 'c' }),
      ).rejects.toMatchObject({
        response: expect.objectContaining({
          exc: 'EX_AUTH_ACCOUNT_INACTIVE',
        }) as object,
      });
      // Linking itself is harmless (the row was already legitimately
      // verified) — only issuing tokens for a banned account is the bug.
      expect(mockPrisma.account.create).toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('resendEmailCode', () => {
    it("ignores the caller-supplied email and sends to the account's real address on file — this mutation is unauthenticated (mid-registration, no session yet), so trusting a client-supplied destination would let anyone who learned a pending user's id redirect that user's verification code to an attacker-controlled inbox", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        email: 'real-owner@example.com',
      });

      await service.resendEmailCode('user-1', 'attacker@evil.com');

      const emailOtp = module.get<{ resend: jest.Mock }>(EmailOtpService);
      expect(emailOtp.resend).toHaveBeenCalledWith(
        'user-1',
        'real-owner@example.com',
        'REGISTRATION',
      );
    });

    it('returns true without revealing whether the userId exists when the user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.resendEmailCode(
        'nonexistent',
        'attacker@evil.com',
      );

      expect(result).toBe(true);
      const emailOtp = module.get<{ resend: jest.Mock }>(EmailOtpService);
      expect(emailOtp.resend).not.toHaveBeenCalled();
    });
  });

  describe('resendLoginCode', () => {
    it('does not destroy the original MFA challenge before the resend succeeds — regression for a bug where consuming (deleting) the challenge up front meant a failed resend (e.g. the 60s cooldown from the original send) permanently dead-ended the login with no way to recover except starting over', async () => {
      mockTokenStore.peekMfaChallenge.mockResolvedValue({
        userId: 'user-1',
        email: 'u@example.com',
        role: 'USER',
        tier: 'FREE',
        mfaMethod: 'EMAIL',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'u@example.com',
      });
      const emailOtp = module.get<{ resend: jest.Mock }>(EmailOtpService);
      emailOtp.resend.mockRejectedValueOnce(new Error('cooldown'));

      await expect(service.resendLoginCode('mfa-token')).rejects.toThrow(
        'cooldown',
      );

      expect(mockTokenStore.consumeMfaChallenge).not.toHaveBeenCalled();
      expect(mockTokenStore.deleteMfaChallenge).not.toHaveBeenCalled();
      expect(mockTokenStore.writeMfaChallenge).not.toHaveBeenCalled();
    });

    it('rotates to a new challenge and removes the old one only after a successful resend', async () => {
      mockTokenStore.peekMfaChallenge.mockResolvedValue({
        userId: 'user-1',
        email: 'u@example.com',
        role: 'USER',
        tier: 'FREE',
        mfaMethod: 'EMAIL',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'u@example.com',
      });

      const newToken = await service.resendLoginCode('mfa-token');

      expect(newToken).toBeTruthy();
      expect(mockTokenStore.writeMfaChallenge).toHaveBeenCalled();
      expect(mockTokenStore.deleteMfaChallenge).toHaveBeenCalled();
    });

    it('rejects resend for a TOTP challenge instead of sending a spurious email', async () => {
      mockTokenStore.peekMfaChallenge.mockResolvedValue({
        userId: 'user-1',
        email: 'u@example.com',
        role: 'USER',
        tier: 'FREE',
        mfaMethod: 'TOTP',
      });

      await expect(service.resendLoginCode('mfa-token')).rejects.toThrow();

      const emailOtp = module.get<{ resend: jest.Mock }>(EmailOtpService);
      expect(emailOtp.resend).not.toHaveBeenCalled();
    });
  });

  // BE-032: both verification paths wrote `status: 'ACTIVE'` unconditionally,
  // so an account banned/suspended while still PENDING_VERIFICATION could
  // un-ban itself by finishing email verification.
  describe('email verification only activates PENDING_VERIFICATION accounts', () => {
    const emailVerificationToken = {
      id: 't-verify',
      type: 'EMAIL_VERIFICATION',
      userId: 'u1',
      consumedAt: null,
      expiresAt: new Date(Date.now() + 3600000),
    };

    it.each(['BANNED', 'SUSPENDED', 'DEACTIVATED'] as const)(
      'verifyEmail (link) does not touch the status of a %s account',
      async (status) => {
        mockPrisma.verificationToken.findUnique.mockResolvedValue(
          emailVerificationToken,
        );
        mockPrisma.user.findUniqueOrThrow.mockResolvedValue({ status });
        mockPrisma.user.update.mockResolvedValue({
          id: 'u1',
          email: 'u@example.com',
          status,
        });

        await service.verifyEmail('raw-token');

        expect(mockPrisma.user.update).toHaveBeenCalledWith({
          where: { id: 'u1' },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: { emailVerifiedAt: expect.any(Date) },
        });
        const calls = mockPrisma.user.update.mock.calls as unknown as Array<
          [{ data: Record<string, unknown> }]
        >;
        expect(calls[0][0].data).not.toHaveProperty('status');
      },
    );

    it('verifyEmail (link) still promotes a PENDING_VERIFICATION account to ACTIVE', async () => {
      mockPrisma.verificationToken.findUnique.mockResolvedValue(
        emailVerificationToken,
      );
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        status: 'PENDING_VERIFICATION',
      });
      mockPrisma.user.update.mockResolvedValue({
        id: 'u1',
        email: 'u@example.com',
        status: 'ACTIVE',
      });

      await service.verifyEmail('raw-token');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { emailVerifiedAt: expect.any(Date), status: 'ACTIVE' },
      });
    });

    it('verifyEmailCode (OTP) leaves a BANNED account BANNED', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'u@example.com',
        status: 'BANNED',
        emailVerifiedAt: null,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: 'u1',
        email: 'u@example.com',
        status: 'BANNED',
      });

      await service.verifyEmailCode('u1', '123456');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { emailVerifiedAt: expect.any(Date) },
      });
    });

    it('verifyEmailCode (OTP) still promotes a PENDING_VERIFICATION account', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        email: 'u@example.com',
        status: 'PENDING_VERIFICATION',
        emailVerifiedAt: null,
      });
      mockPrisma.user.update.mockResolvedValue({
        id: 'u1',
        email: 'u@example.com',
        status: 'ACTIVE',
      });

      await service.verifyEmailCode('u1', '123456');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { emailVerifiedAt: expect.any(Date), status: 'ACTIVE' },
      });
    });
  });
});
