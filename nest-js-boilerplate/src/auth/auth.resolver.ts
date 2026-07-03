import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Request } from 'express';
import { User } from '../@generated/user/user.model';
import { Session } from '../@generated/session/session.model';
import { CsrfGuard } from '../csrf/csrf.guard';
import { AuthService } from './auth.service';
import { AuthPayload, SessionUserPayload } from './auth.types';
import type { JwtUser } from './auth.types';
import { CurrentUser } from './current-user.decorator';
import { SessionAuthGuard } from './session-auth.guard';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { OAuthProfileInput } from './dto/oauth-profile.input';
import type { OAuthProfile } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => AuthPayload)
  register(
    @Args('input') input: RegisterInput,
    @Context() ctx: { req: Request },
  ): Promise<AuthPayload> {
    return this.auth.register(input, { req: ctx.req });
  }

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

  /** Social login: upsert OAuth-linked account and issue tokens. */
  @Mutation(() => AuthPayload)
  loginWithOAuth(
    @Args('profile') profile: OAuthProfileInput,
    @Context() ctx: { req: Request },
  ): Promise<AuthPayload> {
    return this.auth.loginWithOAuth(profile as unknown as OAuthProfile, {
      req: ctx.req,
    });
  }

  /**
   * Returns the current user from the Redis session — zero Prisma queries on the hot path.
   * The `SessionAuthGuard` resolves the full user snapshot from the compound Redis key.
   */
  @UseGuards(SessionAuthGuard)
  @Query(() => SessionUserPayload, { name: 'me' })
  me(@CurrentUser() user: JwtUser): SessionUserPayload {
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
    };
  }

  /**
   * Lists the caller's live Postgres Session rows. The current session (the one identified
   * by the guard-attached sessionId) is marked with `current: true`.
   */
  @UseGuards(SessionAuthGuard)
  @Query(() => [Session], { name: 'mySessions' })
  mySessions(@CurrentUser() user: JwtUser) {
    return this.auth.findUserSessions(user.userId, user.sessionId);
  }

  /**
   * Revokes all of the caller's sessions EXCEPT the one they are currently using.
   * CSRF-guarded like `logout`.
   */
  @UseGuards(CsrfGuard, SessionAuthGuard)
  @Mutation(() => Boolean)
  async logoutOtherSessions(@CurrentUser() user: JwtUser): Promise<boolean> {
    await this.auth.logoutOtherSessions(
      user.userId,
      user.sessionId,
    );
    return true;
  }
}
