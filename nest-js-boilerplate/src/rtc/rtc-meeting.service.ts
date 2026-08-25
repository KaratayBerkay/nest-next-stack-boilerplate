import { randomBytes } from 'node:crypto';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LiveKitService } from './livekit.service';
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

export type { RtcChatMessageView as MeetingChatMessageView } from './rtc-chat.service';

/** How long before a meeting's tier-scaled duration cap the sweep sends a
 *  one-time warning frame. Mirrors the call-limit warning's lead time. */
export const MEETING_LIMIT_WARNING_LEAD_SECONDS = 60;

function chatChannel(slug: string): string {
  // Prefixed so this never collides with a chat-room Room.slug, which shares
  // RealtimeGateway's same flat roomSockets keyspace.
  return `rtc-meeting:${slug}`;
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

    const room = await this.prisma.rtcRoom.create({
      data: {
        kind: RtcRoomKind.MEETING,
        state: RtcRoomState.PENDING,
        createdById: userId,
      },
    });
    const livekitRoomName = `meeting-${room.id}`;
    await this.liveKit.createRoom(livekitRoomName, maxParticipants);
    const now = new Date();
    await this.prisma.rtcRoom.update({
      where: { id: room.id },
      data: { state: RtcRoomState.ACTIVE, livekitRoomName, startedAt: now },
    });

    return this.prisma.meeting.create({
      data: {
        roomId: room.id,
        hostId: userId,
        title: trimmed,
        slug,
        maxParticipants,
        maxDurationMinutes,
      },
      include: { room: true, host: true },
    });
  }

  async meetingBySlug(slug: string) {
    return this.prisma.meeting.findUnique({
      where: { slug },
      include: { room: true, host: true },
    });
  }

  async myMeetings(userId: string) {
    return this.prisma.meeting.findMany({
      where: { hostId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { room: true, host: true },
    });
  }

  async joinMeeting(userId: string, slug: string) {
    const meeting = await this.mustFindActiveMeeting(slug);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, avatarUrl: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const existing = await this.prisma.rtcParticipant.findUnique({
      where: { roomId_userId: { roomId: meeting.roomId, userId } },
    });
    if (!existing || existing.leftAt) {
      const activeCount = await this.prisma.rtcParticipant.count({
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

    const role =
      userId === meeting.hostId
        ? RtcParticipantRole.HOST
        : RtcParticipantRole.PARTICIPANT;
    await this.prisma.rtcParticipant.upsert({
      where: { roomId_userId: { roomId: meeting.roomId, userId } },
      create: { roomId: meeting.roomId, userId, role, livekitIdentity: userId },
      update: { leftAt: null, joinedAt: new Date() },
    });

    const token = await this.liveKit.mintToken({
      identity: userId,
      name: displayName(user),
      roomName: meeting.room.livekitRoomName!,
      canPublish: true,
      canSubscribe: true,
    });

    this.realtime.broadcastToRoom(chatChannel(slug), {
      type: 'rtc:meeting-participant-joined',
      slug,
      userId,
      name: displayName(user),
      avatarUrl: user.avatarUrl ?? null,
      role,
    });

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
    const meeting = await this.activeParticipant(inviterId, slug);
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
    await this.notifications.create({
      userId: targetUserId,
      actorId: inviterId,
      type: 'MEETING_INVITE',
      title: `${displayName(inviter ?? { name: null, email: 'Someone' })} invited you to a meeting`,
      body: meeting.title,
      payload: { kind: 'rtc-meeting-invite', slug },
    });
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

  private async mustFindActiveMeeting(slug: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { slug },
      include: { room: true },
    });
    if (meeting?.room.state !== RtcRoomState.ACTIVE) {
      throw new NotFoundException('Meeting not found or already ended');
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
    await this.prisma.rtcParticipant.updateMany({
      where: { roomId, leftAt: null },
      data: { leftAt: now },
    });
    await this.prisma.rtcRoom.update({
      where: { id: roomId },
      data: { state: RtcRoomState.ENDED, endedAt: now },
    });
    if (livekitRoomName) {
      await this.liveKit.deleteRoom(livekitRoomName);
    }
    this.realtime.broadcastToRoom(chatChannel(slug), {
      type: 'rtc:meeting-ended',
      slug,
      reason,
    });
    this.logger.log({ category: 'rtc', event: 'meeting.ended', slug, reason });
  }
}
