import { hash, verify } from '@node-rs/argon2';
import {
  ConflictException,
  Injectable,
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
import { refreshCookieName, refreshCookieOptions } from './auth-cookie';
import { AuthPayload } from './auth.types';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
const EMAIL_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24h
const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30d

export interface OAuthProfile {
  type: AuthProviderType;
  provider: string;
  providerAccountId: string;
  email: string;
  name?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly crypto: CryptoService,
    private readonly outbox: OutboxService,
    private readonly mail: MailService,
    private readonly devices: DeviceService,
  ) {}

  /** Register with credentials, queue a confirmation email, and emit a SIGNUP audit event. */
  async register(
    input: RegisterInput,
    ctx?: RequestContext,
  ): Promise<AuthPayload> {
    const email = input.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

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
    const verifyUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token=${rawToken}`;
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

  /** Verify credentials with lockout + failed-attempt tracking; emit LOGIN / LOGIN_FAILED. */
  async login(input: LoginInput, ctx?: RequestContext): Promise<AuthPayload> {
    const email = input.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account temporarily locked');
    }

    const ok = await verify(user.passwordHash, input.password);
    if (!ok) {
      await this.registerFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
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
      throw new UnauthorizedException('Invalid or expired token');
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

  /** Social login: upsert the provider Account, find-or-create the User, issue tokens. */
  async loginWithOAuth(
    profile: OAuthProfile,
    ctx?: RequestContext,
  ): Promise<AuthPayload> {
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
    const user = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email } });
      const target =
        existing ??
        (await tx.user.create({
          data: {
            email,
            name: profile.name ?? null,
            status: 'ACTIVE',
            emailVerifiedAt: new Date(), // provider already verified the email
          },
        }));
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

  /**
   * Exchange a valid refresh cookie for a fresh access token + rotated session.
   * Reads the opaque session token from the httpOnly refresh cookie (browser/SSR clients never
   * send it in the body), validates it is live, then re-issues — `issueTokens` dedups per device,
   * so the old session row is replaced and a new refresh cookie is written.
   * NOTE: refresh-reuse detection + token-family revocation are workstream 2 (layered tokens).
   */
  async refresh(ctx: RequestContext): Promise<AuthPayload> {
    const presented = this.readRefreshCookie(ctx);
    if (!presented) throw new UnauthorizedException('Missing refresh token');

    const session = await this.prisma.session.findUnique({
      where: { sessionToken: presented },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const device = await this.devices.resolveForLogin(session.userId, ctx);
    return this.issueTokens(session.user, ctx, device);
  }

  /**
   * Revoke the presented refresh session and clear the cookie. Idempotent: a missing/unknown
   * cookie still clears and returns true. (tokenVersion bump on logout is workstream 2.)
   */
  async logout(ctx: RequestContext): Promise<boolean> {
    const presented = this.readRefreshCookie(ctx);
    if (presented) {
      await this.prisma.session.deleteMany({
        where: { sessionToken: presented },
      });
    }
    this.clearRefreshCookie(ctx);
    return true;
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

    // Persist the refresh session, bound to the resolved device (ip/userAgent recorded too).
    // One active session per device: drop any prior session for this (user, device) first, so
    // repeat logins from the same browser replace rather than accumulate ("hard dedup").
    const session = await this.prisma.$transaction(async (tx) => {
      if (device?.deviceId) {
        await tx.session.deleteMany({
          where: { userId: user.id, deviceId: device.deviceId },
        });
      }
      return tx.session.create({
        data: {
          sessionToken: this.crypto.randomToken(),
          userId: user.id,
          expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
          deviceId: device?.deviceId ?? null,
          ip: device?.ip ?? null,
          userAgent: device?.userAgent ?? null,
        },
      });
    });

    // Deliver the refresh token as an httpOnly, Secure-by-env cookie for browser/SSR clients.
    // It is ALSO returned in the body (below) so API-only clients keep working.
    this.setRefreshCookie(ctx, session.sessionToken);

    return {
      accessToken,
      refreshToken: session.sessionToken,
      deviceId: device?.deviceId,
      deviceToken: device?.deviceToken,
      user,
    };
  }

  // --- Refresh-cookie I/O. cookie-parser populates req.cookies; Express keeps the response on
  // req.res, which is absent in non-HTTP execution contexts (guarded with ?.). ---
  private readRefreshCookie(ctx: RequestContext): string | null {
    const name = refreshCookieName(this.config);
    const bag = (ctx.req as unknown as { cookies?: Record<string, string> })
      .cookies;
    return bag?.[name] ?? null;
  }

  private setRefreshCookie(
    ctx: RequestContext | undefined,
    token: string,
  ): void {
    ctx?.req.res?.cookie(
      refreshCookieName(this.config),
      token,
      refreshCookieOptions(this.config),
    );
  }

  private clearRefreshCookie(ctx: RequestContext): void {
    // clearCookie must match name + path/domain to actually expire the cookie in the browser.
    const { maxAge: _maxAge, ...clearOpts } = refreshCookieOptions(this.config);
    ctx.req.res?.clearCookie(refreshCookieName(this.config), clearOpts);
  }
}
