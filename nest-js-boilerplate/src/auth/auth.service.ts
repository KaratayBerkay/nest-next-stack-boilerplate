import { hash, verify } from '@node-rs/argon2';
import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProviderType, User } from '@prisma/client';
import { CryptoService } from '../common/crypto/crypto.service';
import { DeviceService } from '../devices/device.service';
import type { DeviceContext, RequestContext } from '../devices/device.service';
import { MailService } from '../mail/mail.service';
import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthPayload, SessionUserInput } from './auth.types';
import { accessCookieName } from './access-cookie';
import { rbacCookieName, rbacCookieOptions } from './rbac-cookie';
import { deviceCookieName } from '../devices/device-cookie';
import { parseDeviceType } from '../common/utils/device-type';
import { SessionHydrationService } from './session-hydration.service';
import { TokenDerivationService } from './token-derivation.service';
import { TokenStoreService } from './token-store.service';
import { UsernameService } from './username.service';
import { userCookieName, userCookieOptions } from './user-cookie';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
const EMAIL_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24h

export interface OAuthProfile {
  type: AuthProviderType;
  provider: string;
  providerAccountId: string;
  email: string;
  name?: string | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly crypto: CryptoService,
    private readonly outbox: OutboxService,
    private readonly mail: MailService,
    private readonly devices: DeviceService,
    private readonly tokenStore: TokenStoreService,
    private readonly hydration: SessionHydrationService,
    private readonly derivation: TokenDerivationService,
    private readonly usernames: UsernameService,
  ) {}

  /** Register with credentials, queue a confirmation email, and emit a SIGNUP audit event. */
  async register(
    input: RegisterInput,
    ctx?: RequestContext,
  ): Promise<AuthPayload> {
    const email = input.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing)
      throw new ConflictException({
        exc: 'EX_AUTH_EMAIL_TAKEN',
        msg: 'Email already registered',
        key: 'auth.errors.emailTaken',
      });

    const passwordHash = await hash(input.password);
    const rawToken = this.crypto.randomToken();
    const tokenHash = this.crypto.sha256(rawToken);

    // User + verification token + outbox event all commit atomically.
    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          name: input.name ?? null,
          passwordHash,
          passwordSetAt: new Date(),
          status: 'PENDING_VERIFICATION',
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

    // Off the request path: the email goes onto the broker, not sent inline.
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
    return this.issueTokens(user, ctx, device);
  }

  // Dummy hash for timing side-channel defense — pre-computed argon2 hash of
  // a random string. Used when the email doesn't exist so both paths take
  // comparable time.
  private readonly dummyHash =
    '$argon2id$v=19$m=19456,t=2,p=1$jR9YxgR+3qJxJkOdVAgY8w$fP2MrFNLm5x3nDN1sFq2ATSB7P4tYpQeF3WrTYG0XEQ';

  /** Verify credentials with lockout + failed-attempt tracking; emit LOGIN / LOGIN_FAILED. */
  async login(input: LoginInput, ctx?: RequestContext): Promise<AuthPayload> {
    const email = input.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
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

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
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

    return this.issueTokens(user, ctx, device);
  }

  /** Consume an email-verification token: marks it used and activates the account. */
  async verifyEmail(rawToken: string): Promise<User> {
    const tokenHash = this.crypto.sha256(rawToken);
    const token = await this.prisma.verificationToken.findUnique({
      where: { tokenHash },
    });

    if (
      !token ||
      token.type !== 'EMAIL_VERIFICATION' ||
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
    const user = await this.prisma.$transaction(async (tx) => {
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

    return user;
  }

  /** Issue a PASSWORD_RESET token inside an existing transaction (shared helper for forgot-password and welcome flow). */
  private async issuePasswordResetToken(
    userId: string,
    email: string,
    tx: {
      verificationToken: {
        create: (data: unknown) => Promise<unknown>;
      };
    },
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

  /** Request a password reset. Always returns success regardless of whether the email exists. */
  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return true;

    const rawToken = await this.prisma.$transaction(async (tx) => {
      return this.issuePasswordResetToken(user.id, user.email, tx);
    });

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

  /** Consume a password-reset token and set a new password. */
  async resetPassword(rawToken: string, newPassword: string): Promise<boolean> {
    const tokenHash = this.crypto.sha256(rawToken);
    const passwordHash = await hash(newPassword);

    const result = await this.prisma.$transaction(async (tx) => {
      const token = await tx.verificationToken.findUnique({
        where: { tokenHash },
      });

      if (
        !token ||
        token.type !== 'PASSWORD_RESET' ||
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

    // Revoke all existing sessions — password reset should evict the attacker too.
    await this.tokenStore.revokeAllForUser(result);
    return true;
  }

  /** Social login: upsert the provider Account, find-or-create the User, issue tokens. */
  async loginWithOAuth(
    profile: OAuthProfile,
    ctx?: RequestContext,
  ): Promise<AuthPayload> {
    // Fail closed: an empty providerAccountId would make every user of this
    // provider collide on the same (provider, '') Account row — i.e. everyone
    // logs into the first user's account.
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
      return this.issueTokens(account.user, ctx, device);
    }

    // No linked account yet: attach to an existing email or create a verified user.
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
      const rawToken = await this.prisma.$transaction(async (tx) => {
        return this.issuePasswordResetToken(user.id, user.email, tx);
      });
      const setPasswordUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/auth/reset-password?token=${rawToken}`;
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

    return this.issueTokens(user, ctx, device);
  }

  /** Audit a sign-in from a previously-unseen device (CREATE on the Device aggregate). */
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

  /** Revoke the Redis compound key for the presented tokens and clear cookies. */
  async logout(ctx: RequestContext): Promise<boolean> {
    const accessToken = this.extractAccessToken(ctx);
    const rbacToken = this.extractRbacToken(ctx);
    const deviceToken = this.extractDeviceToken(ctx);
    const userToken = this.extractUserToken(ctx);

    if (accessToken && rbacToken) {
      const key = this.tokenStore.buildKey(
        accessToken,
        rbacToken,
        deviceToken ?? '',
        userToken ?? '',
      );
      const session = await this.tokenStore.read(key);
      if (session?.sessionId) {
        const durationMs = session.issuedAt
          ? Date.now() - new Date(session.issuedAt).getTime()
          : 0;
        this.logger.log({
          category: 'session',
          event: 'session.end',
          token: session.sessionId,
          userId: session.userId,
          sessionDurationMs: durationMs,
          reason: 'logout',
        });
      }
      await this.tokenStore.revoke(key);
    }

    this.clearRbacCookie(ctx);
    this.clearUserCookie(ctx);
    return true;
  }

  /** Revoke the Redis compound key for the tokens presented in this request. */
  private async revokePresentedKey(ctx: RequestContext): Promise<void> {
    const accessToken = this.extractAccessToken(ctx);
    const rbacToken = this.extractRbacToken(ctx);
    const deviceToken = this.extractDeviceToken(ctx);
    const userToken = this.extractUserToken(ctx);
    if (accessToken && rbacToken) {
      const key = this.tokenStore.buildKey(
        accessToken,
        rbacToken,
        deviceToken ?? '',
        userToken ?? '',
      );
      await this.tokenStore.revoke(key);
    }
  }

  private async issueTokens(
    user: User,
    ctx?: RequestContext,
    device?: DeviceContext,
  ): Promise<AuthPayload> {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const rbacToken = this.derivation.deriveRbacToken(
      user.id,
      user.subscriptionTier ?? 'FREE',
    );
    const userToken = this.derivation.deriveUserToken(user.id);

    // Hydrate the runtime snapshot then write the Redis compound key.
    const snapshot = await this.hydration.hydrate(user);

    const sessionId = this.crypto.randomToken();

    const compoundKey = this.tokenStore.buildKey(
      accessToken,
      rbacToken,
      device?.deviceToken ?? '',
      userToken,
    );
    await this.tokenStore.write(compoundKey, {
      userId: user.id,
      email: user.email,
      role: user.role,
      tier: user.subscriptionTier ?? 'FREE',
      deviceId: device?.deviceId ?? null,
      ip: device?.ip ?? null,
      userAgent: device?.userAgent ?? null,
      sessionId,
      ...snapshot,
    } as SessionUserInput);

    this.logger.log({
      category: 'session',
      event: 'session.start',
      token: sessionId,
      userId: user.id,
      ip: device?.ip,
      deviceId: device?.deviceId,
      deviceType: parseDeviceType(device?.userAgent),
      userAgent: device?.userAgent,
      issuedAt: new Date().toISOString(),
    });

    this.setRbacCookie(ctx, rbacToken);
    this.setUserCookie(ctx, userToken);

    return {
      accessToken,
      rbacToken,
      userToken,
      deviceId: device?.deviceId,
      deviceToken: device?.deviceToken,
      user,
    };
  }

  // --- Token extraction from request context ---

  private extractAccessToken(ctx: RequestContext): string | null {
    const header = ctx.req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice(7);
    }
    const name = accessCookieName(this.config);
    const bag = (ctx.req as unknown as { cookies?: Record<string, string> })
      .cookies;
    return bag?.[name] ?? null;
  }

  private extractRbacToken(ctx: RequestContext): string | null {
    // Cookie first, then header (same precedence pattern as the access token).
    const name = rbacCookieName(this.config);
    const bag = (ctx.req as unknown as { cookies?: Record<string, string> })
      .cookies;
    const fromCookie = bag?.[name] ?? null;
    if (fromCookie) return fromCookie;
    const header = ctx.req.headers['x-rbac-token'];
    return (Array.isArray(header) ? header[0] : header) ?? null;
  }

  private extractDeviceToken(ctx: RequestContext): string | null {
    const name = deviceCookieName(this.config);
    const bag = (ctx.req as unknown as { cookies?: Record<string, string> })
      .cookies;
    const fromCookie = bag?.[name] ?? null;
    if (fromCookie) return fromCookie;
    const header = ctx.req.headers['x-device-token'];
    return (Array.isArray(header) ? header[0] : header) ?? null;
  }

  private extractUserToken(ctx: RequestContext): string | null {
    const name = userCookieName(this.config);
    const bag = (ctx.req as unknown as { cookies?: Record<string, string> })
      .cookies;
    const fromCookie = bag?.[name] ?? null;
    if (fromCookie) return fromCookie;
    const header = ctx.req.headers['x-user-token'];
    return (Array.isArray(header) ? header[0] : header) ?? null;
  }

  private setRbacCookie(ctx: RequestContext | undefined, token: string): void {
    ctx?.req.res?.cookie(
      rbacCookieName(this.config),
      token,
      rbacCookieOptions(this.config),
    );
  }

  private clearRbacCookie(ctx: RequestContext): void {
    const { maxAge: _maxAge, ...clearOpts } = rbacCookieOptions(this.config);
    ctx.req.res?.clearCookie(rbacCookieName(this.config), clearOpts);
  }

  private setUserCookie(ctx: RequestContext | undefined, token: string): void {
    ctx?.req.res?.cookie(
      userCookieName(this.config),
      token,
      userCookieOptions(this.config),
    );
  }

  private clearUserCookie(ctx: RequestContext): void {
    const { maxAge: _maxAge, ...clearOpts } = userCookieOptions(this.config);
    ctx.req.res?.clearCookie(userCookieName(this.config), clearOpts);
  }
}
