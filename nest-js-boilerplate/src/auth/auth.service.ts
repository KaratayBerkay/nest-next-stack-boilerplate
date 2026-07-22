import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProviderType, User } from '@prisma/client';
import { CryptoService } from '../common/crypto/crypto.service';
import {
  DeviceService,
  type DeviceContext,
  type RequestContext,
} from '../devices/device.service';
import { MailService } from '../mail/mail.service';
import { OutboxService } from '../outbox/outbox.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { AuthTokenService } from './auth-token.service';
import { AuthLoginService } from './auth-login.service';
import { AuthRegistrationService } from './auth-registration.service';
import { AuthSessionService } from './auth-session.service';
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
  ) {
    this.authTokens = new AuthTokenService(
      jwt,
      config,
      derivation,
      hydration,
      tokenStore,
      crypto,
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
    );
    this.authRegistration = new AuthRegistrationService(
      prisma,
      crypto,
      outbox,
      mail,
      config,
      usernames,
      devices,
    );
    this.authSession = new AuthSessionService(
      prisma,
      tokenStore,
      this.authTokens,
    );
  }

  private readonly boundIssueTokens = (
    user: User,
    ctx?: RequestContext,
    device?: DeviceContext,
  ): Promise<AuthPayload> => this.authTokens.issueTokens(user, ctx, device);

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

  async loginWithOAuth(
    profile: OAuthProfile,
    ctx?: RequestContext,
  ): Promise<AuthPayload> {
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
      refreshToken: result.refreshToken,
      user: result.user as AuthPayload['user'],
    };
  }
}
