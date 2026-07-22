import { Logger, UnauthorizedException } from '@nestjs/common';
import { verify } from '@node-rs/argon2';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { OutboxService } from '../outbox/outbox.service';
import {
  DeviceService,
  type DeviceContext,
  type RequestContext,
} from '../devices/device.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { TokenStoreService } from './token-store.service';
import { UsernameService } from './username.service';
import { MailService } from '../mail/mail.service';
import type { AuthPayload } from './auth.types';
import type { LoginInput } from './dto/login.input';
import type { OAuthProfile } from './auth.service';

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

export class AuthLoginService {
  private readonly logger = new Logger(AuthLoginService.name);

  private readonly dummyHash =
    '$argon2id$v=19$m=19456,t=2,p=1$jR9YxgR+3qJxJkOdVAgY8w$fP2MrFNLm5x3nDN1sFq2ATSB7P4tYpQeF3WrTYG0XEQ';

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly outbox: OutboxService,
    private readonly devices: DeviceService,
    private readonly tokenStore: TokenStoreService,
    private readonly usernames: UsernameService,
    private readonly mail: MailService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async login(
    input: LoginInput,
    ctx: RequestContext | undefined,
    issueTokens: (
      user: User,
      ctx?: RequestContext,
      device?: DeviceContext,
    ) => Promise<AuthPayload>,
  ): Promise<AuthPayload> {
    const email = input.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user?.passwordHash) {
      await verify(this.dummyHash, input.password);
      throw new UnauthorizedException({
        exc: 'EX_AUTH_INVALID_CREDENTIALS',
        msg: 'Invalid credentials',
        key: 'auth.errors.invalidCredentials',
      });
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException({
        exc: 'EX_AUTH_ACCOUNT_LOCKED',
        msg: 'Account temporarily locked',
        key: 'auth.errors.accountLocked',
      });
    }

    const ok = await verify(user.passwordHash, input.password);
    if (!ok) {
      await this.registerFailedLogin(user);
      throw new UnauthorizedException({
        exc: 'EX_AUTH_INVALID_CREDENTIALS',
        msg: 'Invalid credentials',
        key: 'auth.errors.invalidCredentials',
      });
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        exc: 'EX_AUTH_ACCOUNT_INACTIVE',
        msg:
          user.status === 'PENDING_VERIFICATION'
            ? 'Please verify your email first'
            : 'Account is not active',
        key:
          user.status === 'PENDING_VERIFICATION'
            ? 'auth.errors.emailNotVerified'
            : 'auth.errors.accountInactive',
      });
    }

    if (user.mfaEnabled) {
      const mfaToken = this.crypto.randomToken();
      const mfaTokenHash = this.crypto.sha256(mfaToken);
      await this.tokenStore.writeMfaChallenge(mfaTokenHash, {
        userId: user.id,
        email: user.email,
        role: user.role,
        tier: user.subscriptionTier ?? 'FREE',
      });
      return { mfaRequired: true, mfaToken, user };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        ...(input.timezone ? { timezone: input.timezone } : {}),
      },
    });

    const device = ctx
      ? await this.devices.resolveForLogin(user.id, ctx)
      : undefined;
    await this.outbox.emit({
      aggregateType: 'User',
      aggregateId: user.id,
      eventType: 'auth.login',
      action: 'LOGIN',
      actorId: user.id,
      summary: `User ${email} logged in`,
      ip: device?.ip ?? null,
      userAgent: device?.userAgent ?? null,
    });
    if (device?.changed) await this.emitNewDevice(user.id, device);

    return issueTokens(user, ctx, device);
  }

  async verifyLoginMfa(
    mfaToken: string,
    code: string,
    ctx: RequestContext | undefined,
    issueTokens: (
      user: User,
      ctx?: RequestContext,
      device?: DeviceContext,
    ) => Promise<AuthPayload>,
  ): Promise<AuthPayload> {
    const tokenHash = this.crypto.sha256(mfaToken);
    const challenge = await this.tokenStore.consumeMfaChallenge(tokenHash);
    if (!challenge) {
      throw new UnauthorizedException({
        exc: 'EX_AUTH_MFA_EXPIRED',
        msg: 'MFA challenge expired or already used',
        key: 'auth.errors.mfaChallengeExpired',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: challenge.userId },
    });
    if (!user?.mfaEnabled) {
      throw new UnauthorizedException({
        exc: 'EX_AUTH_MFA_NOT_ENABLED',
        msg: 'MFA is not enabled for this account',
        key: 'auth.errors.mfaNotEnabled',
      });
    }

    const totpVerified = await this.verifyTotpCode(user.id, code);
    if (!totpVerified) {
      const backupUsed = await this.verifyBackupCode(user.id, code);
      if (!backupUsed)
        throw new UnauthorizedException({
          exc: 'EX_AUTH_MFA_INVALID_CODE',
          msg: 'Invalid MFA code',
          key: 'auth.errors.mfaInvalidCode',
        });
    }

    return issueTokens(user, ctx);
  }

  async loginWithOAuth(
    profile: OAuthProfile,
    ctx: RequestContext | undefined,
    issueTokens: (
      user: User,
      ctx?: RequestContext,
      device?: DeviceContext,
    ) => Promise<AuthPayload>,
    issuePasswordResetToken: (userId: string, email: string) => Promise<string>,
    frontendUrl: string,
  ): Promise<AuthPayload> {
    if (!profile.providerAccountId) {
      throw new UnauthorizedException(
        'OAuth profile is missing a provider account id',
      );
    }

    const email = profile.email.toLowerCase();
    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: { user: true },
    });

    if (account) {
      const device = ctx
        ? await this.devices.resolveForLogin(account.userId, ctx)
        : undefined;
      await this.outbox.emit({
        aggregateType: 'User',
        aggregateId: account.userId,
        eventType: 'auth.login',
        action: 'LOGIN',
        actorId: account.userId,
        summary: `OAuth login via ${profile.provider}`,
        ip: device?.ip ?? null,
        userAgent: device?.userAgent ?? null,
      });
      if (device?.changed) await this.emitNewDevice(account.userId, device);
      return issueTokens(account.user, ctx, device);
    }

    let isNewUser = false;
    const user = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email } });
      const isNew = !existing;
      const username = isNew
        ? await this.usernames.generate(email, tx)
        : undefined;
      const target =
        existing ??
        (await tx.user.create({
          data: {
            email,
            name: profile.name ?? null,
            username,
            status: 'ACTIVE',
            emailVerifiedAt: new Date(),
          },
        }));
      if (isNew) isNewUser = true;
      await tx.account.create({
        data: {
          userId: target.id,
          type: profile.type,
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      });
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: target.id,
          eventType: existing ? 'auth.account_linked' : 'user.signup',
          action: existing ? 'LOGIN' : 'SIGNUP',
          actorId: target.id,
          summary: `${existing ? 'Linked' : 'Created'} ${profile.provider} account`,
        },
        tx,
      );
      return target;
    });

    const device = ctx
      ? await this.devices.resolveForLogin(user.id, ctx)
      : undefined;
    if (device?.changed) await this.emitNewDevice(user.id, device);

    if (isNewUser) {
      const rawToken = await issuePasswordResetToken(user.id, user.email);
      const setPasswordUrl = `${frontendUrl}/auth/reset-password?token=${rawToken}`;
      await this.mail.enqueue({
        to: user.email,
        userId: user.id,
        subject: 'Welcome — set your password',
        template: 'welcome-social',
        variables: {
          username: user.username ?? 'unknown',
          name: user.name,
          email: user.email,
          url: setPasswordUrl,
          provider: profile.provider,
        },
      });
    }

    return issueTokens(user, ctx, device);
  }

  private async verifyTotpCode(userId: string, code: string): Promise<boolean> {
    const factor = await this.prisma.mfaFactor.findFirst({
      where: { userId, method: 'TOTP', verifiedAt: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    if (!factor?.secret) return false;

    const secret = this.crypto.decrypt(Buffer.from(factor.secret));
    const result = await import('otplib').then((m) =>
      m.verify({ secret, token: code }),
    );
    if (!result.valid) return false;

    await this.prisma.mfaFactor.update({
      where: { id: factor.id },
      data: { lastUsedAt: new Date() },
    });
    return true;
  }

  private async verifyBackupCode(
    userId: string,
    code: string,
  ): Promise<boolean> {
    const codeHash = this.crypto.sha256(code);
    const backupCode = await this.prisma.mfaBackupCode.findFirst({
      where: { userId, codeHash, usedAt: null },
    });
    if (!backupCode) return false;
    await this.prisma.mfaBackupCode.update({
      where: { id: backupCode.id },
      data: { usedAt: new Date() },
    });
    return true;
  }

  private async registerFailedLogin(user: User): Promise<void> {
    const failed = user.failedLoginCount + 1;
    const lock = failed >= MAX_FAILED_LOGINS;
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: failed,
        lockedUntil: lock
          ? new Date(Date.now() + LOCK_MINUTES * 60_000)
          : user.lockedUntil,
      },
    });
    await this.outbox.emit({
      aggregateType: 'User',
      aggregateId: user.id,
      eventType: 'auth.login.failed',
      action: 'LOGIN_FAILED',
      level: 'WARN',
      actorId: user.id,
      summary: `Failed login #${failed}${lock ? ' (account locked)' : ''}`,
    });
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

    this.realtime.emitToUser(userId, {
      type: 'device-logged-in',
      device: {
        id: device.deviceId,
        ip: device.ip,
        userAgent: device.userAgent,
      },
    });
  }
}
