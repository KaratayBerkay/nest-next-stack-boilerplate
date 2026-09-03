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

  /**
   * `currentCode` is only consulted when MFA is already enabled (rotating
   * the authenticator) — see MfaService.enroll. Optional so first-time
   * enrollment and existing clients are unchanged.
   */
  @Mutation(() => MfaEnrollPayload)
  enrollMfa(
    @CurrentUser() user: JwtUser,
    @Args('currentCode', { nullable: true }) currentCode?: string,
  ): Promise<MfaEnrollPayload> {
    return this.mfa.enroll(user.userId, currentCode ?? undefined);
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
