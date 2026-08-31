import { randomBytes } from 'node:crypto';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LiveKitService, toLivekitRoomName } from './livekit.service';
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
import { rtcErrorLog, rtcLog } from './rtc-logger';

export type { RtcChatMessageView as StreamChatMessageView } from './rtc-chat.service';

type StreamWithRoom = LiveStream & { room: RtcRoom };

/** Client-safe watcher shape exposed on the GraphQL LiveStream type. */
export interface StreamViewerSummaryView {
  userId: string;
  name: string;
  avatarUrl: string | null;
  joinedAt: Date;
}

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

    // RtcRoom + LiveStream + the broadcaster's own RtcParticipant row are
    // created together, atomically — same reasoning as
    // RtcMeetingService.createMeeting's matching comment: an "ACTIVE room,
    // no LiveStream row" state must never be reachable, and a LiveStream
    // whose broadcaster never got their own RtcParticipant would silently
    // break the broadcaster's own access to their stream's chat
    // (isActiveParticipant looks up exactly that row).
    const roomId = await this.prisma.$transaction(async (tx) => {
      const room = await tx.rtcRoom.create({
        data: {
          kind: RtcRoomKind.STREAM,
          state: RtcRoomState.PENDING,
          createdById: userId,
        },
      });
      await tx.liveStream.create({
        data: { roomId: room.id, broadcasterId: userId, title: trimmed, slug },
      });
      await tx.rtcParticipant.create({
        data: {
          roomId: room.id,
          userId,
          role: RtcParticipantRole.BROADCASTER,
          livekitIdentity: userId,
        },
      });
      return room.id;
    });

    const livekitRoomName = toLivekitRoomName('stream', roomId);
    try {
      await this.liveKit.createRoom(livekitRoomName);
    } catch (error) {
      this.logger.error(
        rtcErrorLog('stream.livekit_create_failed', error, {
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

    const stream = await this.prisma.liveStream.findUniqueOrThrow({
      where: { roomId },
      include: { room: true, broadcaster: true },
    });

    let token: string;
    try {
      token = await this.liveKit.mintToken({
        identity: userId,
        name: displayName(broadcaster),
        roomName: livekitRoomName,
        canPublish: true,
        canSubscribe: true,
      });
    } catch (error) {
      this.logger.error(
        rtcErrorLog('stream.livekit_token_failed', error, {
          roomId,
          roomName: livekitRoomName,
          userId,
        }),
      );
      throw error;
    }

    this.logger.log(
      rtcLog('stream.started', {
        roomId,
        slug,
        userId,
        phase: RtcRoomState.ACTIVE,
      }),
    );
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
          rtcLog('stream.live_notification_partial_failure', {
            slug,
            userId: broadcasterId,
            failed,
            total: friendIds.length,
          }),
        );
      }
    })().catch((err: Error) =>
      this.logger.error(
        rtcErrorLog('stream.live_notification_failed', err, {
          slug,
          userId: broadcasterId,
        }),
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

  /** Live number comes from RtcParticipant rows (role VIEWER, leftAt null),
   *  NOT LiveKit's participant list: joinStreamAsViewer runs before the
   *  viewer's WebRTC connection exists, so a LiveKit read at that moment
   *  missed the very viewer that triggered it — the first viewer's joined
   *  frame carried viewerCount 0 and the broadcaster's "watching" counter
   *  never left 0 (nothing re-broadcast once the connection landed). The
   *  VIEWER row is upserted before the joined broadcast and leftAt is
   *  stamped by both the explicit leave path and the participant_left
   *  webhook, so the count is right at every broadcast. peakViewerCount in
   *  the DB stays a historical high-water mark only. */
  async getViewerCount(stream: { roomId: string }): Promise<number> {
    return this.prisma.rtcParticipant.count({
      where: {
        roomId: stream.roomId,
        role: RtcParticipantRole.VIEWER,
        leftAt: null,
      },
    });
  }

  /** Client-safe watcher list for the GraphQL LiveStream.viewers field —
   *  same deliberate summary contract as RtcMeetingService
   *  .participantSummaries (no email, hideAvatar honored, no raw
   *  livekitIdentity), VIEWER rows only (the broadcaster is the stage, not
   *  the audience), capped so a large audience can't balloon the response. */
  async viewerSummaries(stream: {
    roomId: string;
  }): Promise<StreamViewerSummaryView[]> {
    const rows = await this.prisma.rtcParticipant.findMany({
      where: {
        roomId: stream.roomId,
        role: RtcParticipantRole.VIEWER,
        leftAt: null,
      },
      orderBy: { joinedAt: 'asc' },
      take: 200,
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
    });
    return rows.map((p) => ({
      userId: p.userId,
      name: displayName(p.user),
      avatarUrl: p.user.hideAvatar ? null : (p.user.avatarUrl ?? null),
      joinedAt: p.joinedAt,
    }));
  }

  async joinStreamAsViewer(userId: string, slug: string) {
    const stream = await this.mustFindLiveStream(slug);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, avatarUrl: true },
    });
    if (!user) throw new NotFoundException('User not found');

    // The broadcaster opening their own stream's viewer page must not run
    // the viewer side effects: the upsert would overwrite their BROADCASTER
    // row's joinedAt, the viewer-joined broadcast/peak bump would count them
    // as their own audience, and the leaveStreamAsViewer that follows that
    // page would stamp their leftAt — silently cutting them off from their
    // own chat (isActiveParticipant guards every chat op on leftAt).
    const isBroadcaster = userId === stream.broadcasterId;

    if (!isBroadcaster) {
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
    }

    let token: string;
    try {
      token = await this.liveKit.mintToken({
        identity: userId,
        name: displayName(user),
        roomName: stream.room.livekitRoomName!,
        canPublish: false,
        canSubscribe: true,
      });
    } catch (error) {
      this.logger.error(
        rtcErrorLog('stream.livekit_token_failed', error, {
          roomId: stream.roomId,
          roomName: stream.room.livekitRoomName,
          slug,
          userId,
          role: RtcParticipantRole.VIEWER,
        }),
      );
      throw error;
    }

    if (!isBroadcaster) {
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

      this.logger.log(
        rtcLog('stream.viewer_joined', {
          roomId: stream.roomId,
          slug,
          userId,
          viewerCount,
          phase: RtcRoomState.ACTIVE,
        }),
      );
    }

    return { token, roomName: stream.room.livekitRoomName!, stream };
  }

  async leaveStreamAsViewer(userId: string, slug: string): Promise<void> {
    const stream = await this.prisma.liveStream.findUnique({
      where: { slug },
      include: { room: true },
    });
    if (!stream) return;
    // Mirror of joinStreamAsViewer's broadcaster guard: the viewer-leave
    // path must never stamp leftAt on the broadcaster's own row while
    // they're live — that row is what keeps their own chat working.
    if (stream.broadcasterId === userId) return;
    await this.chat.markParticipantLeft(stream.roomId, userId);
    const viewerCount = await this.getViewerCount(stream);
    this.realtime.broadcastToRoom(chatChannel(slug), {
      type: 'rtc:stream-viewer-left',
      slug,
      userId,
      viewerCount,
    });
    this.logger.log(
      rtcLog('stream.viewer_left', {
        roomId: stream.roomId,
        slug,
        userId,
        viewerCount,
      }),
    );
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
    // Already over (LiveKit's room_finished safety net, or a double end-click
    // racing it) — succeed silently instead of re-running finishStream, which
    // would re-broadcast rtc:stream-ended to the chat channel.
    if (!stream.isLive) return;
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

  /** participant_joined for a STREAM-kind room: the leftAt clear (rejoin
   *  case) already happened in RtcWebhookController — this re-broadcasts the
   *  count now that the viewer's WebRTC connection actually exists. It is
   *  what settles the counter after livekit-client's full reconnect (whose
   *  participant_left broadcast a decremented count moments earlier) and
   *  doubles as a resync on every genuine connect. Broadcaster connects are
   *  filtered out — their participant row isn't VIEWER-role. */
  notifyViewerJoinedByLiveKit(roomId: string, identity: string): void {
    void (async () => {
      const stream = await this.prisma.liveStream.findUnique({
        where: { roomId },
      });
      if (!stream) return;
      const row = await this.prisma.rtcParticipant.findUnique({
        where: { roomId_userId: { roomId, userId: identity } },
      });
      if (row?.role !== RtcParticipantRole.VIEWER) return;
      const viewerCount = await this.getViewerCount(stream);
      this.realtime.broadcastToRoom(chatChannel(stream.slug), {
        type: 'rtc:stream-viewer-joined',
        slug: stream.slug,
        userId: identity,
        viewerCount,
      });
    })().catch((err: Error) =>
      this.logger.error(
        rtcErrorLog('stream.viewer_joined_notify_failed', err, { roomId }),
      ),
    );
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
      include: { room: true },
    });
    if (!stream) return;
    // Must carry viewerCount like leaveStreamAsViewer's broadcast does: the
    // web hook reads the count off every joined/left frame, and this webhook
    // path used to omit it — one hard-dropped viewer (tab crash, network cut)
    // zeroed the visible count for everyone still watching. The departed
    // viewer's leftAt was already stamped by RtcWebhookController before this
    // notify runs, so the DB read-time count is accurate.
    const viewerCount = await this.getViewerCount(stream);
    this.realtime.broadcastToRoom(chatChannel(stream.slug), {
      type: 'rtc:stream-viewer-left',
      slug: stream.slug,
      userId: identity,
      viewerCount,
    });
  }

  private async finishStream(stream: StreamWithRoom): Promise<void> {
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.rtcParticipant.updateMany({
        where: { roomId: stream.roomId, leftAt: null },
        data: { leftAt: now },
      }),
      this.prisma.rtcRoom.update({
        where: { id: stream.roomId },
        data: { state: RtcRoomState.ENDED, endedAt: now },
      }),
      this.prisma.liveStream.update({
        where: { id: stream.id },
        data: { isLive: false, endedAt: now },
      }),
    ]);
    if (stream.room.livekitRoomName) {
      await this.liveKit.deleteRoom(stream.room.livekitRoomName);
    }
    this.realtime.broadcastToRoom(chatChannel(stream.slug), {
      type: 'rtc:stream-ended',
      slug: stream.slug,
    });
    this.logger.log(
      rtcLog('stream.ended', {
        roomId: stream.roomId,
        slug: stream.slug,
        phase: RtcRoomState.ENDED,
      }),
    );
  }
}
