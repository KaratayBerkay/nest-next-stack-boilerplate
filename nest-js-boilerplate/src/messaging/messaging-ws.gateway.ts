import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { WebSocket } from 'ws';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingService, RoomMember } from './messaging.service';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

type AuthWs = WebSocket & {
  userId?: string;
  userName?: string;
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
    this.realtime.emitToUser(data.recipientId, {
      type: 'direct-message',
      message,
    });
    this.realtime.emitToUser(message.senderId, {
      type: 'direct-message',
      message,
    });
    const sender = message.sender as
      | { id?: string; name?: string | null; email?: string; avatar?: string }
      | undefined;
    this.realtime.emitToService(data.recipientId, 'MESSAGE', {
      renew: 'Messages',
      type: 'Conversation',
      conversation: {
        user: {
          id: ws.userId,
          name: ws.userName || 'Unknown',
          avatar: sender?.avatar ?? '',
        },
        lastMessage: message.body,
        lastTime: message.createdAt,
        unread: 1,
      },
    });
    if (!this.realtime.hasServiceConnection(data.recipientId, 'MESSAGE')) {
      const sender = message.sender as
        | { name?: string | null; email?: string }
        | undefined;
      const senderName = sender?.name || sender?.email || 'Someone';
      const body = typeof message.body === 'string' ? message.body : '';
      this.push
        .sendToUser(
          data.recipientId,
          `New message from ${senderName}`,
          body.length > 120 ? body.slice(0, 117) + '...' : body,
          undefined,
          { kind: 'direct-message', senderId: message.senderId },
        )
        .catch((err: Error) =>
          this.logger.warn(`Offline push failed: ${err.message}`),
        );
    }
  }

  private async handleDeliveredAck(ws: AuthWs, data: { messageId: string }) {
    if (!ws.userId) return;
    const deliveredAt = new Date();
    await this.prisma.message.update({
      where: { id: data.messageId },
      data: { deliveredAt },
    });
    const message = await this.prisma.message.findUnique({
      where: { id: data.messageId },
      select: { senderId: true },
    });
    if (message) {
      this.realtime.emitToUser(message.senderId, {
        type: 'message-delivered',
        userId: message.senderId,
        messageId: data.messageId,
        deliveredAt: deliveredAt.toISOString(),
      });
    }
  }

  private handleJoinRoom(ws: AuthWs, data: { room: string }) {
    if (!ws.userId || !ws.socketId) return;
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
      name: ws.userName || 'Unknown',
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
        senderName: ws.userName || 'Unknown',
        avatar: this.ms.initials(ws.userName || 'Unknown'),
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
}
