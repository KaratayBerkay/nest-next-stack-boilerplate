import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { WebSocket } from 'ws';
import { PrismaService } from '../prisma/prisma.service';
import {
  MessagingService,
  RoomMember,
  isValidRoom,
  VIP_ROOM_PREFIX,
} from './messaging.service';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { displayName } from '../common/utils/display-name';
import { tierRank, MIN_TIER_FOR_VIP } from '../authorization/tier-rank';

type AuthWs = WebSocket & {
  userId?: string;
  userName?: string;
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
        data as unknown as { recipientId: string; text: string },
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
        data as unknown as { room: string; text: string; tempId?: string },
      ),
    );
    this.realtime.registerHandler('get-room-counts', (ws) =>
      this.handleGetRoomCounts(ws as AuthWs),
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
    data: { recipientId: string; text: string },
  ) {
    if (!ws.userId) return;
    const message = await this.ms.sendMessage(
      ws.userId,
      data.recipientId,
      data.text,
    );
    const sender = message.sender as
      | { id?: string; name?: string | null; email?: string; avatar?: string }
      | undefined;
    const unread = await this.ms.getUnreadCount(data.recipientId, ws.userId);
    // Chrome: Conversation renew to all recipient MESSAGE sockets
    this.realtime.emitToService(data.recipientId, 'MESSAGE', {
      renew: 'Messages',
      type: 'Conversation',
      conversation: {
        user: {
          id: ws.userId,
          name: ws.userName ?? 'Unknown',
          avatar: sender?.avatar ?? '',
        },
        lastMessage: message.body,
        lastTime: message.createdAt,
        unread: unread + 1,
      },
    });
    // DM unread aggregate to notification bell (T5).
    const totalDmUnread = await this.ms.getTotalUnreadCount(data.recipientId);
    this.realtime.emitToService(data.recipientId, 'NOTIFICATION', {
      renew: 'Notifications',
      type: 'DmCount',
      value: totalDmUnread,
    });
    // Page content: DM to messages-page viewers only
    this.realtime.emitToPage(data.recipientId, 'messages', {
      type: 'direct-message',
      message,
    });
    this.realtime.emitToPage(message.senderId, 'messages', {
      type: 'direct-message',
      message,
    });
    if (
      !this.realtime.hasServiceConnection(data.recipientId, 'MESSAGE') &&
      !this.realtime.hasServiceConnection(data.recipientId, 'NOTIFICATION')
    ) {
      const sender = message.sender as
        | { name?: string | null; email?: string }
        | undefined;
      const senderName = displayName(sender ?? {});
      const body = typeof message.body === 'string' ? message.body : '';
      this.push
        .sendToUser(
          data.recipientId,
          `New message from ${senderName}`,
          body.length > 120 ? body.slice(0, 117) + '...' : body,
          undefined,
          {
            kind: 'direct-message',
            senderId: message.senderId,
            dmCount: totalDmUnread,
          },
        )
        .catch((err: Error) =>
          this.logger.warn(`Offline push failed: ${err.message}`),
        );
    }
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

  private handleJoinRoom(ws: AuthWs, data: { room: string }) {
    if (!ws.userId || !ws.socketId) return;
    if (!isValidRoom(data.room)) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid room' }));
      return;
    }
    if (
      data.room.startsWith(VIP_ROOM_PREFIX) &&
      tierRank(ws.tier ?? 'FREE') < MIN_TIER_FOR_VIP
    ) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'VIP rooms require MEDIUM tier or above',
        }),
      );
      return;
    }
    if (ws.room && ws.room !== data.room) {
      const oldMembers = this.ms.leaveRoom(ws.room, ws.socketId);
      this.realtime.broadcastToRoom(ws.room, {
        type: 'user-left',
        room: ws.room,
        members: oldMembers,
      });
    }
    ws.room = data.room;
    const member: RoomMember = {
      socketId: ws.socketId,
      userId: ws.userId,
      name: ws.userName ?? 'Unknown',
    };
    const members = this.ms.joinRoom(data.room, member);
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
    data: { room: string; text: string; tempId?: string },
  ) {
    if (!ws.userId) return;
    if (!isValidRoom(data.room)) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid room' }));
      return;
    }
    const saved = await this.ms.saveRoomMessage(
      data.room,
      ws.userId,
      data.text,
    );
    const payload: Record<string, unknown> = {
      type: 'room-message',
      room: data.room,
      message: {
        id: saved.id,
        senderId: saved.senderId,
        senderName: ws.userName ?? 'Unknown',
        avatar: this.ms.initials(ws.userName ?? 'Unknown'),
        body: saved.body,
        createdAt: saved.createdAt.toISOString(),
      },
    };
    if (data.tempId) payload.tempId = data.tempId;
    this.realtime.broadcastToRoom(data.room, payload);
  }

  private handleGetRoomCounts(ws: AuthWs) {
    ws.send(
      JSON.stringify({
        type: 'room-counts',
        rooms: this.ms.getRoomCounts(),
      }),
    );
  }

  // Phase 7: page-claim room join/leave (chat-room claim translates to room join)

  private handleClaimJoinRoom(ws: AuthWs, params: Record<string, string>) {
    if (!ws.userId || !ws.socketId || !params.room) return;
    if (!isValidRoom(params.room)) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid room' }));
      return;
    }
    if (
      params.room.startsWith(VIP_ROOM_PREFIX) &&
      tierRank(ws.tier ?? 'FREE') < MIN_TIER_FOR_VIP
    ) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'VIP rooms require MEDIUM tier or above',
        }),
      );
      return;
    }
    const room = params.room;
    if (ws.room && ws.room !== room) {
      const oldMembers = this.ms.leaveRoom(ws.room, ws.socketId);
      this.realtime.broadcastToRoom(ws.room, {
        type: 'user-left',
        room: ws.room,
        members: oldMembers,
      });
    }
    ws.room = room;
    const member: RoomMember = {
      socketId: ws.socketId,
      userId: ws.userId,
      name: ws.userName ?? 'Unknown',
    };
    const members = this.ms.joinRoom(room, member);
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
}
