import {
  ConflictException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash } from '@node-rs/argon2';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { OutboxService } from '../outbox/outbox.service';
import { MailService } from '../mail/mail.service';
import {
  DeviceService,
  type DeviceContext,
  type RequestContext,
} from '../devices/device.service';
import { TokenStoreService } from './token-store.service';
import { UsernameService } from './username.service';
import type { AuthPayload } from './auth.types';
import type { RegisterInput } from './dto/register.input';
import { validatePasswordStrength } from '../common/utils/password';

const EMAIL_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

export class AuthRegistrationService {
  private readonly logger = new Logger(AuthRegistrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly outbox: OutboxService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
    private readonly usernames: UsernameService,
    private readonly devices: DeviceService,
  ) {}

  async register(
    input: RegisterInput,
    ctx: RequestContext | undefined,
    issueTokens: (
      user: User,
      ctx?: RequestContext,
      device?: DeviceContext,
    ) => Promise<AuthPayload>,
  ): Promise<AuthPayload> {
    const email = input.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing)
      throw new ConflictException({
        exc: 'EX_AUTH_EMAIL_TAKEN',
        msg: 'Email already registered',
        key: 'auth.errors.emailTaken',
      });

    validatePasswordStrength(input.password);
    const passwordHash = await hash(input.password);
    const rawToken = this.crypto.randomToken();
    const tokenHash = this.crypto.sha256(rawToken);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          name: input.name ?? null,
          passwordHash,
          passwordSetAt: new Date(),
          status: 'PENDING_VERIFICATION',
          ...(input.timezone ? { timezone: input.timezone } : {}),
        },
      });
      await tx.verificationToken.create({
        data: {
          userId: created.id,
          type: 'EMAIL_VERIFICATION',
          tokenHash,
          identifier: email,
          expiresAt: new Date(Date.now() + EMAIL_TOKEN_TTL_MS),
        },
      });
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: created.id,
          eventType: 'user.signup',
          action: 'SIGNUP',
          actorId: created.id,
          summary: `User ${email} registered with credentials`,
          after: { email, status: created.status },
        },
        tx,
      );
      return created;
    });

    const verifyUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/auth/verify-email?token=${rawToken}`;
    await this.mail.enqueue({
      to: email,
      userId: user.id,
      subject: 'Confirm your email',
      template: 'email-verification',
      variables: { url: verifyUrl, name: user.name },
    });

    const device = ctx
      ? await this.devices.resolveForLogin(user.id, ctx)
      : undefined;
    if (device?.changed) await this.emitNewDevice(user.id, device);
    return issueTokens(user, ctx, device);
  }

  async devActivateUser(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return false;
    if (user.status !== 'PENDING_VERIFICATION') return false;
    await this.prisma.user.update({
      where: { id: user.id },
      data: { status: 'ACTIVE', emailVerifiedAt: new Date() },
    });
    return true;
  }

  async verifyEmail(rawToken: string): Promise<User> {
    const tokenHash = this.crypto.sha256(rawToken);
    const token = await this.prisma.verificationToken.findUnique({
      where: { tokenHash },
    });

    if (
      token?.type !== 'EMAIL_VERIFICATION' ||
      token.consumedAt ||
      token.expiresAt < new Date() ||
      !token.userId
    ) {
      throw new UnauthorizedException({
        exc: 'EX_AUTH_INVALID_TOKEN',
        msg: 'Invalid or expired token',
        key: 'auth.errors.invalidToken',
      });
    }

    const userId = token.userId;
    return this.prisma.$transaction(async (tx) => {
      await tx.verificationToken.update({
        where: { id: token.id },
        data: { consumedAt: new Date() },
      });
      const updated = await tx.user.update({
        where: { id: userId },
        data: { emailVerifiedAt: new Date(), status: 'ACTIVE' },
      });
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: userId,
          eventType: 'user.email_verified',
          action: 'EMAIL_VERIFIED',
          actorId: userId,
          summary: `Email verified for ${updated.email}`,
        },
        tx,
      );
      return updated;
    });
  }

  private async issuePasswordResetToken(
    userId: string,
    email: string,
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const rawToken = this.crypto.randomToken();
    const tokenHash = this.crypto.sha256(rawToken);
    await tx.verificationToken.create({
      data: {
        userId,
        type: 'PASSWORD_RESET',
        tokenHash,
        identifier: email,
        expiresAt: new Date(Date.now() + EMAIL_TOKEN_TTL_MS),
      },
    });
    return rawToken;
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return true;

    const rawToken = await this.prisma.$transaction(async (tx) =>
      this.issuePasswordResetToken(user.id, user.email, tx),
    );
    const resetUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/auth/reset-password?token=${rawToken}`;
    await this.mail.enqueue({
      to: user.email,
      userId: user.id,
      subject: 'Reset your password',
      template: 'password-reset',
      variables: { url: resetUrl },
    });
    return true;
  }

  async resetPassword(
    rawToken: string,
    newPassword: string,
    tokenStore: TokenStoreService,
  ): Promise<boolean> {
    validatePasswordStrength(newPassword);
    const tokenHash = this.crypto.sha256(rawToken);
    const passwordHash = await hash(newPassword);

    const result = await this.prisma.$transaction(async (tx) => {
      const token = await tx.verificationToken.findUnique({
        where: { tokenHash },
      });
      if (
        token?.type !== 'PASSWORD_RESET' ||
        token.consumedAt ||
        token.expiresAt < new Date() ||
        !token.userId
      ) {
        throw new UnauthorizedException({
          exc: 'EX_AUTH_INVALID_TOKEN',
          msg: 'Invalid or expired token',
          key: 'auth.errors.invalidToken',
        });
      }
      const userId = token.userId;
      await tx.verificationToken.update({
        where: { id: token.id },
        data: { consumedAt: new Date() },
      });
      await tx.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          passwordSetAt: new Date(),
          failedLoginCount: 0,
          lockedUntil: null,
        },
      });
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user) {
        await this.outbox.emit(
          {
            aggregateType: 'User',
            aggregateId: userId,
            eventType: 'user.password_reset',
            action: 'PASSWORD_CHANGED',
            actorId: userId,
            summary: `Password reset for ${user.email}`,
          },
          tx,
        );
      }
      return userId;
    });

    await tokenStore.revokeAllForUser(result);
    return true;
  }

  async issuePasswordResetTokenStandalone(
    userId: string,
    email: string,
  ): Promise<string> {
    return this.prisma.$transaction(async (tx) =>
      this.issuePasswordResetToken(userId, email, tx),
    );
  }

  private async emitNewDevice(
    userId: string,
    device: DeviceContext,
  ): Promise<void> {
    await this.outbox.emit({
      aggregateType: 'Device',
      aggregateId: device.deviceId,
      eventType: 'auth.device.new',
      action: 'CREATE',
      level: 'WARN',
      actorId: userId,
      summary: 'Sign-in from a new device',
      ip: device.ip,
      userAgent: device.userAgent,
    });
  }
}
