import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import type { JwtUser } from '../auth/auth.types';
import { MfaService } from './mfa.service';
import { MfaEnrollPayload, MfaVerifyPayload } from './mfa.types';

@Resolver()
@UseGuards(SessionAuthGuard)
export class MfaResolver {
  constructor(private readonly mfa: MfaService) {}

  @Mutation(() => MfaEnrollPayload)
  enrollMfa(@CurrentUser() user: JwtUser): Promise<MfaEnrollPayload> {
    return this.mfa.enroll(user.userId);
  }

  @Mutation(() => MfaVerifyPayload)
  verifyMfa(
    @CurrentUser() user: JwtUser,
    @Args('code') code: string,
  ): Promise<MfaVerifyPayload> {
    return this.mfa.verify(user.userId, code);
  }

  @Mutation(() => Boolean)
  disableMfa(
    @CurrentUser() user: JwtUser,
    @Args('code') code: string,
  ): Promise<boolean> {
    return this.mfa.disable(user.userId, code);
  }
}
