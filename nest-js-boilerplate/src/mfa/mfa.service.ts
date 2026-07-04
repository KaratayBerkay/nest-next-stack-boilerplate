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
    const factor = await this.prisma.mfaFactor.findFirst({
      where: { userId, method: 'TOTP' },
      orderBy: { createdAt: 'desc' },
    });
    if (!factor?.secret) {
      throw new NotFoundException('No TOTP enrollment in progress');
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
