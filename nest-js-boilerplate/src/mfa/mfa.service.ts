import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { generateSecret, generateURI, verify as verifyTotp } from 'otplib';
import { CryptoService } from '../common/crypto/crypto.service';
import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import { MfaEnrollPayload, MfaVerifyPayload } from './mfa.types';

const ISSUER = 'NestBoilerplate';
const BACKUP_CODE_COUNT = 10;

@Injectable()
export class MfaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly outbox: OutboxService,
  ) {}

  /** Begin TOTP enrollment: create a pending (unverified) factor with an encrypted secret. */
  async enroll(userId: string): Promise<MfaEnrollPayload> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: ISSUER,
      label: user.email,
      secret,
    });

    // Replace any prior pending TOTP factor, then store the new one encrypted at rest.
    await this.prisma.mfaFactor.deleteMany({
      where: { userId, method: 'TOTP', verifiedAt: null },
    });
    await this.prisma.mfaFactor.create({
      data: {
        userId,
        method: 'TOTP',
        secret: Uint8Array.from(this.crypto.encrypt(secret)),
      },
    });

    return { otpauthUrl, secret };
  }

  /** Confirm a TOTP code, enable MFA on the user, and issue one-time backup codes. */
  async verify(userId: string, code: string): Promise<MfaVerifyPayload> {
    const factor = await this.findVerifiedFactor(userId);

    await this.assertValidTotp(factor, code);

    const { codes, hashes } = this.generateBackupCodes();

    await this.prisma.$transaction(async (tx) => {
      await tx.mfaFactor.update({
        where: { id: factor.id },
        data: { verifiedAt: new Date(), lastUsedAt: new Date() },
      });
      await tx.user.update({
        where: { id: userId },
        data: { mfaEnabled: true },
      });
      await tx.mfaBackupCode.deleteMany({ where: { userId } });
      await tx.mfaBackupCode.createMany({
        data: hashes.map((codeHash) => ({ userId, codeHash })),
      });
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: userId,
          eventType: 'mfa.enabled',
          action: 'MFA_ENABLED',
          actorId: userId,
          summary: 'TOTP MFA enabled',
        },
        tx,
      );
    });

    return { enabled: true, backupCodes: codes };
  }

  /** Disable MFA for the authenticated user. Requires a valid TOTP code to confirm. */
  async disable(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (!user.mfaEnabled) {
      throw new BadRequestException({
        exc: 'EX_MFA_NOT_ENABLED',
        msg: 'MFA is not enabled for this account',
        key: 'mfa.errors.notEnabled',
      });
    }

    const factor = await this.findVerifiedFactor(userId);
    await this.assertValidTotp(factor, code);

    await this.prisma.$transaction(async (tx) => {
      await tx.mfaFactor.deleteMany({ where: { userId } });
      await tx.mfaBackupCode.deleteMany({ where: { userId } });
      await tx.user.update({
        where: { id: userId },
        data: { mfaEnabled: false },
      });
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: userId,
          eventType: 'mfa.disabled',
          action: 'MFA_DISABLED',
          actorId: userId,
          summary: 'TOTP MFA disabled',
        },
        tx,
      );
    });

    return true;
  }

  /** Admin-only: reset MFA for a target user. No TOTP verification required. */
  async resetMfa(targetUserId: string): Promise<boolean> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: targetUserId },
    });
    if (!user.mfaEnabled) return false;

    await this.prisma.$transaction(async (tx) => {
      await tx.mfaFactor.deleteMany({ where: { userId: targetUserId } });
      await tx.mfaBackupCode.deleteMany({ where: { userId: targetUserId } });
      await tx.user.update({
        where: { id: targetUserId },
        data: { mfaEnabled: false },
      });
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: targetUserId,
          eventType: 'mfa.reset',
          action: 'UPDATE',
          actorId: targetUserId,
          summary: 'MFA reset by administrator',
        },
        tx,
      );
    });

    return true;
  }

  private async findVerifiedFactor(userId: string) {
    const factor = await this.prisma.mfaFactor.findFirst({
      where: { userId, method: 'TOTP', verifiedAt: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    if (!factor?.secret) {
      throw new NotFoundException('No verified TOTP factor found');
    }
    return factor;
  }

  private async assertValidTotp(
    factor: { secret: Uint8Array<ArrayBufferLike> | null },
    code: string,
  ): Promise<void> {
    if (!factor.secret) {
      throw new NotFoundException('No verified TOTP factor found');
    }
    const secret = this.crypto.decrypt(Buffer.from(factor.secret));
    const result = await verifyTotp({ secret, token: code });
    if (!result.valid) {
      throw new BadRequestException({
        exc: 'EX_VALIDATION_FORM',
        msg: 'Invalid TOTP code',
        key: 'mfa.errors.invalidTotp',
      });
    }
  }

  private generateBackupCodes(): { codes: string[]; hashes: string[] } {
    const codes: string[] = [];
    const hashes: string[] = [];
    for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
      const code = randomBytes(5).toString('hex'); // 10 hex chars
      codes.push(code);
      hashes.push(this.crypto.sha256(code));
    }
    return { codes, hashes };
  }
}
