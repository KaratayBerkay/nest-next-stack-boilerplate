import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { Meeting } from '../@generated/meeting/meeting.model';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { TIER_RANK } from '../authorization/tier-rank';
import { RtcMeetingService } from './rtc-meeting.service';
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

@ObjectType()
class JoinMeetingResult {
  @Field()
  token: string;

  @Field()
  roomName: string;

  @Field()
  role: string;

  @Field(() => Meeting)
  meeting: Meeting;
}

@ObjectType()
class RtcChatMessageView {
  @Field()
  id: string;

  @Field()
  senderId: string;

  @Field()
  senderName: string;

  @Field(() => String, { nullable: true })
  senderAvatarUrl: string | null;

  @Field()
  text: string;

  @Field()
  createdAt: string;
}

@ObjectType()
class RtcChatMessagesPage {
  @Field(() => [RtcChatMessageView])
  messages: RtcChatMessageView[];

  @Field()
  hasMore: boolean;
}

@UseGuards(SessionAuthGuard)
@Resolver()
export class RtcResolver {
  constructor(private readonly meetings: RtcMeetingService) {}

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
        (TIER_RANK[tier] ?? -1) >= (TIER_RANK[MIN_TIER_TO_GO_LIVE] ?? Infinity),
    };
  }

  @Query(() => [Meeting])
  myMeetings(@CurrentUser() user: JwtUser) {
    return this.meetings.myMeetings(user.userId);
  }

  @Query(() => Meeting, { nullable: true })
  meetingBySlug(@Args('slug') slug: string) {
    return this.meetings.meetingBySlug(slug);
  }

  @Query(() => RtcChatMessagesPage)
  async meetingChatMessages(
    @CurrentUser() user: JwtUser,
    @Args('slug') slug: string,
    @Args('before', { nullable: true }) before?: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ) {
    return this.meetings.getChatHistory(
      user.userId,
      slug,
      before,
      take ? Math.min(Math.max(take, 1), 100) : 50,
    );
  }

  @Mutation(() => Meeting)
  createMeeting(@CurrentUser() user: JwtUser, @Args('title') title: string) {
    return this.meetings.createMeeting(user.userId, title);
  }

  @Mutation(() => JoinMeetingResult)
  joinMeeting(@CurrentUser() user: JwtUser, @Args('slug') slug: string) {
    return this.meetings.joinMeeting(user.userId, slug);
  }

  @Mutation(() => Boolean)
  async leaveMeeting(@CurrentUser() user: JwtUser, @Args('slug') slug: string) {
    await this.meetings.leaveMeeting(user.userId, slug);
    return true;
  }

  @Mutation(() => Boolean)
  async endMeeting(@CurrentUser() user: JwtUser, @Args('slug') slug: string) {
    await this.meetings.endMeeting(user.userId, slug);
    return true;
  }

  @Mutation(() => Boolean)
  async removeMeetingParticipant(
    @CurrentUser() user: JwtUser,
    @Args('slug') slug: string,
    @Args('userId') targetUserId: string,
  ) {
    await this.meetings.removeMeetingParticipant(
      user.userId,
      slug,
      targetUserId,
    );
    return true;
  }

  @Mutation(() => Boolean)
  async muteMeetingParticipant(
    @CurrentUser() user: JwtUser,
    @Args('slug') slug: string,
    @Args('userId') targetUserId: string,
    @Args('muted') muted: boolean,
  ) {
    await this.meetings.muteMeetingParticipant(
      user.userId,
      slug,
      targetUserId,
      muted,
    );
    return true;
  }
}
