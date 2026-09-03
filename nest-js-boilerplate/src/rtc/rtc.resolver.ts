import { UseGuards, UseInterceptors } from '@nestjs/common';
import {
  Args,
  Field,
  Int,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { Meeting } from '../@generated/meeting/meeting.model';
import { LiveStream } from '../@generated/live-stream/live-stream.model';
import { RtcReport } from '../@generated/rtc-report/rtc-report.model';
import { RtcRecording } from '../@generated/rtc-recording/rtc-recording.model';
import { RtcReportReason } from '../@generated/prisma/rtc-report-reason.enum';
import type { JwtUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessionAuthGuard } from '../auth/session-auth.guard';
import { TIER_RANK } from '../authorization/tier-rank';
import { TierGuard } from '../authorization/tier.guard';
import { MinTier } from '../authorization/min-tier.decorator';
import { LiveKitService } from './livekit.service';
import { RtcMeetingService } from './rtc-meeting.service';
import { RtcStreamService } from './rtc-stream.service';
import { RtcReportService } from './rtc-report.service';
import { RtcRecordingService } from './rtc-recording.service';
import { RtcErrorInterceptor } from './rtc-error.interceptor';
import {
  MIN_TIER_TO_GO_LIVE,
  callMaxDurationForTier,
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

  /** Client-facing LiveKit ws(s) URL — see LiveKitService.clientUrl. Null
   *  when the server has no LIVEKIT_URL configured. */
  @Field(() => String, { nullable: true })
  livekitUrl: string | null;

  @Field()
  role: string;

  @Field(() => Meeting)
  meeting: Meeting;
}

// Deliberately NOT the generated RtcParticipant/User pair: participants of a
// meeting are arbitrary users, and exposing the generated User model here
// would hand every list row the full public-User surface. This summary is
// the whole contract — display name resolved server-side, avatarUrl already
// hideAvatar-filtered (see RtcMeetingService.participantSummaries).
@ObjectType()
class MeetingParticipantSummary {
  @Field()
  userId: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field()
  role: string;

  @Field()
  joinedAt: Date;

  @Field(() => Date, { nullable: true })
  leftAt: Date | null;
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

// Same deliberate summary contract as MeetingParticipantSummary above (no
// email, hideAvatar honored server-side, no raw livekitIdentity) — see
// RtcStreamService.viewerSummaries, which is the whole implementation.
@ObjectType()
class StreamViewerSummary {
  @Field()
  userId: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field()
  joinedAt: Date;
}

// Shared shape for both goLive and joinStreamAsViewer — the two mutations
// already imply which role the caller has (broadcaster vs. viewer), so
// there's no separate `role` field the way JoinMeetingResult needs one.
@ObjectType()
class LiveStreamJoinResult {
  @Field()
  token: string;

  @Field()
  roomName: string;

  /** Client-facing LiveKit ws(s) URL — see LiveKitService.clientUrl. */
  @Field(() => String, { nullable: true })
  livekitUrl: string | null;

  @Field(() => LiveStream)
  stream: LiveStream;
}

// Type-argument'd so @ResolveField(viewerCount) below has a parent type to
// attach to — this doesn't stop the class from also declaring root Query/
// Mutation fields unrelated to LiveStream (see post.resolver.ts's identical
// @Resolver(() => Post) shape, which mixes both).
@UseGuards(SessionAuthGuard)
@UseInterceptors(RtcErrorInterceptor)
@Resolver(() => LiveStream)
export class RtcResolver {
  constructor(
    private readonly meetings: RtcMeetingService,
    private readonly streams: RtcStreamService,
    private readonly reports: RtcReportService,
    private readonly recordings: RtcRecordingService,
    private readonly liveKit: LiveKitService,
  ) {}

  @Query(() => RtcTierLimits)
  rtcTierLimits(@CurrentUser() user: JwtUser): RtcTierLimits {
    const tier = user.tier as SubscriptionTier;
    return {
      // The two-party call cap uses MIN(caller, callee) tier and can only
      // be known once a callee is chosen — this is the caller's own best
      // case (calling a same-or-higher-tier user); RtcCallService computes
      // the real, possibly lower, cap at accept-time.
      callMaxDurationMinutes: callMaxDurationForTier(tier),
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
  async joinMeeting(@CurrentUser() user: JwtUser, @Args('slug') slug: string) {
    const joined = await this.meetings.joinMeeting(user.userId, slug);
    return { ...joined, livekitUrl: this.liveKit.clientUrl };
  }

  @Mutation(() => Boolean)
  async inviteToMeeting(
    @CurrentUser() user: JwtUser,
    @Args('slug') slug: string,
    @Args('userId') targetUserId: string,
  ) {
    await this.meetings.inviteToMeeting(user.userId, slug, targetUserId);
    return true;
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

  // ==================== Live streaming ====================

  @Query(() => [LiveStream])
  liveStreams() {
    return this.streams.liveStreams();
  }

  @Query(() => LiveStream, { nullable: true })
  streamBySlug(@Args('slug') slug: string) {
    return this.streams.streamBySlug(slug);
  }

  @Query(() => RtcChatMessagesPage)
  async streamChatMessages(
    @CurrentUser() user: JwtUser,
    @Args('slug') slug: string,
    @Args('before', { nullable: true }) before?: string,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ) {
    return this.streams.getChatHistory(
      user.userId,
      slug,
      before,
      take ? Math.min(Math.max(take, 1), 100) : 50,
    );
  }

  @UseGuards(TierGuard)
  @MinTier(MIN_TIER_TO_GO_LIVE)
  @Mutation(() => LiveStreamJoinResult)
  async goLive(@CurrentUser() user: JwtUser, @Args('title') title: string) {
    const joined = await this.streams.goLive(user.userId, title);
    return { ...joined, livekitUrl: this.liveKit.clientUrl };
  }

  @Mutation(() => LiveStreamJoinResult)
  async joinStreamAsViewer(
    @CurrentUser() user: JwtUser,
    @Args('slug') slug: string,
  ) {
    const joined = await this.streams.joinStreamAsViewer(user.userId, slug);
    return { ...joined, livekitUrl: this.liveKit.clientUrl };
  }

  @Mutation(() => Boolean)
  async leaveStreamAsViewer(
    @CurrentUser() user: JwtUser,
    @Args('slug') slug: string,
  ) {
    await this.streams.leaveStreamAsViewer(user.userId, slug);
    return true;
  }

  @Mutation(() => Boolean)
  async endStream(@CurrentUser() user: JwtUser, @Args('slug') slug: string) {
    await this.streams.endStream(user.userId, slug);
    return true;
  }

  @ResolveField(() => Int)
  async viewerCount(@Parent() stream: LiveStream): Promise<number> {
    return this.streams.getViewerCount(stream);
  }

  @ResolveField(() => [StreamViewerSummary])
  viewers(@Parent() stream: LiveStream) {
    return this.streams.viewerSummaries(stream);
  }

  // ==================== Reporting ====================
  // Minimal, real reporting (Phase 5): persisted rows, no review UI yet —
  // see RtcReportService's doc comment.

  @Mutation(() => RtcReport)
  reportMeeting(
    @CurrentUser() user: JwtUser,
    @Args('slug') slug: string,
    @Args('reason', { type: () => RtcReportReason }) reason: RtcReportReason,
    @Args('details', { nullable: true }) details?: string,
    @Args('reportedUserId', { nullable: true }) reportedUserId?: string,
  ) {
    return this.reports.reportMeeting(
      user.userId,
      slug,
      reason,
      details,
      reportedUserId,
    );
  }

  @Mutation(() => RtcReport)
  reportStream(
    @CurrentUser() user: JwtUser,
    @Args('slug') slug: string,
    @Args('reason', { type: () => RtcReportReason }) reason: RtcReportReason,
    @Args('details', { nullable: true }) details?: string,
    @Args('reportedUserId', { nullable: true }) reportedUserId?: string,
  ) {
    return this.reports.reportStream(
      user.userId,
      slug,
      reason,
      details,
      reportedUserId,
    );
  }

  @Mutation(() => RtcReport)
  reportCall(
    @CurrentUser() user: JwtUser,
    @Args('callId') callId: string,
    @Args('reason', { type: () => RtcReportReason }) reason: RtcReportReason,
    @Args('details', { nullable: true }) details?: string,
  ) {
    return this.reports.reportCall(user.userId, callId, reason, details);
  }

  // ==================== Recording (scaffolding — see RtcRecordingService) ====================

  @Query(() => RtcRecording, { nullable: true })
  meetingRecording(@CurrentUser() user: JwtUser, @Args('slug') slug: string) {
    return this.recordings.recordingForRoom('meeting', slug, user.userId);
  }

  @Query(() => RtcRecording, { nullable: true })
  streamRecording(@CurrentUser() user: JwtUser, @Args('slug') slug: string) {
    return this.recordings.recordingForRoom('stream', slug, user.userId);
  }

  @Mutation(() => RtcRecording)
  startMeetingRecording(
    @CurrentUser() user: JwtUser,
    @Args('slug') slug: string,
  ) {
    return this.recordings.startRecording(user.userId, 'meeting', slug);
  }

  @Mutation(() => RtcRecording)
  stopMeetingRecording(
    @CurrentUser() user: JwtUser,
    @Args('slug') slug: string,
  ) {
    return this.recordings.stopRecording(user.userId, 'meeting', slug);
  }

  @Mutation(() => RtcRecording)
  startStreamRecording(
    @CurrentUser() user: JwtUser,
    @Args('slug') slug: string,
  ) {
    return this.recordings.startRecording(user.userId, 'stream', slug);
  }

  @Mutation(() => RtcRecording)
  stopStreamRecording(
    @CurrentUser() user: JwtUser,
    @Args('slug') slug: string,
  ) {
    return this.recordings.stopRecording(user.userId, 'stream', slug);
  }
}

// Separate class because RtcResolver is already type-argument'd to
// LiveStream (for viewerCount) and a class can only anchor ResolveFields to
// one parent type.
@UseGuards(SessionAuthGuard)
@UseInterceptors(RtcErrorInterceptor)
@Resolver(() => Meeting)
export class RtcMeetingResolver {
  constructor(private readonly meetings: RtcMeetingService) {}

  @ResolveField(() => [MeetingParticipantSummary])
  participants(
    @Parent()
    meeting: Meeting & Parameters<RtcMeetingService['participantSummaries']>[0],
  ) {
    return this.meetings.participantSummaries(meeting);
  }
}
