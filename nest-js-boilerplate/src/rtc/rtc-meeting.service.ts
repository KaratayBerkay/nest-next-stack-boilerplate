import { randomBytes } from 'node:crypto';
import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.tokens';
import { PrismaService } from '../prisma/prisma.service';
import { LiveKitService, toLivekitRoomName } from './livekit.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { AuthWs } from '../realtime/realtime.types';
import { RtcChatService } from './rtc-chat.service';
// Native @prisma/client enums — see rtc-call.service.ts's import comment for
// why these come from here and not the @generated/prisma/*.enum wrappers.
import { RtcParticipantRole, RtcRoomKind, RtcRoomState } from '@prisma/client';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { displayName } from '../common/utils/display-name';
import {
  meetingMaxDurationMinutes,
  meetingMaxParticipants,
} from './rtc-tier-limits.constants';
import { NotificationService } from '../notification/notification.service';
import { FriendsService } from '../friends/friends.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { rtcErrorLog, rtcLog } from './rtc-logger';

export type { RtcChatMessageView as MeetingChatMessageView } from './rtc-chat.service';

/** How long before a meeting's tier-scaled duration cap the sweep sends a
 *  one-time warning frame. Mirrors the call-limit warning's lead time. */
export const MEETING_LIMIT_WARNING_LEAD_SECONDS = 60;

function chatChannel(slug: string): string {
  // Prefixed so this never collides with a chat-room Room.slug, which shares
  // RealtimeGateway's same flat roomSockets keyspace.
  return `rtc-meeting:${slug}`;
}

/** Redis SET of userIds the host removed from a meeting — see
 *  removeMeetingParticipant. Keyed by roomId (never client-facing). */
function removedSetKey(roomId: string): string {
  return `rtc:meeting:removed:${roomId}`;
}
/** Outlives any meeting (the tier duration caps are minutes-to-hours);
 *  finishMeeting deletes the set explicitly, this is only the safety net. */
const REMOVED_SET_TTL_SECONDS = 24 * 60 * 60;
/** Slack past the meeting's own duration cap so a legitimate participant's
 *  reconnect near the end still carries a valid token; the sweep ends the
 *  meeting itself at the cap, so nothing legitimate needs longer. */
const MEETING_TOKEN_TTL_SLACK_SECONDS = 10 * 60;

/** Shared include/orderBy for loading a room's participant rows with the
 *  user fields participantSummaries needs — email only feeds the shared
 *  displayName fallback, and hideAvatar drives the avatar-privacy
 *  contract. */
const PARTICIPANTS_WITH_USER = {
  orderBy: { joinedAt: 'asc' },
  include: {
    user: {
      select: {
        name: true,
        email: true,
        avatarUrl: true,
        hideAvatar: true,
      },
    },
  },
} as const;

interface LoadedParticipantRow {
  userId: string;
  role: RtcParticipantRole;
  joinedAt: Date;
  leftAt: Date | null;
  user: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
    hideAvatar: boolean;
  };
}

/** Client-safe participant shape exposed on the GraphQL Meeting type. */
export interface MeetingParticipantSummaryView {
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  joinedAt: Date;
  leftAt: Date | null;
}

function generateSlug(): string {
  return randomBytes(9).toString('base64url');
}

/**
 * Group-meeting lifecycle: create-and-ready-on-create (unlike 1:1 calls,
 * there's no ringing phase — the LiveKit room exists the moment the meeting
 * does), tier-capped participant count + duration, host controls, and
 * encrypted in-meeting chat riding the same RealtimeGateway room-broadcast
 * primitives messaging's chat-room feature uses.
 *
 * The meeting's own `id` never reaches the client — `slug` is the only
 * client-facing handle (join link, chat-channel key, host-control target),
 * matching the existing Room.slug precedent instead of adding a new
 * MANUAL_ID_ALIASES entry.
 */
@Injectable()
export class RtcMeetingService {
  private readonly logger = new Logger(RtcMeetingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly liveKit: LiveKitService,
    private readonly realtime: RealtimeGateway,
    private readonly chat: RtcChatService,
    private readonly notifications: NotificationService,
    private readonly friends: FriendsService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async createMeeting(userId: string, title: string) {
    const trimmed = title.trim().slice(0, 200) || 'Meeting';
    const host = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });
    const tier = (host?.subscriptionTier ??
      SubscriptionTier.FREE) as SubscriptionTier;
    const maxParticipants = meetingMaxParticipants(tier);
    const maxDurationMinutes = meetingMaxDurationMinutes(tier);
    const slug = generateSlug();

    // RtcRoom + Meeting are created together, atomically — a Meeting row
    // must never be able to exist independently of its RtcRoom (or vice
    // versa). Previously these were two separate top-level creates with an
    // external LiveKit call and an intermediate ACTIVE-transition wedged
    // between them: a crash after the room went ACTIVE but before the
    // Meeting row was created left a room that looked live but had no
    // Meeting to ever find it through again (myMeetings/meetingBySlug both
    // query Meeting, and handleRoomEndedByLiveKit's own lookup starts from
    // Meeting too) — a permanent, unswept orphan. Only the subsequent
    // activation (after LiveKit, which can't run inside a DB transaction)
    // happens as a separate step now; if that fails, at least the Meeting
    // row exists and is visibly stuck rather than invisibly leaked.
    const roomId = await this.prisma.$transaction(async (tx) => {
      const room = await tx.rtcRoom.create({
        data: {
          kind: RtcRoomKind.MEETING,
          state: RtcRoomState.PENDING,
          createdById: userId,
        },
      });
      await tx.meeting.create({
        data: {
          roomId: room.id,
          hostId: userId,
          title: trimmed,
          slug,
          maxParticipants,
          maxDurationMinutes,
        },
      });
      return room.id;
    });

    const livekitRoomName = toLivekitRoomName('meeting', roomId);
    try {
      await this.liveKit.createRoom(livekitRoomName, maxParticipants);
    } catch (error) {
      this.logger.error(
        rtcErrorLog('meeting.livekit_create_failed', error, {
          roomId,
          roomName: livekitRoomName,
          userId,
          phase: RtcRoomState.PENDING,
        }),
      );
      throw error;
    }
    const now = new Date();
    await this.prisma.rtcRoom.update({
      where: { id: roomId },
      data: { state: RtcRoomState.ACTIVE, livekitRoomName, startedAt: now },
    });

    const meeting = await this.prisma.meeting.findUniqueOrThrow({
      where: { roomId },
      include: { room: true, host: true },
    });
    this.logger.log(
      rtcLog('meeting.created', {
        meetingId: meeting.id,
        roomId: meeting.roomId,
        slug: meeting.slug,
        userId,
        maxParticipants,
        maxDurationMinutes,
        phase: RtcRoomState.ACTIVE,
      }),
    );
    return meeting;
  }

  async meetingBySlug(slug: string) {
    return this.prisma.meeting.findUnique({
      where: { slug },
      include: { room: true, host: true },
    });
  }

  async myMeetings(userId: string) {
    // Hosted OR attended — the meetings page shows a history section, and a
    // history that omits every meeting you joined but didn't host is useless
    // to non-hosts. Participants come along preloaded so the list's
    // `participants` GraphQL field (see participantSummaries) resolves
    // without an N+1 per meeting.
    const meetings = await this.prisma.meeting.findMany({
      where: {
        OR: [
          { hostId: userId },
          { room: { participants: { some: { userId } } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        room: { include: { participants: PARTICIPANTS_WITH_USER } },
        host: true,
      },
    });
    // The preloaded rows must NOT ride out on `room.participants`: the
    // generated RtcRoom GraphQL type exposes `participants { user { … } }`,
    // so leaving them there hands any client that selects that path every
    // co-attendee's email, their avatarUrl even with hideAvatar set, and the
    // raw-uuid livekitIdentity column (not in the id-codec field set).
    // Re-keyed onto a schema-invisible property that only the
    // MeetingParticipantSummary ResolveField reads; `room.participants`
    // stays unloaded, exactly as every other meeting query returns it.
    return meetings.map(({ room, ...meeting }) => {
      const { participants, ...roomRest } = room;
      return { ...meeting, room: roomRest, participantRows: participants };
    });
  }

  /** Maps a meeting's participant rows to the client-safe summary shape —
   *  display name resolved server-side and the hideAvatar contract applied.
   *  Reads rows preloaded by myMeetings when present (participantRows, a
   *  deliberately non-GraphQL-visible key); any other parent
   *  (join/create/bySlug results, where the web doesn't select
   *  `participants` today) falls back to one query. */
  async participantSummaries(meeting: {
    roomId: string;
    participantRows?: LoadedParticipantRow[];
  }): Promise<MeetingParticipantSummaryView[]> {
    const rows =
      meeting.participantRows ??
      (await this.prisma.rtcParticipant.findMany({
        where: { roomId: meeting.roomId },
        ...PARTICIPANTS_WITH_USER,
      }));
    return rows.map((p) => ({
      userId: p.userId,
      name: displayName(p.user),
      avatarUrl: p.user.hideAvatar ? null : (p.user.avatarUrl ?? null),
      role: p.role,
      joinedAt: p.joinedAt,
      leftAt: p.leftAt,
    }));
  }

  async joinMeeting(userId: string, slug: string) {
    const meeting = await this.mustFindActiveMeeting(slug);
    // A host-removed participant stays out for the rest of the meeting —
    // removal used to be a bare LiveKit kick, so the removed user could
    // simply call join again (and their old token still worked, see below).
    if (
      userId !== meeting.hostId &&
      (await this.isRemoved(meeting.roomId, userId))
    ) {
      throw new ForbiddenException({
        exc: 'EX_MEETING_REMOVED',
        msg: 'You were removed from this meeting by the host',
        key: 'rtc.errors.meetingRemoved',
      });
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, avatarUrl: true, hideAvatar: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const role =
      userId === meeting.hostId
        ? RtcParticipantRole.HOST
        : RtcParticipantRole.PARTICIPANT;

    // The capacity check-then-upsert must be atomic against a concurrent
    // join to the SAME meeting — two requests racing in at exactly
    // maxParticipants-1 active seats could otherwise both pass the count
    // check and both upsert, exceeding the cap. A `SELECT ... FOR UPDATE` on
    // the room row inside this transaction serializes concurrent joiners of
    // this one meeting (unrelated meetings are unaffected) without needing
    // full-database SERIALIZABLE isolation + retry handling.
    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "RtcRoom" WHERE id = ${meeting.roomId}::uuid FOR UPDATE`;

      const existing = await tx.rtcParticipant.findUnique({
        where: { roomId_userId: { roomId: meeting.roomId, userId } },
      });
      if (!existing || existing.leftAt) {
        const activeCount = await tx.rtcParticipant.count({
          where: { roomId: meeting.roomId, leftAt: null },
        });
        if (activeCount >= meeting.maxParticipants) {
          throw new ForbiddenException({
            exc: 'EX_MEETING_FULL',
            msg: 'This meeting is at capacity',
            key: 'rtc.errors.meetingFull',
          });
        }
      }

      await tx.rtcParticipant.upsert({
        where: { roomId_userId: { roomId: meeting.roomId, userId } },
        create: {
          roomId: meeting.roomId,
          userId,
          role,
          livekitIdentity: userId,
        },
        update: { leftAt: null, joinedAt: new Date() },
      });
    });

    let token: string;
    try {
      token = await this.liveKit.mintToken({
        identity: userId,
        name: displayName(user),
        roomName: meeting.room.livekitRoomName!,
        canPublish: true,
        canSubscribe: true,
        // Bounded by this meeting's own duration cap instead of the 4h
        // default, so a removed participant's leftover token can't be
        // replayed straight against LiveKit for hours after the meeting.
        ttlSeconds:
          meeting.maxDurationMinutes * 60 + MEETING_TOKEN_TTL_SLACK_SECONDS,
      });
    } catch (error) {
      this.logger.error(
        rtcErrorLog('meeting.livekit_token_failed', error, {
          meetingId: meeting.id,
          roomId: meeting.roomId,
          slug,
          userId,
          roomName: meeting.room.livekitRoomName,
        }),
      );
      throw error;
    }

    this.realtime.broadcastToRoom(chatChannel(slug), {
      type: 'rtc:meeting-participant-joined',
      slug,
      userId,
      name: displayName(user),
      // hideAvatar contract: this frame reaches every meeting member.
      avatarUrl: user.hideAvatar ? null : (user.avatarUrl ?? null),
      role,
    });

    this.logger.log(
      rtcLog('meeting.joined', {
        meetingId: meeting.id,
        roomId: meeting.roomId,
        slug,
        userId,
        role,
        phase: RtcRoomState.ACTIVE,
      }),
    );

    return {
      token,
      roomName: meeting.room.livekitRoomName!,
      role: role as string,
      meeting,
    };
  }

  /** Invite a friend to an in-progress meeting — the inviter must currently
   *  be an active participant (host or otherwise) and the target must be a
   *  friend, matching FRIEND_REQUEST's existing shape rather than letting
   *  any authenticated user notification-spam an arbitrary userId. */
  async inviteToMeeting(
    inviterId: string,
    slug: string,
    targetUserId: string,
  ): Promise<void> {
    const meeting = await this.activeParticipantOrHost(inviterId, slug);
    if (!meeting) {
      throw new NotFoundException('Meeting not found or already ended');
    }
    if (targetUserId === inviterId) {
      throw new ForbiddenException('Cannot invite yourself');
    }
    if (!(await this.friends.areFriends(inviterId, targetUserId))) {
      throw new ForbiddenException('You can only invite friends');
    }
    const inviter = await this.prisma.user.findUnique({
      where: { id: inviterId },
      select: { name: true, email: true },
    });
    const inviterName = displayName(
      inviter ?? { name: null, email: 'Someone' },
    );
    await this.notifications.create({
      userId: targetUserId,
      actorId: inviterId,
      type: 'MEETING_INVITE',
      title: `${inviterName} invited you to a meeting`,
      body: meeting.title,
      payload: { kind: 'rtc-meeting-invite', slug },
    });
    // Invite email rides the outbox queue, fire-and-forget: a mail hiccup
    // must never fail the invite itself (the in-app notification above is
    // the primary channel).
    void this.sendInviteEmail(targetUserId, inviterName, meeting.title, slug);
    this.logger.log(
      rtcLog('meeting.invite_sent', {
        slug,
        userId: inviterId,
        participantId: targetUserId,
        phase: RtcRoomState.ACTIVE,
      }),
    );
  }

  private async sendInviteEmail(
    targetUserId: string,
    inviterName: string,
    meetingTitle: string,
    slug: string,
  ): Promise<void> {
    try {
      const target = await this.prisma.user.findUnique({
        where: { id: targetUserId },
        select: { email: true },
      });
      if (!target?.email) return;
      // Templates are English-only app-wide, so the /en/ route matches.
      const url = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/v1/en/rtc/meetings/${slug}`;
      await this.mail.enqueue({
        to: target.email,
        userId: targetUserId,
        subject: `${inviterName} invited you to a meeting`,
        template: 'meeting-invite',
        variables: { url, inviterName, meetingTitle },
      });
    } catch (error) {
      this.logger.error(
        rtcErrorLog('meeting.invite_email_failed', error, {
          slug,
          participantId: targetUserId,
        }),
      );
    }
  }

  async leaveMeeting(userId: string, slug: string): Promise<void> {
    const meeting = await this.prisma.meeting.findUnique({ where: { slug } });
    if (!meeting) return;
    await this.chat.markParticipantLeft(meeting.roomId, userId);
    this.realtime.broadcastToRoom(chatChannel(slug), {
      type: 'rtc:meeting-participant-left',
      slug,
      userId,
    });
    this.logger.log(
      rtcLog('meeting.left', {
        meetingId: meeting.id,
        roomId: meeting.roomId,
        slug,
        userId,
      }),
    );
  }

  async endMeeting(userId: string, slug: string): Promise<void> {
    const meeting = await this.mustFindMeetingAsHost(
      userId,
      slug,
      'Only the host can end this meeting',
    );
    await this.finishMeeting(
      meeting.roomId,
      slug,
      meeting.room.livekitRoomName,
      'ended',
    );
  }

  async removeMeetingParticipant(
    hostUserId: string,
    slug: string,
    targetUserId: string,
  ): Promise<void> {
    const meeting = await this.mustFindMeetingAsHost(
      hostUserId,
      slug,
      'Only the host can remove a participant',
    );
    if (targetUserId === hostUserId) {
      // Removing yourself would ban the host from their own meeting;
      // ending it is the operation they actually want.
      throw new ForbiddenException({
        exc: 'EX_FORBIDDEN',
        msg: 'The host cannot remove themselves — end the meeting instead',
        key: 'rtc.errors.hostCannotRemoveSelf',
      });
    }
    // Recorded BEFORE the SFU kick: joinMeeting refuses this user from now
    // on, and enforceRemovalOnRejoin re-kicks them if their still-valid
    // token reconnects to LiveKit directly (the webhook path). Removal is a
    // ban for the rest of the meeting, not a "please leave".
    await this.redis
      .multi()
      .sadd(removedSetKey(meeting.roomId), targetUserId)
      .expire(removedSetKey(meeting.roomId), REMOVED_SET_TTL_SECONDS)
      .exec();
    if (meeting.room.livekitRoomName) {
      await this.liveKit.removeParticipant(
        meeting.room.livekitRoomName,
        targetUserId,
      );
    }
    await this.chat.markParticipantLeft(meeting.roomId, targetUserId);
    this.realtime.emitToUser(targetUserId, {
      type: 'rtc:meeting-removed',
      slug,
    });
    this.realtime.broadcastToRoom(chatChannel(slug), {
      type: 'rtc:meeting-participant-left',
      slug,
      userId: targetUserId,
    });
    this.logger.log(
      rtcLog('meeting.participant_removed', {
        meetingId: meeting.id,
        roomId: meeting.roomId,
        slug,
        userId: hostUserId,
        participantId: targetUserId,
      }),
    );
  }

  async muteMeetingParticipant(
    hostUserId: string,
    slug: string,
    targetUserId: string,
    muted: boolean,
  ): Promise<void> {
    const meeting = await this.mustFindMeetingAsHost(
      hostUserId,
      slug,
      'Only the host can mute a participant',
    );
    if (!meeting.room.livekitRoomName) return;
    await this.liveKit.muteParticipantAudio(
      meeting.room.livekitRoomName,
      targetUserId,
      muted,
    );
    this.realtime.emitToUser(targetUserId, {
      type: 'rtc:meeting-force-muted',
      slug,
      muted,
    });
    this.logger.log(
      rtcLog('meeting.participant_muted', {
        meetingId: meeting.id,
        roomId: meeting.roomId,
        slug,
        userId: hostUserId,
        participantId: targetUserId,
        muted,
      }),
    );
  }

  // ==================== Chat ====================

  async joinRoomChat(ws: AuthWs, slug: unknown): Promise<void> {
    if (!ws.userId || typeof slug !== 'string' || !slug) return;
    const active = await this.activeParticipant(ws.userId, slug);
    if (!active) return;
    this.chat.registerSocket(chatChannel(slug), ws);
  }

  leaveRoomChat(ws: AuthWs, slug: unknown): void {
    if (typeof slug !== 'string' || !slug) return;
    this.chat.leaveSocket(chatChannel(slug), ws.socketId);
  }

  async sendChatMessage(
    ws: AuthWs,
    slug: unknown,
    text: unknown,
  ): Promise<void> {
    if (!ws.userId || typeof slug !== 'string' || !slug) return;
    const body = typeof text === 'string' ? text.trim() : '';
    if (!body) return;
    const meeting = await this.activeParticipant(ws.userId, slug);
    if (!meeting) return;

    await this.chat.sendMessage({
      channel: chatChannel(slug),
      slug,
      roomId: meeting.roomId,
      senderId: ws.userId,
      text: body,
    });
  }

  async getChatHistory(
    userId: string,
    slug: string,
    before: string | undefined,
    take: number,
  ) {
    const meeting = await this.prisma.meeting.findUnique({ where: { slug } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    const participant = await this.prisma.rtcParticipant.findUnique({
      where: { roomId_userId: { roomId: meeting.roomId, userId } },
    });
    if (!participant) {
      throw new ForbiddenException('Not a participant of this meeting');
    }
    return this.chat.getHistory(meeting.roomId, before, take);
  }

  // ==================== LiveKit-webhook-driven ====================

  /** participant_left for a MEETING-kind room: the DB leftAt update already
   *  happened in RtcWebhookController (kind-agnostic); this only notifies
   *  peers still in the meeting so a hard-crash/dropped-connection departure
   *  isn't silent until LiveKit's own departureTimeout. */
  notifyParticipantLeftByLiveKit(roomId: string, identity: string): void {
    void this.broadcastLeaveBySlugForRoom(roomId, identity);
  }

  /** room_finished for a MEETING-kind room: safety net for whenever nobody
   *  called endMeeting explicitly (e.g. every participant's connection just
   *  dropped) — idempotent, a no-op if already ENDED. */
  async handleRoomEndedByLiveKit(roomId: string): Promise<void> {
    const meeting = await this.prisma.meeting.findUnique({ where: { roomId } });
    if (!meeting) return;
    const room = await this.prisma.rtcRoom.findUnique({
      where: { id: roomId },
    });
    if (!room || room.state === RtcRoomState.ENDED) return;
    await this.finishMeeting(
      roomId,
      meeting.slug,
      room.livekitRoomName,
      'ended',
    );
  }

  /** Called by RtcMeetingSweepService once a meeting's persisted
   *  maxDurationMinutes has elapsed since RtcRoom.startedAt. */
  async forceEndExpiredMeeting(slug: string): Promise<void> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { slug },
      include: { room: true },
    });
    if (!meeting || meeting.room.state === RtcRoomState.ENDED) return;
    await this.finishMeeting(
      meeting.roomId,
      slug,
      meeting.room.livekitRoomName,
      'tier_limit',
    );
  }

  sendDurationWarning(slug: string, secondsRemaining: number): void {
    this.realtime.broadcastToRoom(chatChannel(slug), {
      type: 'rtc:meeting-limit-warning',
      slug,
      secondsRemaining,
    });
    this.logger.log(
      rtcLog('meeting.limit_warning', {
        slug,
        secondsRemaining,
        phase: RtcRoomState.ACTIVE,
      }),
    );
  }

  // ==================== Internal ====================

  /** Shared guard for the three host-only controls (end/remove/mute) — finds
   *  the meeting by slug and confirms the caller is its host, or throws.
   *  Doesn't check RtcRoomState the way mustFindActiveMeeting does: a host
   *  ending an already-ending meeting, or muting a participant right as it
   *  wraps up, should still resolve to a normal not-found/forbidden error
   *  rather than a distinct "already ended" one. */
  private async mustFindMeetingAsHost(
    hostUserId: string,
    slug: string,
    forbiddenMessage: string,
  ) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { slug },
      include: { room: true },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.hostId !== hostUserId) {
      throw new ForbiddenException(forbiddenMessage);
    }
    return meeting;
  }

  /** Whether the host removed `userId` from this meeting (roomId-keyed). */
  private async isRemoved(roomId: string, userId: string): Promise<boolean> {
    return (await this.redis.sismember(removedSetKey(roomId), userId)) === 1;
  }

  /**
   * Webhook-side half of the ban: a removed participant whose token is
   * still within its TTL can reconnect to LiveKit without ever touching
   * joinMeeting. When LiveKit reports such a participant_joined, kick them
   * again and tell the caller not to resurrect their participant row.
   * Returns true when the join was refused.
   */
  async enforceRemovalOnRejoin(
    roomId: string,
    livekitRoomName: string,
    userId: string,
  ): Promise<boolean> {
    if (!(await this.isRemoved(roomId, userId))) return false;
    try {
      await this.liveKit.removeParticipant(livekitRoomName, userId);
    } catch (error) {
      this.logger.error(
        rtcErrorLog('meeting.removed_rejoin_kick_failed', error, {
          roomId,
          userId,
          roomName: livekitRoomName,
        }),
      );
    }
    this.logger.warn(
      rtcLog('meeting.removed_rejoin_refused', {
        roomId,
        userId,
        roomName: livekitRoomName,
      }),
    );
    return true;
  }

  private async mustFindActiveMeeting(slug: string) {
    // `host` must be loaded here: joinMeeting returns this object through
    // GraphQL, where Meeting.host is non-nullable — omitting the include
    // made every join die with "Cannot return null for ... Meeting.host".
    const meeting = await this.prisma.meeting.findUnique({
      where: { slug },
      include: { room: true, host: true },
    });
    if (meeting?.room.state !== RtcRoomState.ACTIVE) {
      throw new NotFoundException('Meeting not found or already ended');
    }
    return meeting;
  }

  /** Invite guard: any active participant may invite, and so may the host
   *  of a still-active meeting even before joining it — the create-meeting
   *  flow sends its invites right after createMeeting resolves, before the
   *  host's own join lands. */
  private async activeParticipantOrHost(userId: string, slug: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { slug },
      include: { room: true },
    });
    if (meeting?.room.state !== RtcRoomState.ACTIVE) return null;
    if (meeting.hostId === userId) return meeting;
    if (!(await this.chat.isActiveParticipant(meeting.roomId, userId))) {
      return null;
    }
    return meeting;
  }

  /** Resolves slug → active meeting only if `userId` is currently a
   *  non-departed participant of it — the shared guard for every chat op. */
  private async activeParticipant(userId: string, slug: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { slug } });
    if (!meeting) return null;
    if (!(await this.chat.isActiveParticipant(meeting.roomId, userId))) {
      return null;
    }
    return meeting;
  }

  private async broadcastLeaveBySlugForRoom(
    roomId: string,
    identity: string,
  ): Promise<void> {
    const meeting = await this.prisma.meeting.findUnique({ where: { roomId } });
    if (!meeting) return;
    this.realtime.broadcastToRoom(chatChannel(meeting.slug), {
      type: 'rtc:meeting-participant-left',
      slug: meeting.slug,
      userId: identity,
    });
  }

  private async finishMeeting(
    roomId: string,
    slug: string,
    livekitRoomName: string | null,
    reason: 'ended' | 'tier_limit',
  ): Promise<void> {
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.rtcParticipant.updateMany({
        where: { roomId, leftAt: null },
        data: { leftAt: now },
      }),
      this.prisma.rtcRoom.update({
        where: { id: roomId },
        data: { state: RtcRoomState.ENDED, endedAt: now },
      }),
    ]);
    if (livekitRoomName) {
      await this.liveKit.deleteRoom(livekitRoomName);
    }
    // The removed set only matters while the meeting can still be joined.
    await this.redis.del(removedSetKey(roomId));
    this.realtime.broadcastToRoom(chatChannel(slug), {
      type: 'rtc:meeting-ended',
      slug,
      reason,
    });
    this.logger.log(
      rtcLog('meeting.ended', {
        roomId,
        slug,
        reason,
        phase: RtcRoomState.ENDED,
      }),
    );
  }
}
