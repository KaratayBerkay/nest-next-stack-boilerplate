import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { WebSocket } from 'ws';
import { PrismaService } from '../prisma/prisma.service';
import {
  MessagingService,
  isValidRoom,
  VIP_ROOM_PREFIX,
} from './messaging.service';
import type { RoomMember } from './messaging.types';
import { initials, type MessageAttachment } from './messaging.types';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { tierRank, MIN_TIER_FOR_VIP } from '../authorization/tier-rank';
import { MAX_ENVELOPE_JSON_BYTES } from './dto/envelope-size.constraint';

type AuthWs = WebSocket & {
  userId?: string;
  userName?: string;
  chatNickname?: string;
  useNickname?: boolean;
  avatarUrl?: string | null;
  tier?: string;
  socketId?: string;
  room?: string;
  authenticated: boolean;
  isAlive: boolean;
  deviceTokenHash?: string;
  userToken?: string;
  registeredServices?: string[];
  watchedTopics?: string[];
  pendingIp?: string;
};

interface IncomingMessagePayload {
  text: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  envelope?: Record<string, unknown>;
}

function toAttachment(
  data: IncomingMessagePayload,
): MessageAttachment | undefined {
  if (data.attachmentUrl && data.attachmentType && data.attachmentName) {
    return {
      url: data.attachmentUrl,
      type: data.attachmentType,
      name: data.attachmentName,
    };
  }
  return undefined;
}

function hasTextOrAttachmentOrEnvelope(data: IncomingMessagePayload): boolean {
  if (data.envelope && typeof data.envelope === 'object') return true;
  return Boolean((data.text ?? '').trim()) || Boolean(data.attachmentUrl);
}

/**
 * WS frames bypass the REST/GraphQL DTO pipeline entirely (no
 * ValidationPipe / EnvelopeSizeConstraint runs on a raw parsed WS
 * message), so this same cap has to be enforced by hand here — otherwise
 * a malicious or buggy client could send an arbitrarily large `envelope`
 * over the socket straight into Postgres and every connected tab's relay.
 */
function isEnvelopeTooLarge(data: IncomingMessagePayload): boolean {
  if (!data.envelope || typeof data.envelope !== 'object') return false;
  let serialized: string;
  try {
    serialized = JSON.stringify(data.envelope);
  } catch {
    return true;
  }
  return serialized.length > MAX_ENVELOPE_JSON_BYTES;
}

interface SavedRoomMessage {
  id: string;
  senderId: string;
  body: string | null;
  encrypted: boolean;
  algVersion: number | null;
  envelope: unknown;
  attachmentUrl: string | null;
  attachmentType: string | null;
  attachmentName: string | null;
  createdAt: Date;
}

function buildRoomMessagePayload(
  saved: SavedRoomMessage,
  ws: AuthWs,
  data: IncomingMessagePayload & { room: string; tempId?: string },
): Record<string, unknown> {
  const senderName =
    (ws.useNickname && ws.chatNickname) || ws.userName || 'Unknown';
  const message: Record<string, unknown> = {
    id: saved.id,
    senderId: saved.senderId,
    senderName,
    avatar: initials(senderName),
    body: saved.body,
    encrypted: saved.encrypted,
    attachmentUrl: saved.attachmentUrl,
    attachmentType: saved.attachmentType,
    attachmentName: saved.attachmentName,
    createdAt: saved.createdAt.toISOString(),
  };
  if (saved.encrypted && saved.envelope) {
    message.envelope = saved.envelope;
    message.algVersion = saved.algVersion;
  }
  const payload: Record<string, unknown> = {
    type: 'room-message',
    room: data.room,
    message,
  };
  if (data.tempId) payload.tempId = data.tempId;
  return payload;
}

@Injectable()
export class MessagingWsGateway implements OnModuleInit {
  private readonly logger = new Logger(MessagingWsGateway.name);

  constructor(
    private readonly realtime: RealtimeGateway,
    private readonly prisma: PrismaService,
    private readonly ms: MessagingService,
    private readonly push: PushNotificationService,
  ) {}

  onModuleInit() {
    this.realtime.registerHandler('direct-message', (ws, data) =>
      this.handleDirectMessage(
        ws as AuthWs,
        data as unknown as IncomingMessagePayload & { recipientId: string },
      ),
    );
    this.realtime.registerHandler('delivered-ack', (ws, data) =>
      this.handleDeliveredAck(
        ws as AuthWs,
        data as unknown as { messageId: string },
      ),
    );
    this.realtime.registerHandler('join-room', (ws, data) =>
      this.handleJoinRoom(ws as AuthWs, data as unknown as { room: string }),
    );
    this.realtime.registerHandler('leave-room', (ws, data) =>
      this.handleLeaveRoom(ws as AuthWs, data as unknown as { room: string }),
    );
    this.realtime.registerHandler('room-message', (ws, data) =>
      this.handleRoomMessage(
        ws as AuthWs,
        data as unknown as IncomingMessagePayload & {
          room: string;
          tempId?: string;
        },
      ),
    );
    this.realtime.registerHandler('get-room-counts', (ws) =>
      this.handleGetRoomCounts(ws as AuthWs),
    );
    this.realtime.registerHandler('get-room-members', (ws, data) =>
      this.handleGetRoomMembers(
        ws as AuthWs,
        data as unknown as { room: string },
      ),
    );
    this.realtime.registerHandler('typing-start', (ws, data) =>
      this.handleTypingStart(
        ws as AuthWs,
        data as unknown as { recipientId: string },
      ),
    );
    this.realtime.registerHandler('typing-stop', (ws, data) =>
      this.handleTypingStop(
        ws as AuthWs,
        data as unknown as { recipientId: string },
      ),
    );

    // Page-claim callbacks for chat-room (Phase 7 D1/D2)
    this.realtime.registerPageCallbacks(
      'chat-room',
      (ws, params) => this.handleClaimJoinRoom(ws as AuthWs, params),
      (ws, params) => this.handleClaimLeaveRoom(ws as AuthWs, params),
    );
  }

  private async handleDirectMessage(
    ws: AuthWs,
    data: IncomingMessagePayload & { recipientId: string },
  ) {
    if (!ws.userId) return;
    if (!hasTextOrAttachmentOrEnvelope(data)) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'A message must contain text, an attachment, or an envelope',
        }),
      );
      return;
    }
    if (isEnvelopeTooLarge(data)) {
      ws.send(JSON.stringify({ type: 'error', message: 'envelope too large' }));
      return;
    }
    const message = await this.ms.sendMessage(
      ws.userId,
      data.recipientId,
      data.text,
      undefined,
      toAttachment(data),
      data.envelope,
    );
    await this.ms.deliverDirectMessage(message);
  }

  private async handleDeliveredAck(ws: AuthWs, data: { messageId: string }) {
    if (!ws.userId) return;
    const message = await this.prisma.message.findUnique({
      where: { id: data.messageId },
      select: { senderId: true, recipientId: true },
    });
    if (!message) return;
    // Only the true recipient can ack delivery
    if (message.recipientId !== ws.userId) return;
    const deliveredAt = new Date();
    await this.prisma.message.update({
      where: { id: data.messageId },
      data: { deliveredAt },
    });
    this.realtime.emitToPage(message.senderId, 'messages', {
      type: 'message-delivered',
      peerId: message.recipientId,
      messageId: data.messageId,
      deliveredAt: deliveredAt.toISOString(),
    });
    this.realtime.emitToService(message.senderId, 'MESSAGE', {
      type: 'message-delivered',
      peerId: message.recipientId,
      messageId: data.messageId,
      deliveredAt: deliveredAt.toISOString(),
    });
  }

  // Returns an error message if ws may not join room, null if it's allowed.
  private roomJoinError(ws: AuthWs, room: string): string | null {
    if (!isValidRoom(room)) return 'Invalid room';
    if (
      room.startsWith(VIP_ROOM_PREFIX) &&
      tierRank(ws.tier ?? 'FREE') < MIN_TIER_FOR_VIP
    ) {
      return 'VIP rooms require MEDIUM tier or above';
    }
    return null;
  }

  // Leaves+broadcasts the previously-joined room, if any and different.
  private leavePreviousRoom(ws: AuthWs, nextRoom: string): void {
    if (!ws.room || ws.room === nextRoom || !ws.socketId) return;
    const oldMembers = this.ms.leaveRoom(ws.room, ws.socketId);
    this.realtime.broadcastToRoom(ws.room, {
      type: 'user-left',
      room: ws.room,
      members: oldMembers,
    });
  }

  private handleJoinRoom(ws: AuthWs, data: { room: string }) {
    if (!ws.userId || !ws.socketId) return;
    const error = this.roomJoinError(ws, data.room);
    if (error) {
      ws.send(JSON.stringify({ type: 'error', message: error }));
      return;
    }
    this.leavePreviousRoom(ws, data.room);
    ws.room = data.room;
    const member: RoomMember = {
      socketId: ws.socketId,
      userId: ws.userId,
      name: ws.userName ?? 'Unknown',
      chatNickname: (ws.useNickname && ws.chatNickname) || undefined,
      avatarUrl: ws.avatarUrl ?? null,
    };
    const members = this.ms.joinRoom(data.room, member);
    void this.ms.persistJoin(data.room, ws.userId);
    this.realtime.broadcastToRoom(data.room, {
      type: 'user-joined',
      room: data.room,
      user: member,
      members,
    });
    this.realtime.broadcastAll({
      type: 'room-counts',
      rooms: this.ms.getRoomCounts(),
    });
  }

  private handleLeaveRoom(ws: AuthWs, data: { room: string }) {
    if (!ws.userId || !ws.socketId) return;
    ws.room = undefined;
    const members = this.ms.leaveRoom(data.room, ws.socketId);
    void this.ms.persistLeave(data.room, ws.userId);
    this.realtime.broadcastToRoom(data.room, {
      type: 'user-left',
      room: data.room,
      members,
    });
    this.realtime.broadcastAll({
      type: 'room-counts',
      rooms: this.ms.getRoomCounts(),
    });
  }

  private async handleRoomMessage(
    ws: AuthWs,
    data: IncomingMessagePayload & { room: string; tempId?: string },
  ) {
    if (!ws.userId) return;
    if (!isValidRoom(data.room)) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid room' }));
      return;
    }
    if (!hasTextOrAttachmentOrEnvelope(data)) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message:
            'A message must contain either text, an attachment, or an envelope',
        }),
      );
      return;
    }
    if (isEnvelopeTooLarge(data)) {
      ws.send(JSON.stringify({ type: 'error', message: 'envelope too large' }));
      return;
    }
    const saved = await this.ms.saveRoomMessage(
      data.room,
      ws.userId,
      data.text ?? '',
      toAttachment(data),
      data.envelope,
    );
    this.realtime.broadcastToRoom(
      data.room,
      buildRoomMessagePayload(saved, ws, data),
    );
  }

  private handleGetRoomCounts(ws: AuthWs) {
    ws.send(
      JSON.stringify({
        type: 'room-counts',
        rooms: this.ms.getRoomCounts(),
      }),
    );
  }

  // On-demand pull for the current member list, mirroring get-room-counts.
  // user-joined/user-left broadcasts alone aren't enough: a client that
  // joins a room after another client is already present never receives a
  // broadcast for that pre-existing member (nothing re-fires on their
  // behalf), so the online list silently stays empty until someone else's
  // join/leave happens to fire one. Also covers the join-broadcast-vs-
  // subscription race — the page-claim's own join can complete and
  // broadcast before the component that renders the list has finished
  // registering its 'user-joined' listener.
  private handleGetRoomMembers(ws: AuthWs, data: { room: string }) {
    if (!data.room || !isValidRoom(data.room)) return;
    ws.send(
      JSON.stringify({
        type: 'room-members',
        room: data.room,
        members: this.ms.getRoomMembers(data.room),
      }),
    );
  }

  // Phase 7: page-claim room join/leave (chat-room claim translates to room join)

  private handleClaimJoinRoom(ws: AuthWs, params: Record<string, string>) {
    if (!ws.userId || !ws.socketId || !params.room) return;
    const room = params.room;
    const error = this.roomJoinError(ws, room);
    if (error) {
      ws.send(JSON.stringify({ type: 'error', message: error }));
      return;
    }
    this.leavePreviousRoom(ws, room);
    ws.room = room;
    const member: RoomMember = {
      socketId: ws.socketId,
      userId: ws.userId,
      name: ws.userName ?? 'Unknown',
      chatNickname: (ws.useNickname && ws.chatNickname) || undefined,
      avatarUrl: ws.avatarUrl ?? null,
    };
    const members = this.ms.joinRoom(room, member);
    void this.ms.persistJoin(room, ws.userId);
    this.realtime.broadcastToRoom(room, {
      type: 'user-joined',
      room,
      user: member,
      members,
    });
    this.realtime.broadcastAll({
      type: 'room-counts',
      rooms: this.ms.getRoomCounts(),
    });
  }

  private handleClaimLeaveRoom(ws: AuthWs, params: Record<string, string>) {
    if (!ws.userId || !ws.socketId || !params.room) return;
    ws.room = undefined;
    const members = this.ms.leaveRoom(params.room, ws.socketId);
    void this.ms.persistLeave(params.room, ws.userId);
    this.realtime.broadcastToRoom(params.room, {
      type: 'user-left',
      room: params.room,
      members,
    });
    this.realtime.broadcastAll({
      type: 'room-counts',
      rooms: this.ms.getRoomCounts(),
    });
  }

  private handleTypingStart(ws: AuthWs, data: { recipientId: string }) {
    if (!ws.userId) return;
    this.realtime.emitToPage(data.recipientId, 'messages', {
      type: 'typing-start',
      senderId: ws.userId,
    });
  }

  private handleTypingStop(ws: AuthWs, data: { recipientId: string }) {
    if (!ws.userId) return;
    this.realtime.emitToPage(data.recipientId, 'messages', {
      type: 'typing-stop',
      senderId: ws.userId,
    });
  }
}
