import { UseGuards } from '@nestjs/common';
import { Field, Int, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { TIER_RANK } from '../authorization/tier-rank';
import {
  FREE_CALL_MAX_DURATION_MINUTES,
  MIN_TIER_TO_GO_LIVE,
  RTC_TIER_MULTIPLIER,
  meetingMaxDurationMinutes,
  meetingMaxParticipants,
} from './rtc-tier-limits.constants';

@ObjectType()
class RtcTierLimits {
  @Field(() => Int)
  callMaxDurationMinutes: number;

  @Field(() => Int)
  meetingMaxParticipants: number;

  @Field(() => Int)
  meetingMaxDurationMinutes: number;

  @Field()
  canGoLive: boolean;
}

@Resolver()
export class RtcResolver {
  @UseGuards(SessionAuthGuard)
  @Query(() => RtcTierLimits)
  rtcTierLimits(@CurrentUser() user: JwtUser): RtcTierLimits {
    const tier = user.tier as SubscriptionTier;
    return {
      // The two-party call cap uses MIN(caller, callee) tier and can only
      // be known once a callee is chosen — this is the caller's own best
      // case (calling a same-or-higher-tier user); RtcCallService computes
      // the real, possibly lower, cap at accept-time.
      callMaxDurationMinutes:
        FREE_CALL_MAX_DURATION_MINUTES * (RTC_TIER_MULTIPLIER[tier] ?? 1),
      meetingMaxParticipants: meetingMaxParticipants(tier),
      meetingMaxDurationMinutes: meetingMaxDurationMinutes(tier),
      canGoLive:
        (TIER_RANK[tier] ?? -1) >=
        (TIER_RANK[MIN_TIER_TO_GO_LIVE] ?? Infinity),
    };
  }
}
