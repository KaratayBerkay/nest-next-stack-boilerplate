import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingService, RoomMember } from './messaging.service';

type AuthWs = WebSocket & {
  userId?: string;
  userName?: string;
  socketId?: string;
  room?: string;
  authenticated: boolean;
  isAlive: boolean;
};

@Injectable()
export class MessagingWsGateway implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MessagingWsGateway.name);
  private wss!: WebSocketServer;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private onlineCount = new Map<string, number>();

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly ms: MessagingService,
  ) {}

  onModuleInit() {
    const port = parseInt(process.env.MSG_WS_PORT || '3003', 10);
    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
      const authWs = ws as AuthWs;
      authWs.authenticated = false;
      authWs.isAlive = true;

      ws.on('pong', () => {
        authWs.isAlive = true;
      });

      /* authenticate via first message — no token in URL */
      let authTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
        if (!authWs.authenticated) {
          this.logger.warn('WS auth timeout, closing');
          ws.close();
        }
      }, 120_000);

      ws.on('message', (raw: Buffer) => {
        try {
          const data = JSON.parse(raw.toString()) as Record<string, unknown>;

          /* handle auth message */
          if (!authWs.authenticated) {
            if (data.type === 'auth' && data.token) {
              this.jwt
                .verifyAsync<{ sub: string }>(data.token as string)
                .then(async (payload) => {
                  authWs.userId = payload.sub;
                  authWs.socketId =
                    payload.sub +
                    ':' +
                    Date.now().toString(36) +
                    Math.random().toString(36).slice(2, 7);
                  const user = await this.prisma.user.findUnique({
                    where: { id: payload.sub },
                  });
                  authWs.userName = user?.name || user?.email || 'Unknown';
                  authWs.authenticated = true;
                  if (authTimer) {
                    clearTimeout(authTimer);
                    authTimer = null;
                  }
                  ws.send(JSON.stringify({ type: 'authenticated' }));

                  const prev = this.onlineCount.get(payload.sub) || 0;
                  this.onlineCount.set(payload.sub, prev + 1);
                  if (prev === 0) {
                    this.broadcastAll({
                      type: 'user-online',
                      user: {
                        id: payload.sub,
                        name: authWs.userName,
                        avatar: this.ms.initials(authWs.userName),
                      },
                    });
                  }
                  // Send current online users to the newly connected client
                  const onlineUsers = Array.from(this.onlineCount.keys())
                    .filter((id) => id !== payload.sub)
                    .map((id) => ({ id }));
                  ws.send(
                    JSON.stringify({
                      type: 'online-users',
                      users: onlineUsers,
                    }),
                  );
                })
                .catch(() => {
                  ws.send(
                    JSON.stringify({
                      type: 'error',
                      message: 'Authentication failed',
                    }),
                  );
                  ws.close();
                });
            } else {
              ws.send(
                JSON.stringify({
                  type: 'error',
                  message: 'Authenticate first',
                }),
              );
              ws.close();
            }
            return;
          }

          switch (data.type as string) {
            case 'direct-message':
              this.handleDirectMessage(
                authWs,
                data as { recipientId: string; text: string },
              );
              break;
            case 'delivered-ack':
              this.handleDeliveredAck(authWs, data as { messageId: string });
              break;
            case 'join-room':
              this.handleJoinRoom(authWs, data as { room: string });
              break;
            case 'leave-room':
              this.handleLeaveRoom(authWs, data as { room: string });
              break;
            case 'room-message':
              this.handleRoomMessage(
                authWs,
                data as { room: string; text: string; tempId?: string },
              );
              break;
            case 'get-room-counts':
              this.handleGetRoomCounts(authWs);
              break;
          }
        } catch {
          // ignore parse errors
        }
      });

      ws.on('close', () => {
        const uid = authWs.userId;
        const sid = authWs.socketId;
        if (sid) {
          const affectedRooms = this.ms.leaveAllRooms(sid);
          for (const room of affectedRooms) {
            this.broadcastToRoom(room, {
              type: 'user-left',
              room,
              members: this.ms.getRoomMembers(room),
            });
          }
        }
        if (uid) {
          const prev = this.onlineCount.get(uid) || 1;
          if (prev <= 1) {
            this.onlineCount.delete(uid);
            this.broadcastAll({ type: 'user-offline', userId: uid });
          } else {
            this.onlineCount.set(uid, prev - 1);
          }
        }
        this.broadcastRoomCounts();
      });
    });

    this.heartbeatTimer = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const client = ws as AuthWs;
        if (client.isAlive === false) {
          ws.terminate();
          return;
        }
        client.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  onModuleDestroy() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.wss?.close();
  }

  /** Broadcast a saved DM to the recipient and sender (for multi-tab support). */
  broadcastDirectMessage(
    recipientId: string,
    message: { senderId: string; [key: string]: unknown },
  ) {
    const msg = JSON.stringify({ type: 'direct-message', message });
    this.wss.clients.forEach((c) => {
      const client = c as AuthWs;
      if (
        (client.userId === recipientId || client.userId === message.senderId) &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(msg);
      }
    });
  }

  /** Notify the reader and sender that messages were read (multi-tab support). */
  broadcastMessageRead(readerId: string, senderId: string, readAt: string) {
    const msg = JSON.stringify({
      type: 'message-read',
      readerId,
      senderId,
      readAt,
    });
    this.wss.clients.forEach((c) => {
      const client = c as AuthWs;
      if (
        (client.userId === readerId || client.userId === senderId) &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(msg);
      }
    });
  }

  /** Notify the sender that a message was delivered to the recipient. */
  broadcastMessageDelivered(
    senderId: string,
    messageId: string,
    deliveredAt: string,
  ) {
    const msg = JSON.stringify({
      type: 'message-delivered',
      userId: senderId,
      messageId,
      deliveredAt,
    });
    this.wss.clients.forEach((c) => {
      const client = c as AuthWs;
      if (client.userId === senderId && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }

  private async handleDirectMessage(
    ws: AuthWs,
    data: { recipientId: string; text: string },
  ) {
    if (!ws.userId) return;
    this.logger.log(
      `WS direct-message from ${ws.userId} to ${data.recipientId}`,
    );
    const message = await this.ms.sendMessage(
      ws.userId,
      data.recipientId,
      data.text,
    );
    this.broadcastDirectMessage(data.recipientId, message);
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
      this.broadcastMessageDelivered(
        message.senderId,
        data.messageId,
        deliveredAt.toISOString(),
      );
    }
  }

  private handleGetRoomCounts(ws: AuthWs) {
    ws.send(
      JSON.stringify({ type: 'room-counts', rooms: this.ms.getRoomCounts() }),
    );
  }

  private handleJoinRoom(ws: AuthWs, data: { room: string }) {
    if (!ws.userId || !ws.socketId) return;
    // Leave previous room first so user doesn't linger in old room
    if (ws.room && ws.room !== data.room) {
      const oldMembers = this.ms.leaveRoom(ws.room, ws.socketId);
      this.broadcastToRoom(ws.room, {
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
    this.broadcastToRoom(data.room, {
      type: 'user-joined',
      room: data.room,
      user: member,
      members,
    });
    this.broadcastRoomCounts();
  }

  private handleLeaveRoom(ws: AuthWs, data: { room: string }) {
    if (!ws.userId || !ws.socketId) return;
    ws.room = undefined;
    const members = this.ms.leaveRoom(data.room, ws.socketId);
    this.broadcastToRoom(data.room, {
      type: 'user-left',
      room: data.room,
      members,
    });
    this.broadcastRoomCounts();
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
    this.broadcastToRoom(data.room, payload);
  }

  private broadcastToRoom(room: string, payload: Record<string, unknown>) {
    const msg = JSON.stringify(payload);
    this.wss.clients.forEach((c) => {
      const client = c as AuthWs;
      if (client.room === room && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }

  private broadcastAll(payload: Record<string, unknown>) {
    const msg = JSON.stringify(payload);
    this.wss.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN) c.send(msg);
    });
  }

  private broadcastRoomCounts() {
    this.broadcastAll({ type: 'room-counts', rooms: this.ms.getRoomCounts() });
  }
}
