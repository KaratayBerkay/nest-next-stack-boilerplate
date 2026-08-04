import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { User } from '../@generated/user/user.model';
import { CsrfGuard } from '../csrf/csrf.guard';
import { RolesGuard } from '../authorization/roles.guard';
import { Roles } from '../authorization/roles.decorator';
import { UserRole } from '../@generated/prisma/user-role.enum';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { AuthPayload, SessionUserPayload } from './auth.types';
import type { JwtUser } from './auth.types';
import { CurrentUser } from './current-user.decorator';
import { SessionAuthGuard } from './session-auth.guard';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { OAuthProfileInput } from './dto/oauth-profile.input';
import { RequestPasswordResetInput } from './dto/request-password-reset.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { VerifyLoginMfaInput } from './dto/verify-login-mfa.input';
import type { OAuthProfile } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Mutation(() => AuthPayload)
  register(
    @Args('input') input: RegisterInput,
    @Context() ctx: { req: Request },
  ): Promise<AuthPayload> {
    return this.auth.register(input, { req: ctx.req });
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Mutation(() => AuthPayload)
  login(
    @Args('input') input: LoginInput,
    @Context() ctx: { req: Request },
  ): Promise<AuthPayload> {
    return this.auth.login(input, { req: ctx.req });
  }

  @Mutation(() => User)
  verifyEmail(@Args('token') token: string): Promise<User> {
    return this.auth.verifyEmail(token);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Mutation(() => User)
  verifyEmailCode(
    @Args('userId') userId: string,
    @Args('code') code: string,
  ): Promise<User> {
    return this.auth.verifyEmailCode(userId, code);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Mutation(() => Boolean)
  resendEmailCode(
    @Args('userId') userId: string,
    @Args('email') email: string,
  ): Promise<boolean> {
    return this.auth.resendEmailCode(userId, email);
  }

  @UseGuards(CsrfGuard)
  @Mutation(() => AuthPayload)
  refresh(@Context() ctx: { req: Request }): Promise<AuthPayload> {
    return this.auth.refresh({ req: ctx.req });
  }

  @UseGuards(CsrfGuard)
  @Mutation(() => Boolean)
  logout(@Context() ctx: { req: Request }): Promise<boolean> {
    return this.auth.logout({ req: ctx.req });
  }

  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Mutation(() => Boolean)
  requestPasswordReset(
    @Args('input') input: RequestPasswordResetInput,
  ): Promise<boolean> {
    return this.auth.requestPasswordReset(input.email);
  }

  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Mutation(() => Boolean)
  resetPassword(@Args('input') input: ResetPasswordInput): Promise<boolean> {
    return this.auth.resetPassword(input.token, input.newPassword);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Mutation(() => AuthPayload)
  loginWithOAuth(
    @Args('profile') profile: OAuthProfileInput,
    @Context() ctx: { req: Request },
  ): Promise<AuthPayload> {
    return this.auth.loginWithOAuth(profile as unknown as OAuthProfile, {
      req: ctx.req,
    });
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Mutation(() => AuthPayload)
  verifyLoginMfa(
    @Args('input') input: VerifyLoginMfaInput,
    @Context() ctx: { req: Request },
  ): Promise<AuthPayload> {
    return this.auth.verifyLoginMfa(input.mfaToken, input.code, {
      req: ctx.req,
    });
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Mutation(() => String)
  resendLoginCode(
    @Args('mfaToken') mfaToken: string,
  ): Promise<string> {
    return this.auth.resendLoginCode(mfaToken);
  }

  /**
   * Dev-only: activate a user by email so e2e tests can skip the email
   * verification flow.  Gated by ALLOW_DEV_ACTIVATE=true (matching the
   * LOAD_DEMO_MODULES convention) and only activates PENDING_VERIFICATION
   * accounts. Requires SUPERADMIN role to prevent abuse.
   */
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @Mutation(() => Boolean)
  async devActivateUser(@Args('email') email: string): Promise<boolean> {
    if (process.env.ALLOW_DEV_ACTIVATE !== 'true') return false;
    return this.auth.devActivateUser(email);
  }

  /**
   * Returns the current user from the Redis session — zero Prisma queries on the hot path.
   * The `SessionAuthGuard` resolves the full user snapshot from the compound Redis key.
   */
  @UseGuards(SessionAuthGuard)
  @Query(() => SessionUserPayload, { name: 'me' })
  async me(@CurrentUser() user: JwtUser): Promise<SessionUserPayload> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { mfaEnabled: true, hideAvatar: true, e2eeEnabled: true },
    });

    return {
      id: user.userId,
      email: user.email,
      role: user.role,
      tier: user.tier,
      name: user.name ?? undefined,
      username: user.username ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      locale: user.locale ?? 'en',
      timezone: user.timezone ?? 'UTC',
      chatNickname: user.chatNickname ?? undefined,
      useNickname: user.useNickname ?? false,
      sessionId: user.sessionId,
      mfaEnabled: dbUser?.mfaEnabled ?? false,
      hideAvatar: dbUser?.hideAvatar ?? false,
      e2eeEnabled: dbUser?.e2eeEnabled ?? true,
    };
  }
}
