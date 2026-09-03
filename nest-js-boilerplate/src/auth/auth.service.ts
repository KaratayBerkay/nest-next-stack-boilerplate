import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProviderType, User } from '@prisma/client';
import { CryptoService } from '../common/crypto/crypto.service';
import { DeviceService, type RequestContext } from '../devices/device.service';
import { MailService } from '../mail/mail.service';
import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { WireCryptoService } from '../wire-crypto/wire-crypto.service';
import { AuthTokenService, type IssueTokensFn } from './auth-token.service';
import { AuthLoginService } from './auth-login.service';
import { AuthRegistrationService } from './auth-registration.service';
import { EmailOtpService } from './email-otp.service';
import { AuthSessionService } from './auth-session.service';
import { OAuthService } from './oauth/oauth.service';
import { SessionHydrationService } from './session-hydration.service';
import { TokenDerivationService } from './token-derivation.service';
import { TokenStoreService } from './token-store.service';
import { UsernameService } from './username.service';
import type { AuthPayload } from './auth.types';
import type { LoginInput } from './dto/login.input';
import type { RegisterInput } from './dto/register.input';

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
  private readonly authTokens: AuthTokenService;
  private readonly authLogin: AuthLoginService;
  private readonly authRegistration: AuthRegistrationService;
  private readonly authSession: AuthSessionService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly crypto: CryptoService,
    private readonly outbox: OutboxService,
    mail: MailService,
    devices: DeviceService,
    private readonly tokenStore: TokenStoreService,
    hydration: SessionHydrationService,
    derivation: TokenDerivationService,
    usernames: UsernameService,
    @Inject(forwardRef(() => RealtimeGateway))
    private readonly realtime: RealtimeGateway,
    private readonly emailOtp: EmailOtpService,
    private readonly wireCrypto: WireCryptoService,
    private readonly oauthService: OAuthService,
  ) {
    this.authTokens = new AuthTokenService(
      jwt,
      config,
      derivation,
      hydration,
      tokenStore,
      crypto,
      wireCrypto,
    );
    this.authLogin = new AuthLoginService(
      prisma,
      crypto,
      outbox,
      devices,
      tokenStore,
      usernames,
      mail,
      realtime,
      emailOtp,
    );
    this.authRegistration = new AuthRegistrationService(
      prisma,
      crypto,
      outbox,
      mail,
      config,
      usernames,
      devices,
      emailOtp,
    );
    this.authSession = new AuthSessionService(
      prisma,
      tokenStore,
      this.authTokens,
      realtime,
      wireCrypto,
    );
  }

  private readonly boundIssueTokens: IssueTokensFn = (
    user,
    ctx,
    device,
    opts,
  ) => this.authTokens.issueTokens(user, ctx, device, opts);

  private readonly boundIssuePwdResetToken = (
    userId: string,
    email: string,
  ): Promise<string> =>
    this.authRegistration.issuePasswordResetTokenStandalone(userId, email);

  async register(
    input: RegisterInput,
    ctx?: RequestContext,
  ): Promise<AuthPayload> {
    return this.authRegistration.register(input, ctx, this.boundIssueTokens);
  }

  async login(input: LoginInput, ctx?: RequestContext): Promise<AuthPayload> {
    return this.authLogin.login(input, ctx, this.boundIssueTokens);
  }

  async resendLoginCode(mfaToken: string): Promise<string> {
    const tokenHash = this.crypto.sha256(mfaToken);
    // Peek (non-destructive) rather than consume: the previous version
    // deleted the challenge up front, so a failed resend below (e.g. the
    // 60s cooldown in EmailOtpService.resend, triggered by the very first
    // send that started the challenge) permanently dead-ended the login —
    // the old token was already gone and no new one had been written yet,
    // forcing the user to restart the entire login flow from scratch.
    const challenge = await this.tokenStore.peekMfaChallenge(tokenHash);
    if (!challenge) {
      throw new UnauthorizedException({
        exc: 'EX_AUTH_MFA_EXPIRED',
        msg: 'MFA challenge expired',
        key: 'auth.errors.mfaChallengeExpired',
      });
    }
    if (challenge.mfaMethod === 'TOTP') {
      // A TOTP code comes from the user's own authenticator app — there's
      // nothing on our side to resend. Previously this fell through and
      // sent a spurious "verification code" email regardless of method.
      throw new BadRequestException({
        exc: 'EX_AUTH_MFA_METHOD_NOT_RESENDABLE',
        msg: 'This verification method cannot be resent',
        key: 'auth.errors.mfaMethodNotResendable',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: challenge.userId },
    });
    if (!user) {
      throw new UnauthorizedException({
        exc: 'EX_AUTH_USER_NOT_FOUND',
        msg: 'User not found',
        key: 'auth.errors.userNotFound',
      });
    }

    await this.emailOtp.resend(user.id, user.email, 'LOGIN');

    // Only rotate to a new challenge (and drop the old one) once the resend
    // has actually gone out — if resend threw above, the original mfaToken
    // is still fully valid and retryable.
    const newMfaToken = this.crypto.randomToken();
    const newTokenHash = this.crypto.sha256(newMfaToken);
    await this.tokenStore.writeMfaChallenge(newTokenHash, {
      ...challenge,
    });
    await this.tokenStore.deleteMfaChallenge(tokenHash);

    return newMfaToken;
  }

  async verifyLoginMfa(
    mfaToken: string,
    code: string,
    ctx?: RequestContext,
  ): Promise<AuthPayload> {
    return this.authLogin.verifyLoginMfa(
      mfaToken,
      code,
      ctx,
      this.boundIssueTokens,
    );
  }

  async verifyEmail(rawToken: string): Promise<User> {
    return this.authRegistration.verifyEmail(rawToken);
  }

  async verifyEmailCode(userId: string, code: string): Promise<User> {
    return this.authRegistration.verifyEmailCode(userId, code);
  }

  async resendEmailCode(userId: string, email: string): Promise<boolean> {
    // The client-supplied `email` is deliberately never trusted as the send
    // target — this mutation is unauthenticated (it runs before a session
    // exists, mid-registration), so trusting it let anyone who learned a
    // pending user's id redirect that user's verification code to an
    // attacker-controlled address, deleting the victim's real in-flight
    // code as a side effect (EmailOtpService.resend does exactly that) and
    // then completing the victim's registration themselves via
    // verifyEmailCode. The real destination always comes from the account's
    // own record, matching every other OTP-send path in this codebase.
    void email;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (!user) {
      // Same outcome as a real send — never reveal whether a userId exists
      // to an unauthenticated caller.
      return true;
    }
    await this.emailOtp.resend(userId, user.email, 'REGISTRATION');
    return true;
  }

  async devActivateUser(email: string): Promise<boolean> {
    return this.authRegistration.devActivateUser(email);
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    return this.authRegistration.requestPasswordReset(email);
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<boolean> {
    return this.authRegistration.resetPassword(
      rawToken,
      newPassword,
      this.tokenStore,
    );
  }

  async changePassword(
    userId: string,
    sessionId: string | undefined,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    await this.authRegistration.changePassword(
      userId,
      currentPassword,
      newPassword,
    );

    // Mirrors SessionsResolver.revokeAllOtherSessions — the current session
    // (the one that just authenticated this change) stays alive, every
    // other one is force-logged-out immediately rather than waiting for its
    // own token to expire.
    if (sessionId) {
      const entries = await this.tokenStore.listSessionsWithKeys(userId);
      const toRevoke = entries.filter((e) => e.session.sessionId !== sessionId);
      await Promise.all(toRevoke.map((e) => this.tokenStore.revoke(e.key)));
      for (const { session } of toRevoke) {
        this.realtime.closeSocketsForSession(userId, session.sessionId);
      }
    }

    return true;
  }

  async undoPasswordChange(rawToken: string): Promise<boolean> {
    return this.authRegistration.undoPasswordChange(rawToken, this.tokenStore);
  }

  async loginWithOAuth(
    input: { state: string; claim: string; codeVerifier?: string },
    ctx?: RequestContext,
  ): Promise<AuthPayload> {
    // The profile is never trusted from the caller: `state` is a single-use
    // claim ticket that only resolves to a profile once a real provider
    // handshake completed (OAuthService.handleCallback populates it after
    // exchanging the code server-to-server). Redeeming it also takes the
    // one-time `claim` minted on that callback and, for mobile flows, the
    // PKCE-style verifier registered at initiate (CROSS-032) — so neither
    // choosing a state up front nor intercepting the callback redirect is
    // enough on its own to be handed someone else's session.
    const profile = (await this.oauthService.retrieveProfile(
      input.state,
      input.claim,
      input.codeVerifier,
    )) as unknown as OAuthProfile;
    const frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    return this.authLogin.loginWithOAuth(
      profile,
      ctx,
      this.boundIssueTokens,
      this.boundIssuePwdResetToken,
      frontendUrl,
    );
  }

  async logout(ctx: RequestContext): Promise<boolean> {
    return this.authSession.logout(ctx);
  }

  async refresh(ctx: RequestContext): Promise<AuthPayload> {
    const result = await this.authSession.refresh(ctx);
    return {
      accessToken: result.accessToken,
      rbacToken: result.rbacToken,
      userToken: result.userToken,
      deviceId: result.deviceId,
      deviceToken: result.deviceToken,
      refreshToken: result.refreshToken,
      user: result.user as AuthPayload['user'],
    };
  }
}
