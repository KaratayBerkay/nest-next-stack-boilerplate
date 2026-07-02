import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Request } from 'express';
import { User } from '../@generated/user/user.model';
import { CsrfGuard } from '../csrf/csrf.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { AuthPayload } from './auth.types';
import type { JwtUser } from './auth.types';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { OAuthProfileInput } from './dto/oauth-profile.input';
import type { OAuthProfile } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  me(@CurrentUser() user: JwtUser): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({ where: { id: user.userId } });
  }
}
