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
import { StorageCryptoService } from '../wire-crypto/storage-crypto.service';
// Native @prisma/client enums — see rtc-call.service.ts's import comment for
// why these come from here and not the @generated/prisma/*.enum wrappers.
import { RtcParticipantRole, RtcRoomKind, RtcRoomState } from '@prisma/client';
import { SubscriptionTier } from '../@generated/prisma/subscription-tier.enum';
import { displayName } from '../common/utils/display-name';
import {
  meetingMaxDurationMinutes,
  meetingMaxParticipants,
} from './rtc-tier-limits.constants';

export interface MeetingChatMessageView {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  text: string;
  createdAt: string;
}

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
    private readonly storageCrypto: StorageCryptoService,
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

  async leaveMeeting(userId: string, slug: string): Promise<void> {
    const meeting = await this.prisma.meeting.findUnique({ where: { slug } });
    if (!meeting) return;
    await this.markParticipantLeft(meeting.roomId, userId);
    this.realtime.broadcastToRoom(chatChannel(slug), {
      type: 'rtc:meeting-participant-left',
      slug,
      userId,
    });
  }

  async endMeeting(userId: string, slug: string): Promise<void> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { slug },
      include: { room: true },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.hostId !== userId) {
      throw new ForbiddenException('Only the host can end this meeting');
    }
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
    const meeting = await this.prisma.meeting.findUnique({
      where: { slug },
      include: { room: true },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.hostId !== hostUserId) {
      throw new ForbiddenException('Only the host can remove a participant');
    }
    if (meeting.room.livekitRoomName) {
      await this.liveKit.removeParticipant(
        meeting.room.livekitRoomName,
        targetUserId,
      );
    }
    await this.markParticipantLeft(meeting.roomId, targetUserId);
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
    const meeting = await this.prisma.meeting.findUnique({
      where: { slug },
      include: { room: true },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    if (meeting.hostId !== hostUserId) {
      throw new ForbiddenException('Only the host can mute a participant');
    }
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
    this.realtime.registerRoomSocket(chatChannel(slug), ws);
  }

  leaveRoomChat(ws: AuthWs, slug: unknown): void {
    if (typeof slug !== 'string' || !slug || !ws.socketId) return;
    this.realtime.leaveRoomSocket(chatChannel(slug), ws.socketId);
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

    const { v, ct, nonce } = this.storageCrypto.encryptForRtcRoom({
      text: body,
    });
    const saved = await this.prisma.rtcChatMessage.create({
      data: { roomId: meeting.roomId, senderId: ws.userId, v, ct, nonce },
      include: { sender: true },
    });

    await this.realtime.emitToRoomEncrypted(chatChannel(slug), {
      type: 'rtc:chat-message',
      slug,
      message: {
        id: saved.id,
        senderId: saved.senderId,
        senderName: displayName(saved.sender),
        senderAvatarUrl: saved.sender.avatarUrl ?? null,
        text: body,
        createdAt: saved.createdAt.toISOString(),
      },
    });
  }

  async getChatHistory(
    userId: string,
    slug: string,
    before: string | undefined,
    take: number,
  ): Promise<{ hasMore: boolean; messages: MeetingChatMessageView[] }> {
    const meeting = await this.prisma.meeting.findUnique({ where: { slug } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    const participant = await this.prisma.rtcParticipant.findUnique({
      where: { roomId_userId: { roomId: meeting.roomId, userId } },
    });
    if (!participant) {
      throw new ForbiddenException('Not a participant of this meeting');
    }

    const rows = await this.prisma.rtcChatMessage.findMany({
      where: {
        roomId: meeting.roomId,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      include: { sender: true },
    });
    const hasMore = rows.length > take;
    const page = rows.slice(0, take);
    return {
      hasMore,
      messages: page.map((row) => {
        let text = '';
        try {
          const decrypted = this.storageCrypto.decryptForRtcRoom({
            v: row.v,
            ct: row.ct,
            nonce: row.nonce,
          }) as { text?: string };
          text = decrypted.text ?? '';
        } catch {
          text = '';
        }
        return {
          id: row.id,
          senderId: row.senderId,
          senderName: displayName(row.sender),
          senderAvatarUrl: row.sender.avatarUrl ?? null,
          text,
          createdAt: row.createdAt.toISOString(),
        };
      }),
    };
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
    const participant = await this.prisma.rtcParticipant.findUnique({
      where: { roomId_userId: { roomId: meeting.roomId, userId } },
    });
    if (!participant || participant.leftAt) return null;
    return meeting;
  }

  private async markParticipantLeft(
    roomId: string,
    userId: string,
  ): Promise<void> {
    await this.prisma.rtcParticipant.updateMany({
      where: { roomId, userId, leftAt: null },
      data: { leftAt: new Date() },
    });
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
