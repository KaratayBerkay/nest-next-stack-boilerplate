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
import { displayName } from '../common/utils/display-name';
import type { LiveStream, RtcRoom } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { FriendsService } from '../friends/friends.service';

export type { RtcChatMessageView as StreamChatMessageView } from './rtc-chat.service';

type StreamWithRoom = LiveStream & { room: RtcRoom };

function chatChannel(slug: string): string {
  // Own prefix, distinct from rtc-meeting: and a chat-room Room.slug — all
  // three share RealtimeGateway's flat roomSockets keyspace.
  return `rtc-stream:${slug}`;
}

function generateSlug(): string {
  return randomBytes(9).toString('base64url');
}

/**
 * 1-broadcaster-to-many-viewers lifecycle: create-and-ready-on-create like
 * meetings (no ringing phase), gated to broadcast (@MinTier(MEDIUM), enforced
 * in RtcResolver) but ungated to watch, no duration cap (unlike calls/
 * meetings — going live isn't a scarce resource the same way, and the plan
 * never asked for one). Chat reuses the exact same encrypted-at-rest
 * mechanism and rtc:join-room-chat/rtc:leave-room-chat/rtc:chat-message frame
 * vocabulary as RtcMeetingService — see RtcChatWsGateway, which tries both
 * services against the same frame types and lets each no-op on a slug it
 * doesn't own.
 *
 * `LiveStream.slug` is the only client-facing handle, same reasoning as
 * Meeting.slug (see RtcMeetingService's doc comment).
 */
@Injectable()
export class RtcStreamService {
  private readonly logger = new Logger(RtcStreamService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly liveKit: LiveKitService,
    private readonly realtime: RealtimeGateway,
    private readonly chat: RtcChatService,
    private readonly notifications: NotificationService,
    private readonly friends: FriendsService,
  ) {}

  async goLive(userId: string, title: string) {
    const trimmed = title.trim().slice(0, 200) || 'Live stream';
    const broadcaster = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, avatarUrl: true },
    });
    if (!broadcaster) throw new NotFoundException('User not found');
    const slug = generateSlug();

    const room = await this.prisma.rtcRoom.create({
      data: {
        kind: RtcRoomKind.STREAM,
        state: RtcRoomState.PENDING,
        createdById: userId,
      },
    });
    const livekitRoomName = `stream-${room.id}`;
    await this.liveKit.createRoom(livekitRoomName);
    const now = new Date();
    await this.prisma.rtcRoom.update({
      where: { id: room.id },
      data: { state: RtcRoomState.ACTIVE, livekitRoomName, startedAt: now },
    });

    const stream = await this.prisma.liveStream.create({
      data: { roomId: room.id, broadcasterId: userId, title: trimmed, slug },
      include: { room: true, broadcaster: true },
    });
    await this.prisma.rtcParticipant.create({
      data: {
        roomId: room.id,
        userId,
        role: RtcParticipantRole.BROADCASTER,
        livekitIdentity: userId,
      },
    });

    const token = await this.liveKit.mintToken({
      identity: userId,
      name: displayName(broadcaster),
      roomName: livekitRoomName,
      canPublish: true,
      canSubscribe: true,
    });

    this.logger.log({ category: 'rtc', event: 'stream.started', slug });
    this.notifyFriendsWentLive(userId, stream.title, slug);
    return { token, roomName: livekitRoomName, stream };
  }

  /** Fire-and-forget: every friend of the broadcaster gets a persisted
   *  STREAM_LIVE notification (falls back to push if they're not
   *  currently connected, per NotificationService.create's own rule).
   *  Not awaited — goLive shouldn't be slower for a broadcaster with many
   *  friends, and one failed notification shouldn't fail the mutation. */
  private notifyFriendsWentLive(
    broadcasterId: string,
    streamTitle: string,
    slug: string,
  ): void {
    void (async () => {
      const [broadcaster, friendIds] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: broadcasterId },
          select: { name: true, email: true },
        }),
        this.friends.getFriendIds(broadcasterId),
      ]);
      const who = displayName(broadcaster ?? { name: null, email: 'Someone' });
      const results = await Promise.allSettled(
        friendIds.map((friendId) =>
          this.notifications.create({
            userId: friendId,
            actorId: broadcasterId,
            type: 'STREAM_LIVE',
            title: `${who} is live now`,
            body: streamTitle,
            payload: { kind: 'rtc-stream-live', slug },
          }),
        ),
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed > 0) {
        this.logger.warn(
          `stream-live notify: ${failed}/${friendIds.length} failed for ${slug}`,
        );
      }
    })().catch((err: Error) =>
      this.logger.error(
        { event: 'stream_live_notification_failed', error: err.message },
        `Stream-live notification failed: ${err.message}`,
      ),
    );
  }

  async liveStreams() {
    return this.prisma.liveStream.findMany({
      where: { isLive: true },
      orderBy: { startedAt: 'desc' },
      take: 50,
      include: { room: true, broadcaster: true },
    });
  }

  async streamBySlug(slug: string) {
    return this.prisma.liveStream.findUnique({
      where: { slug },
      include: { room: true, broadcaster: true },
    });
  }

  /** Live number comes from LiveKit's own participant list at read time —
   *  peakViewerCount in the DB is a historical high-water mark only. The
   *  broadcaster occupies one LiveKit participant slot too, so it's
   *  subtracted out of the viewer-facing count while still live. */
  async getViewerCount(stream: {
    isLive: boolean;
    room?: { livekitRoomName: string | null } | null;
  }): Promise<number> {
    const roomName = stream.room?.livekitRoomName;
    if (!roomName) return 0;
    const count = await this.liveKit.listParticipantCount(roomName);
    return Math.max(0, count - (stream.isLive ? 1 : 0));
  }

  async joinStreamAsViewer(userId: string, slug: string) {
    const stream = await this.mustFindLiveStream(slug);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, avatarUrl: true },
    });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.rtcParticipant.upsert({
      where: { roomId_userId: { roomId: stream.roomId, userId } },
      create: {
        roomId: stream.roomId,
        userId,
        role: RtcParticipantRole.VIEWER,
        livekitIdentity: userId,
      },
      update: { leftAt: null, joinedAt: new Date() },
    });

    const token = await this.liveKit.mintToken({
      identity: userId,
      name: displayName(user),
      roomName: stream.room.livekitRoomName!,
      canPublish: false,
      canSubscribe: true,
    });

    const viewerCount = await this.getViewerCount(stream);
    if (viewerCount > stream.peakViewerCount) {
      await this.prisma.liveStream.update({
        where: { id: stream.id },
        data: { peakViewerCount: viewerCount },
      });
    }

    this.realtime.broadcastToRoom(chatChannel(slug), {
      type: 'rtc:stream-viewer-joined',
      slug,
      userId,
      name: displayName(user),
      viewerCount,
    });

    return { token, roomName: stream.room.livekitRoomName!, stream };
  }

  async leaveStreamAsViewer(userId: string, slug: string): Promise<void> {
    const stream = await this.prisma.liveStream.findUnique({
      where: { slug },
      include: { room: true },
    });
    if (!stream) return;
    await this.chat.markParticipantLeft(stream.roomId, userId);
    const viewerCount = await this.getViewerCount(stream);
    this.realtime.broadcastToRoom(chatChannel(slug), {
      type: 'rtc:stream-viewer-left',
      slug,
      userId,
      viewerCount,
    });
  }

  async endStream(userId: string, slug: string): Promise<void> {
    const stream = await this.prisma.liveStream.findUnique({
      where: { slug },
      include: { room: true },
    });
    if (!stream) throw new NotFoundException('Stream not found');
    if (stream.broadcasterId !== userId) {
      throw new ForbiddenException('Only the broadcaster can end this stream');
    }
    await this.finishStream(stream);
  }

  // ==================== Chat ====================
  // Same shape as RtcMeetingService's chat methods — see RtcChatWsGateway for
  // how both services share the rtc:join-room-chat/leave/chat-message frames.

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
    const stream = await this.activeParticipant(ws.userId, slug);
    if (!stream) return;

    await this.chat.sendMessage({
      channel: chatChannel(slug),
      slug,
      roomId: stream.roomId,
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
    const stream = await this.prisma.liveStream.findUnique({
      where: { slug },
    });
    if (!stream) throw new NotFoundException('Stream not found');
    const participant = await this.prisma.rtcParticipant.findUnique({
      where: { roomId_userId: { roomId: stream.roomId, userId } },
    });
    if (!participant) {
      throw new ForbiddenException('Not a participant of this stream');
    }
    return this.chat.getHistory(stream.roomId, before, take);
  }

  // ==================== LiveKit-webhook-driven ====================

  /** participant_left for a STREAM-kind room: the DB leftAt update already
   *  happened in RtcWebhookController (kind-agnostic) — this only notifies
   *  chat participants so a hard-crash/dropped viewer isn't silent. Doesn't
   *  distinguish a departed viewer from a departed broadcaster: a dropped
   *  broadcaster connection is NOT treated as "stream ended" here (mirrors
   *  meetings' host-leaves policy) — only room_finished (LiveKit's own
   *  empty/departure timeout) or an explicit endStream call ends it. */
  notifyViewerLeftByLiveKit(roomId: string, identity: string): void {
    void this.broadcastLeaveBySlugForRoom(roomId, identity);
  }

  /** room_finished for a STREAM-kind room: safety net for whenever nobody
   *  called endStream explicitly — idempotent, a no-op if already !isLive. */
  async handleRoomEndedByLiveKit(roomId: string): Promise<void> {
    const stream = await this.prisma.liveStream.findUnique({
      where: { roomId },
      include: { room: true },
    });
    if (!stream?.isLive) return;
    await this.finishStream(stream);
  }

  // ==================== Internal ====================

  private async mustFindLiveStream(slug: string): Promise<StreamWithRoom> {
    const stream = await this.prisma.liveStream.findUnique({
      where: { slug },
      include: { room: true, broadcaster: true },
    });
    if (!stream?.isLive) {
      throw new NotFoundException('Stream not found or already ended');
    }
    return stream;
  }

  /** Resolves slug → live stream only if `userId` is currently a
   *  non-departed participant (viewer or broadcaster) of it — the shared
   *  guard for every chat op, same shape as RtcMeetingService's. */
  private async activeParticipant(userId: string, slug: string) {
    const stream = await this.prisma.liveStream.findUnique({ where: { slug } });
    if (!stream) return null;
    if (!(await this.chat.isActiveParticipant(stream.roomId, userId))) {
      return null;
    }
    return stream;
  }

  private async broadcastLeaveBySlugForRoom(
    roomId: string,
    identity: string,
  ): Promise<void> {
    const stream = await this.prisma.liveStream.findUnique({
      where: { roomId },
    });
    if (!stream) return;
    this.realtime.broadcastToRoom(chatChannel(stream.slug), {
      type: 'rtc:stream-viewer-left',
      slug: stream.slug,
      userId: identity,
    });
  }

  private async finishStream(stream: StreamWithRoom): Promise<void> {
    const now = new Date();
    await this.prisma.rtcParticipant.updateMany({
      where: { roomId: stream.roomId, leftAt: null },
      data: { leftAt: now },
    });
    await this.prisma.rtcRoom.update({
      where: { id: stream.roomId },
      data: { state: RtcRoomState.ENDED, endedAt: now },
    });
    await this.prisma.liveStream.update({
      where: { id: stream.id },
      data: { isLive: false, endedAt: now },
    });
    if (stream.room.livekitRoomName) {
      await this.liveKit.deleteRoom(stream.room.livekitRoomName);
    }
    this.realtime.broadcastToRoom(chatChannel(stream.slug), {
      type: 'rtc:stream-ended',
      slug: stream.slug,
    });
    this.logger.log({
      category: 'rtc',
      event: 'stream.ended',
      slug: stream.slug,
    });
  }
}
