import {
  ConflictException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { verify } from '@node-rs/argon2';
import { Prisma, User } from '@prisma/client';
import { verify as verifyTotp } from 'otplib';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { OutboxService } from '../outbox/outbox.service';
import {
  DeviceService,
  type DeviceContext,
  type RequestContext,
} from '../devices/device.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { EmailOtpService } from './email-otp.service';
import { TokenStoreService } from './token-store.service';
import { UsernameService } from './username.service';
import { MailService } from '../mail/mail.service';
import type { AuthPayload } from './auth.types';
import type { IssueTokensFn } from './auth-token.service';
import type { LoginInput } from './dto/login.input';
import type { OAuthProfile } from './auth.service';

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
const MAX_USERNAME_RACE_ATTEMPTS = 3;
/** Wrong TOTP/backup codes allowed per MFA challenge before it's burned. */
const MAX_MFA_CODE_ATTEMPTS = 5;

// Postgres reports a P2002's `meta.target` as either the constraint name
// (a string) or a column-name array, depending on Prisma version — checked
// explicitly (not a blind `String(target)`) since `target` is `unknown`.
function isConstraintOn(target: unknown, column: string): boolean {
  if (typeof target === 'string') return target.includes(column);
  if (Array.isArray(target)) return target.includes(column);
  return false;
}

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
    private readonly emailOtp: EmailOtpService,
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

    const device = ctx
      ? await this.devices.resolveForLogin(user.id, ctx)
      : undefined;
    // Must fire here, right after the device is resolved — not after the MFA
    // branch below. resolveForLogin() persists its "is this device known"
    // state (a Device row keyed by the device-token cookie), so a second
    // call from verifyLoginMfa() a moment later would find the very row this
    // call just created/claimed and report `changed: false`. Deferring this
    // past the MFA gate meant the signal was silently lost on every MFA-
    // gated login — exactly the accounts most likely to care about a "new
    // device" security notification never got one.
    if (device?.changed) await this.emitNewDevice(user.id, device);

    if (user.mfaEnabled && !device?.trusted) {
      const factor = await this.prisma.mfaFactor.findFirst({
        where: { userId: user.id, method: 'TOTP', verifiedAt: { not: null } },
        orderBy: { createdAt: 'desc' },
      });
      const mfaMethod: 'TOTP' | 'EMAIL' = factor ? 'TOTP' : 'EMAIL';

      const mfaToken = this.crypto.randomToken();
      const mfaTokenHash = this.crypto.sha256(mfaToken);
      await this.tokenStore.writeMfaChallenge(mfaTokenHash, {
        userId: user.id,
        email: user.email,
        role: user.role,
        tier: user.subscriptionTier ?? 'FREE',
        mfaMethod,
      });

      if (mfaMethod === 'EMAIL') {
        try {
          await this.emailOtp.generate(user.id, user.email, 'LOGIN');
        } catch {
          this.logger.warn(
            `Failed to send login email OTP for userId=${user.id}`,
          );
        }
      }

      // No `user` here on purpose — see AuthPayload.user. Returning the full
      // row leaked role/tier/status to anyone holding just the password.
      return { mfaRequired: true, mfaMethod, mfaToken };
    }

    // The login-state reset and its audit event must commit together — this
    // codebase's outbox contract (see OutboxService.emit's own doc comment)
    // is that passing `tx` is "the whole point of the pattern". Emitting
    // outside the transaction meant a crash between the two calls left the
    // user's failedLoginCount/lockedUntil silently reset with no audit trail
    // ever recorded for it.
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
          ...(input.timezone ? { timezone: input.timezone } : {}),
        },
      });
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: user.id,
          eventType: 'auth.login',
          action: 'LOGIN',
          actorId: user.id,
          summary: `User ${email} logged in`,
          ip: device?.ip ?? null,
          userAgent: device?.userAgent ?? null,
        },
        tx,
      );
    });

    return issueTokens(user, ctx, device);
  }

  async verifyLoginMfa(
    mfaToken: string,
    code: string,
    ctx: RequestContext | undefined,
    issueTokens: IssueTokensFn,
  ): Promise<AuthPayload> {
    const tokenHash = this.crypto.sha256(mfaToken);
    const challenge = await this.tokenStore.peekMfaChallenge(tokenHash);
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

    if (challenge.mfaMethod === 'EMAIL') {
      try {
        await this.emailOtp.verify(user.id, code, 'LOGIN');
      } catch {
        throw new UnauthorizedException({
          exc: 'EX_AUTH_MFA_INVALID_CODE',
          msg: 'Invalid verification code',
          key: 'auth.errors.mfaInvalidCode',
        });
      }
    } else {
      const totpVerified = await this.verifyTotpCode(user.id, code);
      if (!totpVerified) {
        const backupUsed = await this.verifyBackupCode(user.id, code);
        if (!backupUsed) {
          // Bound guessing per challenge — the email-OTP path enforces its
          // own attempt cap inside emailOtp.verify, but nothing capped the
          // TOTP/backup path: with a stolen mfaToken, the whole 5-minute
          // window was open to code brute-forcing limited only by the
          // global HTTP throttle. Burning the challenge forces a fresh
          // password login to try again.
          const attempts =
            await this.tokenStore.recordMfaChallengeFailure(tokenHash);
          if (attempts >= MAX_MFA_CODE_ATTEMPTS) {
            await this.tokenStore.deleteMfaChallenge(tokenHash);
            throw new UnauthorizedException({
              exc: 'EX_AUTH_MFA_EXPIRED',
              msg: 'Too many incorrect codes — sign in again',
              key: 'auth.errors.mfaChallengeExpired',
            });
          }
          throw new UnauthorizedException({
            exc: 'EX_AUTH_MFA_INVALID_CODE',
            msg: 'Invalid MFA code',
            key: 'auth.errors.mfaInvalidCode',
          });
        }
      }
    }

    await this.tokenStore.deleteMfaChallenge(tokenHash);
    const device = ctx
      ? await this.devices.resolveForLogin(user.id, ctx)
      : undefined;
    // Note: the "new device" notification for this login was already fired
    // by login()'s own resolveForLogin() call, before the MFA challenge was
    // even issued — resolveForLogin() persists a Device row on first call,
    // so this second call always sees `changed: false` for the same device.

    // The non-MFA success path resets these and audits the login; this path
    // never did either — a user who mistyped their password a few times
    // before completing MFA kept carrying that failedLoginCount forever
    // (this branch never clears it), silently creeping toward
    // MAX_FAILED_LOGINS on future, unrelated mistakes, and MFA-gated logins
    // were invisible to the audit log.
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      });
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: user.id,
          eventType: 'auth.login',
          action: 'LOGIN',
          actorId: user.id,
          summary: `User ${user.email} logged in (MFA)`,
          ip: device?.ip ?? null,
          userAgent: device?.userAgent ?? null,
        },
        tx,
      );
    });

    return issueTokens(user, ctx, device, { mfaVerified: true });
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
      this.assertOAuthAccountActive(account.user);
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
    let user: User | undefined;
    // UsernameService.generate() only checks-then-suggests — it can't reserve
    // the name — so two concurrent signups deriving the same base username
    // (e.g. the same email local-part via different providers) can both see
    // it as available and both attempt to create with it, and only one wins
    // the real DB @unique constraint. Retrying re-enters generate() fresh,
    // which now sees the winner's username as taken and picks a suffixed one
    // instead of dead-ending the loser's signup with a raw 500.
    for (let attempt = 1; attempt <= MAX_USERNAME_RACE_ATTEMPTS; attempt++) {
      try {
        user = await this.prisma.$transaction(async (tx) => {
          const existing = await tx.user.findUnique({ where: { email } });
          // Classic OAuth "account pre-hijacking": an attacker registers the
          // victim's email through the normal password flow, never verifies
          // it, and waits. Without this check, the victim's first "Sign in
          // with Google" would silently weld their real, provider-verified
          // identity onto that unverified row — and the attacker's
          // already-issued refresh token for it (PENDING sessions are
          // refreshable by design) would keep working afterward. An
          // unverified row proves nothing about who's asking to link to it,
          // so refuse instead of merging; the legitimate owner (if any) can
          // still get in by verifying or resetting that account first.
          if (existing && !existing.emailVerifiedAt) {
            throw new ConflictException({
              exc: 'EX_AUTH_ACCOUNT_UNVERIFIED_CONFLICT',
              msg: 'An account with this email already exists but has not been verified. Verify it or reset its password before signing in with a social account.',
              key: 'auth.errors.oauthAccountUnverifiedConflict',
            });
          }
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
        break;
      } catch (err) {
        const isUsernameRace =
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002' &&
          isConstraintOn(err.meta?.target, 'username');
        if (!isUsernameRace || attempt === MAX_USERNAME_RACE_ATTEMPTS)
          throw err;
        isNewUser = false;
        this.logger.warn(
          `loginWithOAuth: username race for ${email} (attempt ${attempt}/${MAX_USERNAME_RACE_ATTEMPTS}), retrying with a fresh candidate`,
        );
      }
    }
    // Every loop iteration above either assigns `user` and breaks, or throws
    // — it can never fall through without one of the two.
    if (!user) throw new Error('unreachable: loginWithOAuth resolved no user');
    this.assertOAuthAccountActive(user);

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

  /**
   * loginWithOAuth's twin of login()'s `status !== 'ACTIVE'` gate. Without
   * this, a SUSPENDED/BANNED user with a linked (or linkable) provider
   * account could bypass the ban entirely just by using "Sign in with
   * Google" instead of their password.
   */
  private assertOAuthAccountActive(user: User): void {
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
  }

  private async verifyTotpCode(userId: string, code: string): Promise<boolean> {
    const factor = await this.prisma.mfaFactor.findFirst({
      where: { userId, method: 'TOTP', verifiedAt: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    if (!factor?.secret) return false;

    const secret = this.crypto.decrypt(Buffer.from(factor.secret));
    const result = await verifyTotp({ secret, token: code });
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
    // Atomically claim it: MfaBackupCode has no unique/partial-index
    // constraint backing "single use" (only @@index([userId])), so two
    // concurrent MFA-verify calls with the same code could otherwise both
    // pass the check above and both succeed. This updateMany's own WHERE
    // clause re-checks `usedAt: null` at the moment of the write, not the
    // earlier read — only one concurrent caller can ever claim it.
    const claimed = await this.prisma.mfaBackupCode.updateMany({
      where: { id: backupCode.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    return claimed.count === 1;
  }

  private async registerFailedLogin(user: User): Promise<void> {
    // The increment, the (conditional) lockout write, and the audit event
    // all commit as one unit — previously the increment and lockout were two
    // separate top-level writes, so a crash in between could permanently
    // leave an account that had already crossed MAX_FAILED_LOGINS unlocked
    // (count persisted, lockedUntil never set), silently defeating the
    // brute-force lockout. Passing `tx` to outbox.emit follows this
    // codebase's own outbox contract (see OutboxService.emit's doc comment).
    await this.prisma.$transaction(async (tx) => {
      // Atomic increment, not `user.failedLoginCount + 1` computed from an
      // already-fetched, potentially-stale object — concurrent wrong-password
      // requests previously each read/wrote the same base value (a lost
      // update), so a burst of parallel brute-force attempts could blow
      // through MAX_FAILED_LOGINS without the lockout ever triggering.
      const updated = await tx.user.update({
        where: { id: user.id },
        data: { failedLoginCount: { increment: 1 } },
      });
      const lock = updated.failedLoginCount >= MAX_FAILED_LOGINS;
      if (lock) {
        // A harmless redundant write if two concurrent attempts both cross
        // the threshold at once — both just set ~the same lockout expiry.
        await tx.user.update({
          where: { id: user.id },
          data: { lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) },
        });
      }
      await this.outbox.emit(
        {
          aggregateType: 'User',
          aggregateId: user.id,
          eventType: 'auth.login.failed',
          action: 'LOGIN_FAILED',
          level: 'WARN',
          actorId: user.id,
          summary: `Failed login #${updated.failedLoginCount}${lock ? ' (account locked)' : ''}`,
        },
        tx,
      );
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
