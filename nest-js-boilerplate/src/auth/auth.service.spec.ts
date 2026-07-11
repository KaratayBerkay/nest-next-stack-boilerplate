import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { hash } from '@node-rs/argon2';
import { CryptoService } from '../common/crypto/crypto.service';
import { DeviceService } from '../devices/device.service';
import { MailService } from '../mail/mail.service';
import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { TokenDerivationService } from './token-derivation.service';
import { TokenStoreService } from './token-store.service';
import { SessionHydrationService } from './session-hydration.service';
import { UsernameService } from './username.service';

const mockPrisma = {
  verificationToken: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockCrypto = {
  sha256: jest.fn((s: string) => `sha256(${s})`),
  randomToken: jest.fn(() => 'rand_token'),
};

const mockOutbox = {
  emit: jest.fn(),
};

const mockConfig = {
  get: jest.fn((key: string, def?: unknown) => def),
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
};

describe('AuthService', () => {
  let service: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() },
        },
        { provide: ConfigService, useValue: mockConfig },
        { provide: CryptoService, useValue: mockCrypto },
        { provide: OutboxService, useValue: mockOutbox },
        { provide: MailService, useValue: { enqueue: jest.fn() } },
        { provide: DeviceService, useValue: { resolveForLogin: jest.fn() } },
        { provide: TokenStoreService, useValue: mockTokenStore },
        { provide: SessionHydrationService, useValue: { hydrate: jest.fn() } },
        { provide: TokenDerivationService, useValue: { deriveRbacToken: jest.fn(), deriveUserToken: jest.fn() } },
        { provide: UsernameService, useValue: { generate: jest.fn() } },
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
    });
  });
});
