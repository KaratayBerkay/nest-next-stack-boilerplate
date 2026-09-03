import { NotFoundException } from '@nestjs/common';
import { verify as verifyTotp } from 'otplib';
import { MfaService } from './mfa.service';

jest.mock('otplib', () => ({
  generateSecret: jest.fn(() => 'BASE32SECRETXXXX'),
  generateURI: jest.fn(
    () => 'otphttp://totp/NestBoilerplate:user@example.com?secret=X',
  ),
  verify: jest.fn(),
}));

const mockedVerifyTotp = verifyTotp as jest.Mock;

interface MockPrisma {
  user: { findUniqueOrThrow: jest.Mock; update: jest.Mock };
  mfaFactor: {
    deleteMany: jest.Mock;
    create: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
  };
  mfaBackupCode: {
    deleteMany: jest.Mock;
    createMany: jest.Mock;
    findFirst: jest.Mock;
    updateMany: jest.Mock;
  };
  $transaction: jest.Mock;
}

function mockPrisma(): MockPrisma {
  const prisma: MockPrisma = {
    user: { findUniqueOrThrow: jest.fn(), update: jest.fn() },
    mfaFactor: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    mfaBackupCode: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
      findFirst: jest.fn().mockResolvedValue(null),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    $transaction: jest.fn(),
  };
  // Callback-style interactive transaction: run the callback against the same
  // mocked client, mirroring auth.service.spec.ts's convention.
  prisma.$transaction.mockImplementation((cb: (tx: MockPrisma) => unknown) =>
    cb(prisma),
  );
  return prisma;
}

describe('MfaService', () => {
  let service: MfaService;
  let prisma: MockPrisma;
  let mockCrypto: {
    encrypt: jest.Mock;
    decrypt: jest.Mock;
    sha256: jest.Mock;
  };
  let mockOutbox: { emit: jest.Mock };
  let mockNotifications: { create: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = mockPrisma();
    mockCrypto = {
      encrypt: jest.fn(() => Buffer.from('encrypted-secret-blob')),
      decrypt: jest.fn(() => 'BASE32SECRETXXXX'),
      sha256: jest.fn((value: string) => `sha256(${value})`),
    };
    mockOutbox = { emit: jest.fn().mockResolvedValue(undefined) };
    mockNotifications = { create: jest.fn().mockResolvedValue(undefined) };

    service = new MfaService(
      prisma as never,
      mockCrypto as never,
      mockOutbox as never,
      mockNotifications as never,
    );
  });

  describe('enroll', () => {
    it('generates a secret, clears any prior pending factor, and stores the new one encrypted', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'u1',
        email: 'alice@example.com',
      });

      const result = await service.enroll('u1');

      expect(result.secret).toBe('BASE32SECRETXXXX');
      expect(result.otpauthUrl).toContain('otphttp://');
      expect(mockCrypto.encrypt).toHaveBeenCalledWith('BASE32SECRETXXXX');

      // Regression: the cleanup + insert must be one atomic unit — previously
      // these were two top-level calls, so a crash in between (or two
      // concurrent enroll() calls) could leave either zero or two pending
      // factors for the same user.
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);

      // Old pending factor removed before the new one is created (order matters:
      // otherwise the fresh insert could be immediately wiped by the cleanup).
      const deleteOrder =
        prisma.mfaFactor.deleteMany.mock.invocationCallOrder[0];
      const createOrder = prisma.mfaFactor.create.mock.invocationCallOrder[0];
      expect(deleteOrder).toBeLessThan(createOrder);

      expect(prisma.mfaFactor.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1', method: 'TOTP', verifiedAt: null },
      });
      expect(prisma.mfaFactor.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          method: 'TOTP',
          secret: Uint8Array.from(Buffer.from('encrypted-secret-blob')),
        },
      });
    });

    it('propagates the not-found error when the user does not exist', async () => {
      prisma.user.findUniqueOrThrow.mockRejectedValue(
        new Error('No User found'),
      );

      await expect(service.enroll('missing-user')).rejects.toThrow(
        'No User found',
      );
      expect(prisma.mfaFactor.create).not.toHaveBeenCalled();
    });

    // BE-030: with MFA already on, enroll() used to hand out a fresh pending
    // factor to any authenticated session — a hijacked one could then
    // verify it, replacing the owner's authenticator and backup codes.
    describe('re-enrollment while MFA is already enabled (step-up)', () => {
      const verifiedFactor = {
        id: 'f-old',
        secret: Buffer.from('encrypted-secret-blob'),
      };

      beforeEach(() => {
        prisma.user.findUniqueOrThrow.mockResolvedValue({
          id: 'u1',
          email: 'alice@example.com',
          mfaEnabled: true,
        });
        prisma.mfaFactor.findFirst.mockResolvedValue(verifiedFactor);
      });

      it('rejects with EX_AUTH_MFA_STEP_UP_REQUIRED when no current code is given', async () => {
        await expect(service.enroll('u1')).rejects.toMatchObject({
          response: { exc: 'EX_AUTH_MFA_STEP_UP_REQUIRED' },
        });
        expect(prisma.$transaction).not.toHaveBeenCalled();
        expect(prisma.mfaFactor.create).not.toHaveBeenCalled();
      });

      it('rejects a wrong current code with the same error (no oracle)', async () => {
        mockedVerifyTotp.mockResolvedValue({ valid: false });

        await expect(service.enroll('u1', '000000')).rejects.toMatchObject({
          response: { exc: 'EX_AUTH_MFA_STEP_UP_REQUIRED' },
        });
        expect(prisma.mfaFactor.create).not.toHaveBeenCalled();
      });

      it('accepts a valid code from the current factor and creates the pending factor', async () => {
        mockedVerifyTotp.mockResolvedValue({ valid: true });

        const result = await service.enroll('u1', '123456');

        expect(result.secret).toBe('BASE32SECRETXXXX');
        expect(mockedVerifyTotp).toHaveBeenCalledWith({
          secret: 'BASE32SECRETXXXX',
          token: '123456',
        });
        expect(prisma.mfaFactor.create).toHaveBeenCalledTimes(1);
      });

      it('accepts (and burns) an unused backup code instead of a TOTP code', async () => {
        mockedVerifyTotp.mockResolvedValue({ valid: false });
        prisma.mfaBackupCode.findFirst.mockResolvedValue({ id: 'bc1' });
        prisma.mfaBackupCode.updateMany.mockResolvedValue({ count: 1 });

        await service.enroll('u1', 'backup-code-1');

        expect(prisma.mfaBackupCode.findFirst).toHaveBeenCalledWith({
          where: {
            userId: 'u1',
            codeHash: 'sha256(backup-code-1)',
            usedAt: null,
          },
        });
        expect(prisma.mfaBackupCode.updateMany).toHaveBeenCalledWith({
          where: { id: 'bc1', usedAt: null },
          data: { usedAt: expect.any(Date) as never },
        });
        expect(prisma.mfaFactor.create).toHaveBeenCalledTimes(1);
      });

      it('rejects a backup code that a concurrent caller already claimed', async () => {
        mockedVerifyTotp.mockResolvedValue({ valid: false });
        prisma.mfaBackupCode.findFirst.mockResolvedValue({ id: 'bc1' });
        prisma.mfaBackupCode.updateMany.mockResolvedValue({ count: 0 });

        await expect(
          service.enroll('u1', 'backup-code-1'),
        ).rejects.toMatchObject({
          response: { exc: 'EX_AUTH_MFA_STEP_UP_REQUIRED' },
        });
        expect(prisma.mfaFactor.create).not.toHaveBeenCalled();
      });
    });

    it('first-time enrollment (MFA off) still needs no code', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'u1',
        email: 'alice@example.com',
        mfaEnabled: false,
      });

      await service.enroll('u1');

      expect(mockedVerifyTotp).not.toHaveBeenCalled();
      expect(prisma.mfaFactor.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('verify', () => {
    const factor = { id: 'f1', secret: Buffer.from('encrypted-secret-blob') };

    it('succeeds on a pending factor created by enroll (enroll → verify flow)', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'u1',
        email: 'alice@example.com',
      });
      await service.enroll('u1');

      prisma.mfaFactor.findFirst.mockResolvedValue(factor);
      mockedVerifyTotp.mockResolvedValue({ valid: true });

      const result = await service.verify('u1', '123456');

      expect(result.enabled).toBe(true);
      expect(result.backupCodes).toHaveLength(10);

      expect(prisma.mfaFactor.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ verifiedAt: null }) as never,
        }),
      );
    });

    it('confirms a valid TOTP code, enables MFA, and issues 10 hashed backup codes', async () => {
      prisma.mfaFactor.findFirst.mockResolvedValue(factor);
      mockedVerifyTotp.mockResolvedValue({ valid: true });

      const result = await service.verify('u1', '123456');

      expect(result.enabled).toBe(true);
      expect(result.backupCodes).toHaveLength(10);
      // BE-014: MFA state changes produce an in-app SECURITY notification.
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u1',
          type: 'SECURITY',
          payload: { kind: 'security-mfa-enabled' },
        }),
      );
      // Backup codes returned to the caller must be the raw (unhashed) values.
      result.backupCodes.forEach((code) => {
        expect(code).not.toMatch(/^sha256\(/);
      });

      expect(mockCrypto.decrypt).toHaveBeenCalledWith(factor.secret);
      expect(mockedVerifyTotp).toHaveBeenCalledWith({
        secret: 'BASE32SECRETXXXX',
        token: '123456',
      });

      expect(prisma.mfaFactor.update).toHaveBeenCalledWith({
        where: { id: 'f1' },
        data: {
          verifiedAt: expect.any(Date) as never,
          lastUsedAt: expect.any(Date) as never,
        },
      });
      // BE-030: a completed re-enrollment retires the previous verified
      // factor in the same transaction — the rotation must not leave two
      // live authenticators where login picks whichever is newest.
      expect(prisma.mfaFactor.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'u1',
          method: 'TOTP',
          verifiedAt: { not: null },
          id: { not: 'f1' },
        },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { mfaEnabled: true },
      });

      // Old backup codes are wiped before the new batch is written.
      expect(prisma.mfaBackupCode.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
      const createManyCall = prisma.mfaBackupCode.createMany.mock.calls[0] as [
        { data: { userId: string; codeHash: string }[] },
      ];
      const createManyArg = createManyCall[0];
      expect(createManyArg.data).toHaveLength(10);
      expect(
        createManyArg.data.every(
          (row) => row.userId === 'u1' && row.codeHash.startsWith('sha256('),
        ),
      ).toBe(true);
      // Every persisted hash corresponds 1:1 to a code returned to the caller.
      const returnedHashes = result.backupCodes.map((c) => `sha256(${c})`);
      expect(createManyArg.data.map((r) => r.codeHash).sort()).toEqual(
        returnedHashes.sort(),
      );

      expect(mockOutbox.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateType: 'User',
          aggregateId: 'u1',
          eventType: 'mfa.enabled',
          action: 'MFA_ENABLED',
          actorId: 'u1',
        }),
        expect.anything(),
      );
    });

    it('rejects an invalid TOTP code without enabling MFA or issuing backup codes', async () => {
      prisma.mfaFactor.findFirst.mockResolvedValue(factor);
      mockedVerifyTotp.mockResolvedValue({ valid: false });

      await expect(service.verify('u1', '000000')).rejects.toMatchObject({
        response: { exc: 'EX_VALIDATION_FORM' },
      });
      expect(mockNotifications.create).not.toHaveBeenCalled();

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.mfaBackupCode.createMany).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when no verified TOTP factor exists for the user', async () => {
      prisma.mfaFactor.findFirst.mockResolvedValue(null);

      await expect(service.verify('u1', '123456')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockedVerifyTotp).not.toHaveBeenCalled();
    });
  });

  describe('disable', () => {
    it('disables MFA, removes the factor and backup codes, and emits an audit event', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'u1',
        mfaEnabled: true,
      });
      prisma.mfaFactor.findFirst.mockResolvedValue({
        id: 'f1',
        secret: Buffer.from('encrypted-secret-blob'),
      });
      mockedVerifyTotp.mockResolvedValue({ valid: true });

      const result = await service.disable('u1', '123456');

      expect(result).toBe(true);
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u1',
          type: 'SECURITY',
          payload: { kind: 'security-mfa-disabled' },
        }),
      );
      expect(prisma.mfaFactor.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
      expect(prisma.mfaBackupCode.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { mfaEnabled: false },
      });
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'mfa.disabled',
          action: 'MFA_DISABLED',
          actorId: 'u1',
        }),
        expect.anything(),
      );
    });

    it('throws EX_AUTH_MFA_NOT_ENABLED and does nothing when MFA is already off', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'u1',
        mfaEnabled: false,
      });

      await expect(service.disable('u1', '123456')).rejects.toMatchObject({
        response: { exc: 'EX_AUTH_MFA_NOT_ENABLED' },
      });
      expect(prisma.mfaFactor.findFirst).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects an invalid confirmation code and leaves MFA enabled', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'u1',
        mfaEnabled: true,
      });
      prisma.mfaFactor.findFirst.mockResolvedValue({
        id: 'f1',
        secret: Buffer.from('encrypted-secret-blob'),
      });
      mockedVerifyTotp.mockResolvedValue({ valid: false });

      await expect(service.disable('u1', '000000')).rejects.toMatchObject({
        response: { exc: 'EX_VALIDATION_FORM' },
      });
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(prisma.mfaFactor.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('resetMfa', () => {
    it('force-disables MFA for a target user without requiring a TOTP code', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'target-user',
        mfaEnabled: true,
      });

      const result = await service.resetMfa('target-user');

      expect(result).toBe(true);
      // No TOTP verification step: never touches otplib or the factor secret.
      expect(mockedVerifyTotp).not.toHaveBeenCalled();
      expect(prisma.mfaFactor.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'target-user' },
      });
      expect(prisma.mfaBackupCode.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'target-user' },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'target-user' },
        data: { mfaEnabled: false },
      });
      expect(mockOutbox.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'mfa.reset',
          action: 'UPDATE',
          actorId: 'target-user',
          summary: 'MFA reset by administrator',
        }),
        expect.anything(),
      );
    });

    it('returns false and makes no changes when the target user has no MFA enabled', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'target-user',
        mfaEnabled: false,
      });

      const result = await service.resetMfa('target-user');

      expect(result).toBe(false);
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.mfaFactor.deleteMany).not.toHaveBeenCalled();
      expect(mockOutbox.emit).not.toHaveBeenCalled();
    });
  });
});
