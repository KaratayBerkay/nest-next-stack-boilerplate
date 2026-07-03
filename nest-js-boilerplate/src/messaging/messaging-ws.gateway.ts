import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { IncomingMessage } from 'http';
import crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingService, RoomMember } from './messaging.service';
import { TokenStoreService } from '../auth/token-store.service';
import { TokenDerivationService } from '../auth/token-derivation.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { PushNotificationService } from '../push-notification/push-notification.service';

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
  /** Set while the connection counts against the per-IP unauthenticated cap. */
  pendingIp?: string;
};

interface AuthTokens {
  accessToken: string;
  rbacToken: string;
  deviceToken: string;
  userToken: string;
}

@Injectable()
export class MessagingWsGateway implements OnModuleInit, OnModuleDestroy {
  /** Max authenticated sockets per user — above this the oldest is closed. */
  private static readonly MAX_SOCKETS_PER_USER = 20;
  /**
   * Max concurrent unauthenticated (auth-pending) sockets per client IP.
   * NOTE: if the reverse proxy does not send X-Forwarded-For on the /ws
   * location, all proxied clients share the proxy's address and this acts as
   * a GLOBAL pending cap — keep it high enough for mass-reconnect bursts
   * (deploy restarts), low enough to bound connection parking (slots
   * self-clear via the auth timeout).
   */
  private static readonly MAX_PENDING_PER_IP = 50;
  /** Unauthenticated sockets are closed after this window. */
  private static readonly AUTH_TIMEOUT_MS = 15_000;

  private readonly logger = new Logger(MessagingWsGateway.name);
  private wss!: WebSocketServer;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private onlineCount = new Map<string, number>();
  // "SERVICE:userToken:deviceHash" → Set<WebSocket>
  private serviceConnections = new Map<string, Set<WebSocket>>();
  // "SERVICE:userToken" → Set<deviceHash>
  private serviceDeviceIndex = new Map<string, Set<string>>();
  // userId → Set<AuthWs> in insertion order (oldest first) for the per-user cap
  private userSockets = new Map<string, Set<AuthWs>>();
  // client IP → count of auth-pending sockets
  private pendingByIp = new Map<string, number>();

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly ms: MessagingService,
    private readonly tokenStore: TokenStoreService,
    private readonly derivation: TokenDerivationService,
    private readonly crypto: CryptoService,
    private readonly push: PushNotificationService,
  ) {}

  onModuleInit() {
    const httpServer = this.adapterHost.httpAdapter.getHttpServer() as Server;
    this.wss = new WebSocketServer({ server: httpServer, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const authWs = ws as AuthWs;
      authWs.authenticated = false;
      authWs.isAlive = true;

      // Cap concurrent auth-pending sockets per client IP: real clients
      // authenticate within ~1s, so this only stops connection parking.
      const ip = this.clientIp(req);
      const pending = this.pendingByIp.get(ip) || 0;
      if (pending >= MessagingWsGateway.MAX_PENDING_PER_IP) {
        this.logger.warn(`WS pending-connection limit for ${ip}, closing`);
        ws.close(1013, 'Too many pending connections');
        return;
      }
      authWs.pendingIp = ip;
      this.pendingByIp.set(ip, pending + 1);

      ws.on('pong', () => {
        authWs.isAlive = true;
      });

      const authTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
        if (!authWs.authenticated) {
          this.logger.warn('WS auth timeout, closing');
          ws.close();
        }
      }, MessagingWsGateway.AUTH_TIMEOUT_MS);

      ws.on('message', (raw: Buffer) => {
        this.handleMessage(authWs, raw, authTimer).catch((err) =>
          this.logger.error('WS message handler error', err),
        );
      });

      ws.on('close', () => {
        const uid = authWs.userId;
        const sid = authWs.socketId;
        this.releasePending(authWs);
        if (uid) {
          const sockets = this.userSockets.get(uid);
          if (sockets) {
            sockets.delete(authWs);
            if (sockets.size === 0) this.userSockets.delete(uid);
          }
        }
        // Clean up service-tagged connections
        this.cleanupServiceConnections(authWs);
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

  private async handleMessage(
    authWs: AuthWs,
    raw: Buffer,
    authTimer: ReturnType<typeof setTimeout> | null,
  ): Promise<void> {
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(raw.toString()) as Record<string, unknown>;
    } catch {
      return;
    }

    if (!authWs.authenticated) {
      if (data.type !== 'auth' || !data.tokens) {
        authWs.send(
          JSON.stringify({ type: 'error', message: 'Authenticate first' }),
        );
        authWs.close();
        return;
      }
      const tokens = data.tokens as AuthTokens;
      // Ordered checks mirroring SessionAuthGuard + validateSession in messaging-server.mjs

      // 1. Verify JWT — extract the payload (no I/O, delegate to JwtService).
      let payload: { sub: string };
      try {
        payload = this.jwt.verify<{ sub: string }>(tokens.accessToken);
      } catch {
        authWs.send(JSON.stringify({ type: 'error', message: 'Auth failed' }));
        authWs.close();
        return;
      }

      // 2. Recompute today's userToken and timing-safe compare.
      const expectedUserToken = this.derivation.deriveUserToken(payload.sub);
      if (!this.crypto.timingSafeEqual(tokens.userToken, expectedUserToken)) {
        authWs.send(JSON.stringify({ type: 'error', message: 'Auth failed' }));
        authWs.close();
        return;
      }

      // 3. Build compound key → HGETALL.
      const key = this.tokenStore.buildKey(
        tokens.accessToken,
        tokens.rbacToken,
        tokens.deviceToken,
        tokens.userToken,
      );
      let hash: Awaited<ReturnType<typeof this.tokenStore.read>> = null;
      try {
        hash = await this.tokenStore.read(key);
      } catch {
        /* Redis error */
      }
      if (!hash?.userId || hash.userId !== payload.sub) {
        authWs.send(JSON.stringify({ type: 'error', message: 'Auth failed' }));
        authWs.close();
        return;
      }

      // 4. Recompute rbacToken from hash.tier.
      const expectedRbac = this.derivation.deriveRbacToken(
        hash.userId,
        hash.tier || 'FREE',
      );
      if (!this.crypto.timingSafeEqual(tokens.rbacToken, expectedRbac)) {
        authWs.send(JSON.stringify({ type: 'error', message: 'Auth failed' }));
        authWs.close();
        return;
      }

      authWs.userId = hash.userId;
      authWs.userName = hash.name || hash.email || 'Unknown';
      authWs.deviceTokenHash = crypto
        .createHash('sha256')
        .update(tokens.deviceToken)
        .digest('hex');
      authWs.userToken = this.derivation.deriveUserToken(hash.userId);
      authWs.registeredServices = [];
      authWs.socketId =
        hash.userId +
        ':' +
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 7);
      authWs.authenticated = true;
      this.releasePending(authWs);
      if (authTimer) {
        clearTimeout(authTimer);
        authTimer = null;
      }

      // Per-user connection cap: register this socket, then close the oldest
      // ones above the limit (new devices/tabs always win over stale ones).
      let sockets = this.userSockets.get(hash.userId);
      if (!sockets) {
        sockets = new Set<AuthWs>();
        this.userSockets.set(hash.userId, sockets);
      }
      sockets.add(authWs);
      while (sockets.size > MessagingWsGateway.MAX_SOCKETS_PER_USER) {
        const oldest: AuthWs = sockets.values().next().value!;
        sockets.delete(oldest);
        this.logger.warn(
          `WS per-user connection limit for ${hash.userId}, closing oldest`,
        );
        oldest.close(1013, 'Connection limit reached');
      }

      authWs.send(JSON.stringify({ type: 'authenticated' }));
      this.handleOnline(authWs);
      return;
    }

    switch (data.type as string) {
      case 'direct-message':
        await this.handleDirectMessage(
          authWs,
          data as { recipientId: string; text: string },
        );
        break;
      case 'delivered-ack':
        await this.handleDeliveredAck(authWs, data as { messageId: string });
        break;
      case 'join-room':
        this.handleJoinRoom(authWs, data as { room: string });
        break;
      case 'leave-room':
        this.handleLeaveRoom(authWs, data as { room: string });
        break;
      case 'room-message':
        await this.handleRoomMessage(
          authWs,
          data as { room: string; text: string; tempId?: string },
        );
        break;
      case 'get-room-counts':
        this.handleGetRoomCounts(authWs);
        break;
      case 'register':
        this.handleRegister(authWs, data as { services: string[] });
        break;
    }
  }

  /**
   * Client IP for rate limiting. Behind the reverse proxy the socket address
   * is always the proxy, so prefer the LAST X-Forwarded-For entry — the one
   * appended by our own proxy and not forgeable by the client.
   */
  private clientIp(req: IncomingMessage): string {
    const xff = req.headers['x-forwarded-for'];
    const raw = Array.isArray(xff) ? xff[xff.length - 1] : xff;
    if (raw) {
      const parts = raw.split(',');
      const last = parts[parts.length - 1].trim();
      if (last) return last;
    }
    return req.socket.remoteAddress ?? 'unknown';
  }

  /** Release the per-IP auth-pending slot exactly once (auth success or close). */
  private releasePending(ws: AuthWs) {
    const ip = ws.pendingIp;
    if (!ip) return;
    ws.pendingIp = undefined;
    const count = this.pendingByIp.get(ip) || 0;
    if (count <= 1) this.pendingByIp.delete(ip);
    else this.pendingByIp.set(ip, count - 1);
  }

  private handleOnline(ws: AuthWs) {
    const prev = this.onlineCount.get(ws.userId!) || 0;
    this.onlineCount.set(ws.userId!, prev + 1);
    if (prev === 0) {
      this.broadcastAll({
        type: 'user-online',
        user: {
          id: ws.userId,
          name: ws.userName,
          avatar: this.ms.initials(ws.userName!),
        },
      });
    }
    const onlineUsers = Array.from(this.onlineCount.keys())
      .filter((id) => id !== ws.userId)
      .map((id) => ({ id }));
    ws.send(
      JSON.stringify({
        type: 'online-users',
        users: onlineUsers,
      }),
    );
  }

  onModuleDestroy() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.wss?.close();
  }

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
    // Recipient has no live MESSAGE-service connection on any device →
    // fall back to web push so the message isn't silently missed.
    const recipientToken = this.derivation.deriveUserToken(recipientId);
    if (!this.hasServiceConnection(recipientToken, 'MESSAGE')) {
      const sender = message.sender as
        | { name?: string | null; email?: string }
        | undefined;
      const senderName = sender?.name || sender?.email || 'Someone';
      const body = typeof message.body === 'string' ? message.body : '';
      this.push
        .sendToUser(
          recipientId,
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

  /** True when the user (by userToken) has at least one open connection registered for the service. */
  hasServiceConnection(userToken: string, service: string): boolean {
    const devices = this.serviceDeviceIndex.get(`${service}:${userToken}`);
    return !!devices && devices.size > 0;
  }

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

  private handleRegister(ws: AuthWs, data: { services: string[] }) {
    if (!Array.isArray(data.services) || !ws.userToken || !ws.deviceTokenHash)
      return;
    for (const svc of data.services) {
      if (ws.registeredServices?.includes(svc)) continue;
      ws.registeredServices?.push(svc);
      const key = `${svc}:${ws.userToken}:${ws.deviceTokenHash}`;
      const indexKey = `${svc}:${ws.userToken}`;
      if (!this.serviceConnections.has(key))
        this.serviceConnections.set(key, new Set());
      this.serviceConnections.get(key)!.add(ws);
      if (!this.serviceDeviceIndex.has(indexKey))
        this.serviceDeviceIndex.set(indexKey, new Set());
      this.serviceDeviceIndex.get(indexKey)!.add(ws.deviceTokenHash);
    }
    ws.send(
      JSON.stringify({
        type: 'registered',
        services: ws.registeredServices,
      }),
    );
  }

  private cleanupServiceConnections(ws: AuthWs) {
    const svcs = ws.registeredServices;
    const ut = ws.userToken;
    const dth = ws.deviceTokenHash;
    if (!svcs || !ut || !dth) return;
    for (const svc of svcs) {
      const key = `${svc}:${ut}:${dth}`;
      const indexKey = `${svc}:${ut}`;
      const conns = this.serviceConnections.get(key);
      if (conns) {
        conns.delete(ws);
        if (conns.size === 0) {
          this.serviceConnections.delete(key);
          const devices = this.serviceDeviceIndex.get(indexKey);
          if (devices) {
            devices.delete(dth);
            if (devices.size === 0) this.serviceDeviceIndex.delete(indexKey);
          }
        }
      }
    }
  }

  /**
   * Send a payload to all service-tagged connections for a given user (by userToken + service).
   * Returns the number of connections the message was sent to.
   */
  sendToService(
    userToken: string,
    service: string,
    payload: Record<string, unknown>,
  ): number {
    const indexKey = `${service}:${userToken}`;
    const deviceHashes = this.serviceDeviceIndex.get(indexKey);
    let sent = 0;
    if (deviceHashes) {
      for (const deviceHash of deviceHashes) {
        const key = `${service}:${userToken}:${deviceHash}`;
        const conns = this.serviceConnections.get(key);
        if (conns) {
          const msg = JSON.stringify(payload);
          for (const ws of conns) {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(msg);
              sent++;
            }
          }
        }
      }
    }
    return sent;
  }

  private handleJoinRoom(ws: AuthWs, data: { room: string }) {
    if (!ws.userId || !ws.socketId) return;
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
