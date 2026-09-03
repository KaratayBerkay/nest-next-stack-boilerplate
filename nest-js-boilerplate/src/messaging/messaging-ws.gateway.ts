import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { WebSocket } from 'ws';
import { PrismaService } from '../prisma/prisma.service';
import {
  MessagingService,
  isValidRoom,
  hasRoomTierAccess,
} from './messaging.service';
import type { RoomMember } from './messaging.types';
import { initials, type MessageAttachment } from './messaging.types';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { AuthWs as RealtimeAuthWs } from '../realtime/realtime.types';
import { MAX_ENVELOPE_JSON_BYTES } from './dto/envelope-size.constraint';
import { MessageAttachmentDto } from './dto/send-message-rest.dto';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { WireCryptoService } from '../wire-crypto/wire-crypto.service';

type AuthWs = WebSocket & {
  userId?: string;
  sessionId?: string;
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
  tempId?: string;
  attachments?: MessageAttachment[];
  envelope?: Record<string, unknown>;
  replyToId?: string;
}

function toAttachments(data: IncomingMessagePayload): MessageAttachment[] {
  return Array.isArray(data.attachments) ? data.attachments : [];
}

/** Same ceiling the multi-file composer enforces client-side. */
const MAX_WS_ATTACHMENTS = 10;

/**
 * WS frames skip the REST/GraphQL DTO pipeline, so `attachments[]` used to be
 * persisted and broadcast exactly as sent — a crafted `url` (not a URL at
 * all) then blew up every recipient's render (`new URL(url)` in the web
 * AttachmentPreview). Validate each entry against the very same
 * MessageAttachmentDto the REST path uses, and keep only the fields that DTO
 * declares (size/thumbnailUrl are resolved server-side from PendingUpload,
 * never trusted from the wire). Returns null when the payload is invalid.
 */
export function validateWsAttachments(
  raw: unknown,
): MessageAttachment[] | null {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.length > MAX_WS_ATTACHMENTS) return null;
  const out: MessageAttachment[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') return null;
    const dto = plainToInstance(MessageAttachmentDto, entry, {
      // Only declared DTO properties survive — anything else on the wire
      // (or a smuggled `size`/`thumbnailUrl`) is dropped, not persisted.
      excludeExtraneousValues: false,
    });
    if (validateSync(dto, { whitelist: true }).length > 0) return null;
    out.push({
      url: dto.url,
      type: dto.type,
      name: dto.name,
      ...(dto.storageEnvelope ? { storageEnvelope: dto.storageEnvelope } : {}),
    });
  }
  return out;
}

function hasTextOrAttachmentOrEnvelope(data: IncomingMessagePayload): boolean {
  if (data.envelope && typeof data.envelope === 'object') return true;
  return Boolean((data.text ?? '').trim()) || toAttachments(data).length > 0;
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

@Injectable()
export class MessagingWsGateway implements OnModuleInit {
  private readonly logger = new Logger(MessagingWsGateway.name);

  constructor(
    private readonly realtime: RealtimeGateway,
    private readonly prisma: PrismaService,
    private readonly ms: MessagingService,
    private readonly wireCrypto: WireCryptoService,
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
    const attachments = validateWsAttachments(data.attachments);
    if (!attachments) {
      ws.send(
        JSON.stringify({ type: 'error', message: 'invalid attachments' }),
      );
      return;
    }

    // Data is already decrypted by the gateway's centralized handleMessage.
    const plaintext: { text?: string; attachments?: unknown } = {
      text: data.text,
      attachments,
    };

    // Client-provided E2EE envelope is flattened into v/ct/nonce columns;
    // when absent the service encrypts the plaintext for at-rest storage
    // itself (never plaintext).
    const storageEnvelope =
      data.envelope && typeof data.envelope === 'object'
        ? data.envelope
        : undefined;

    const message = await this.ms.sendMessage(
      ws.userId,
      data.recipientId,
      plaintext.text ?? '',
      undefined,
      attachments,
      storageEnvelope,
      data.replyToId,
    );
    // Echo the client tempId back in the wire payloads so the sender's
    // optimistic entry can be replaced (mirrors sendAndDeliverMessage's
    // _tempId stamp for the REST path).
    if (data.tempId) {
      (message as Record<string, unknown>)._tempId = data.tempId;
    }
    const delivery = await this.ms.deliverDirectMessage(message, plaintext);

    // Per-connection encrypted emit to EVERY socket of the recipient and
    // sender (all devices), regardless of which page each socket is on.
    await this.realtime.emitToUserEncrypted(
      message.recipientId,
      delivery.recipientPayload,
    );
    await this.realtime.emitToUserEncrypted(
      message.senderId,
      delivery.senderPayload,
    );
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
    if (!hasRoomTierAccess(room, ws.tier)) {
      return 'VIP rooms require MEDIUM tier or above';
    }
    return null;
  }

  // Leaves+broadcasts the previously-joined room, if any and different.
  private leavePreviousRoom(ws: AuthWs, nextRoom: string): void {
    if (!ws.room || ws.room === nextRoom || !ws.socketId) return;
    const oldMembers = this.ms.leaveRoom(ws.room, ws.socketId);
    this.realtime.leaveRoomSocket(ws.room, ws.socketId);
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
    // persistJoin runs a bare prisma.$transaction with nothing downstream to
    // catch a rejection — this app has no process-level
    // unhandledRejection/uncaughtException handler, and Node's default for
    // an unhandled rejection is to crash the whole process. Room join/leave
    // fires on every chat-room page navigation (one of the hottest paths in
    // the app), so a single transient Postgres hiccup here previously risked
    // taking down the backend for every connected user, not just this one.
    this.ms.persistJoin(data.room, ws.userId).catch((err: Error) => {
      this.logger.error(
        `persistJoin failed for room=${data.room} userId=${ws.userId}: ${err.message}`,
      );
    });
    this.realtime.registerRoomSocket(
      data.room,
      ws as unknown as RealtimeAuthWs,
    );
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
    this.realtime.leaveRoomSocket(data.room, ws.socketId);
    this.ms.persistLeave(data.room, ws.userId).catch((err: Error) => {
      this.logger.error(
        `persistLeave failed for room=${data.room} userId=${ws.userId}: ${err.message}`,
      );
    });
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
    if (!hasRoomTierAccess(data.room, ws.tier)) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'VIP rooms require MEDIUM tier or above',
        }),
      );
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
    const attachments = validateWsAttachments(data.attachments);
    if (!attachments) {
      ws.send(
        JSON.stringify({ type: 'error', message: 'invalid attachments' }),
      );
      return;
    }

    // Data is already decrypted by the gateway's centralized handleMessage.
    const plaintext: { text?: string; attachments?: unknown } = {
      text: data.text,
      attachments,
    };

    // Client-provided E2EE envelope is flattened into v/ct/nonce columns;
    // when absent the service encrypts the plaintext with the shared room
    // key itself (never plaintext).
    const storageEnvelope =
      data.envelope && typeof data.envelope === 'object'
        ? data.envelope
        : undefined;

    const saved = await this.ms.saveRoomMessage(
      data.room,
      ws.userId,
      ws.tier,
      plaintext.text ?? '',
      attachments,
      storageEnvelope,
    );

    // Broadcast per-connection encrypted to all room members.
    const senderName =
      (ws.useNickname && ws.chatNickname) || ws.userName || 'Unknown';
    const buildPayload = (): Record<string, unknown> => ({
      type: 'room-message',
      room: data.room,
      message: {
        id: saved.id,
        senderId: saved.senderId,
        senderName,
        avatar: initials(senderName),
        body: plaintext.text ?? null,
        attachments: saved.attachments ?? [],
        createdAt: saved.createdAt.toISOString(),
      },
      ...(data.tempId ? { tempId: data.tempId } : {}),
    });

    // For room messages, encrypt per room-member connection. One Redis
    // fan-out (vs. one publish per member): each replica encrypts and
    // delivers to its own sockets joined to `data.room`.
    const basePayload = buildPayload();
    await this.realtime.emitToRoomEncrypted(data.room, basePayload);
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
    this.ms.persistJoin(room, ws.userId).catch((err: Error) => {
      this.logger.error(
        `persistJoin failed for room=${room} userId=${ws.userId}: ${err.message}`,
      );
    });
    this.realtime.registerRoomSocket(room, ws as unknown as RealtimeAuthWs);
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
    this.realtime.leaveRoomSocket(params.room, ws.socketId);
    this.ms.persistLeave(params.room, ws.userId).catch((err: Error) => {
      this.logger.error(
        `persistLeave failed for room=${params.room} userId=${ws.userId}: ${err.message}`,
      );
    });
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
