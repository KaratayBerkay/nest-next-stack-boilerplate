import { randomBytes } from 'node:crypto';
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { generateSecret, generateURI, verify as verifyTotp } from 'otplib';
import { CryptoService } from '../common/crypto/crypto.service';
import { NotificationService } from '../notification/notification.service';
import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import { MfaEnrollPayload, MfaVerifyPayload } from './mfa.types';

const ISSUER = 'NestBoilerplate';
const BACKUP_CODE_COUNT = 10;

@Injectable()
export class MfaService {
  private readonly logger = new Logger(MfaService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly outbox: OutboxService,
    private readonly notifications: NotificationService,
  ) {}

  /**
   * In-app SECURITY notification for MFA state changes (BE-014). Best-effort:
   * the factor change is already committed, a notification failure must not
   * surface as an MFA error.
   */
  private async notifySecurity(
    userId: string,
    title: string,
    body: string,
    kind: string,
  ): Promise<void> {
    await this.notifications
      .create({
        userId,
        actorId: userId,
        type: 'SECURITY',
        title,
        body,
        payload: { kind },
      })
      .catch((err: Error) =>
        this.logger.warn(
          `SECURITY notification failed for ${userId}: ${err.message}`,
        ),
      );
  }

  /**
   * Begin TOTP enrollment: create a pending (unverified) factor with an
   * encrypted secret.
   *
   * Re-enrolling while MFA is already on (rotating the authenticator) is a
   * step-up operation: it must be proven with a code from the *current*
   * factor (or an unused backup code). Otherwise an already-authenticated
   * — possibly hijacked — session could install its own second factor and
   * wipe the owner's backup codes with nothing more than SessionAuthGuard
   * behind it. First-time enrollment needs no code (there is nothing to
   * prove it against yet).
   */
  async enroll(
    userId: string,
    currentCode?: string,
  ): Promise<MfaEnrollPayload> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (user.mfaEnabled) await this.assertStepUp(userId, currentCode);

    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: ISSUER,
      label: user.email,
      secret,
    });

    // Replace any prior pending TOTP factor, then store the new one encrypted
    // at rest — same transaction, not two top-level writes. Otherwise two
    // concurrent enroll() calls (double-click, two tabs) can each pass the
    // deleteMany before either creates, leaving two pending factors at once;
    // a crash between the two calls could also leave the user with none.
    await this.prisma.$transaction(async (tx) => {
      await tx.mfaFactor.deleteMany({
        where: { userId, method: 'TOTP', verifiedAt: null },
      });
      await tx.mfaFactor.create({
        data: {
          userId,
          method: 'TOTP',
          secret: Uint8Array.from(this.crypto.encrypt(secret)),
        },
      });
    });

    return { otpauthUrl, secret };
  }

  /**
   * Confirm a TOTP code, enable MFA on the user, and issue one-time backup
   * codes. When this completes a re-enrollment (enroll() already required
   * the step-up to create the pending factor), the previous verified factor
   * is retired in the same transaction — the rotation replaces the
   * authenticator, it must not leave two live ones where login picks
   * whichever is newest.
   */
  async verify(userId: string, code: string): Promise<MfaVerifyPayload> {
    const factor = await this.findPendingFactor(userId);

    await this.assertValidTotp(factor, code);

    const { codes, hashes } = this.generateBackupCodes();

    await this.prisma.$transaction(async (tx) => {
      await tx.mfaFactor.deleteMany({
        where: {
          userId,
          method: 'TOTP',
          verifiedAt: { not: null },
          id: { not: factor.id },
        },
      });
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

    await this.notifySecurity(
      userId,
      'Two-factor authentication enabled',
      "Sign-ins now require your authenticator app. If you didn't do this, change your password immediately.",
      'security-mfa-enabled',
    );

    return { enabled: true, backupCodes: codes };
  }

  /** Disable MFA for the authenticated user. Requires a valid TOTP code to confirm. */
  async disable(userId: string, code: string): Promise<boolean> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (!user.mfaEnabled) {
      throw new BadRequestException({
        exc: 'EX_AUTH_MFA_NOT_ENABLED',
        msg: 'MFA is not enabled for this account',
        key: 'auth.errors.mfaNotEnabled',
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

    await this.notifySecurity(
      userId,
      'Two-factor authentication disabled',
      "Your account no longer asks for a second factor at sign-in. If you didn't do this, re-enable it and change your password.",
      'security-mfa-disabled',
    );

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

  /**
   * Step-up for MFA-management on an account that already has MFA on: the
   * caller must present a valid code from the current verified factor, or
   * burn one unused backup code. Same 403 either way so a missing code and
   * a wrong code are indistinguishable to a probing caller.
   */
  private async assertStepUp(userId: string, code?: string): Promise<void> {
    const rejected = () =>
      new ForbiddenException({
        exc: 'EX_AUTH_MFA_STEP_UP_REQUIRED',
        msg: 'Enter a current authenticator or backup code to change two-factor settings',
        key: 'auth.errors.mfaStepUpRequired',
      });
    if (!code) throw rejected();

    const factor = await this.prisma.mfaFactor.findFirst({
      where: { userId, method: 'TOTP', verifiedAt: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    if (factor?.secret) {
      const secret = this.crypto.decrypt(Buffer.from(factor.secret));
      const result = await verifyTotp({ secret, token: code });
      if (result.valid) return;
    }

    // Same atomic single-use claim AuthLoginService.verifyBackupCode makes —
    // the WHERE re-checks usedAt at write time, so a code can't be spent
    // twice by concurrent callers.
    const backup = await this.prisma.mfaBackupCode.findFirst({
      where: { userId, codeHash: this.crypto.sha256(code), usedAt: null },
    });
    if (backup) {
      const claimed = await this.prisma.mfaBackupCode.updateMany({
        where: { id: backup.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (claimed.count === 1) return;
    }
    throw rejected();
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

  private async findPendingFactor(userId: string) {
    const factor = await this.prisma.mfaFactor.findFirst({
      where: { userId, method: 'TOTP', verifiedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!factor?.secret) {
      throw new NotFoundException(
        'No pending TOTP factor found — enroll before verifying',
      );
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
