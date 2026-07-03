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
import { TokenStoreService } from '../auth/token-store.service';
import { TokenDerivationService } from '../auth/token-derivation.service';
import { CryptoService } from '../common/crypto/crypto.service';

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

interface AuthTokens {
  accessToken: string;
  rbacToken: string;
  deviceToken: string;
  userToken: string;
}

export type FrameHandler = (
  ws: WebSocket,
  data: Record<string, unknown>,
) => void | Promise<void>;

const TOPIC_ALLOWLIST = /^(feed|post:[a-z0-9]+)$/;

@Injectable()
export class RealtimeGateway implements OnModuleInit, OnModuleDestroy {
  private static readonly MAX_SOCKETS_PER_USER = 20;
  private static readonly MAX_PENDING_PER_IP = 50;
  private static readonly AUTH_TIMEOUT_MS = 15_000;

  private readonly logger = new Logger(RealtimeGateway.name);
  private wss!: WebSocketServer;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private onlineCount = new Map<string, number>();
  private serviceConnections = new Map<string, Set<WebSocket>>();
  private serviceDeviceIndex = new Map<string, Set<string>>();
  private userSockets = new Map<string, Set<AuthWs>>();
  private pendingByIp = new Map<string, number>();
  private topicWatchers = new Map<string, Set<AuthWs>>();
  private handlers = new Map<string, FrameHandler>();

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly jwt: JwtService,
    private readonly tokenStore: TokenStoreService,
    private readonly derivation: TokenDerivationService,
    private readonly crypto: CryptoService,
  ) {}

  onModuleInit() {
    const httpServer = this.adapterHost.httpAdapter.getHttpServer() as Server;
    this.wss = new WebSocketServer({ server: httpServer, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const authWs = ws as AuthWs;
      authWs.authenticated = false;
      authWs.isAlive = true;

      const ip = this.clientIp(req);
      const pending = this.pendingByIp.get(ip) || 0;
      if (pending >= RealtimeGateway.MAX_PENDING_PER_IP) {
        this.logger.warn(`WS pending-connection limit for ${ip}, closing`);
        ws.close(1013, 'Too many pending connections');
        return;
      }
      authWs.pendingIp = ip;
      this.pendingByIp.set(ip, pending + 1);

      ws.on('pong', () => {
        authWs.isAlive = true;
      });

      const authTimer: ReturnType<typeof setTimeout> = setTimeout(() => {
        if (!authWs.authenticated) {
          this.logger.warn('WS auth timeout, closing');
          ws.close();
        }
      }, RealtimeGateway.AUTH_TIMEOUT_MS);

      ws.on('message', (raw: Buffer) => {
        this.handleMessage(authWs, raw, authTimer).catch((err) =>
          this.logger.error('WS message handler error', err),
        );
      });

      ws.on('close', () => {
        this.releasePending(authWs);
        this.cleanupServiceConnections(authWs);
        this.cleanupTopicWatches(authWs);
        const uid = authWs.userId;
        if (uid) {
          const sockets = this.userSockets.get(uid);
          if (sockets) {
            sockets.delete(authWs);
            if (sockets.size === 0) this.userSockets.delete(uid);
          }
          const prev = this.onlineCount.get(uid) || 1;
          if (prev <= 1) {
            this.onlineCount.delete(uid);
            this.broadcastAll({ type: 'user-offline', userId: uid });
          } else {
            this.onlineCount.set(uid, prev - 1);
          }
        }
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

  registerHandler(type: string, handler: FrameHandler): void {
    if (this.handlers.has(type)) {
      throw new Error(`Handler for frame type "${type}" is already registered`);
    }
    this.handlers.set(type, handler);
  }

  private async handleMessage(
    authWs: AuthWs,
    raw: Buffer,
    authTimer: ReturnType<typeof setTimeout>,
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
      await this.handleAuth(authWs, data.tokens as AuthTokens, authTimer);
      return;
    }

    if (data.type === 'register') {
      this.handleRegister(authWs, data as { services: string[] });
      return;
    }

    if (data.type === 'watch') {
      this.handleWatch(authWs, data as { topic: string });
      return;
    }

    if (data.type === 'unwatch') {
      this.handleUnwatch(authWs, data as { topic: string });
      return;
    }

    const handler = this.handlers.get(data.type as string);
    if (handler) {
      await handler(authWs, data);
    }
  }

  private async handleAuth(
    ws: AuthWs,
    tokens: AuthTokens,
    authTimer: ReturnType<typeof setTimeout>,
  ): Promise<void> {
    let payload: { sub: string };
    try {
      payload = this.jwt.verify<{ sub: string }>(tokens.accessToken);
    } catch {
      ws.send(JSON.stringify({ type: 'error', message: 'Auth failed' }));
      ws.close();
      return;
    }

    const expectedUserToken = this.derivation.deriveUserToken(payload.sub);
    if (!this.crypto.timingSafeEqual(tokens.userToken, expectedUserToken)) {
      ws.send(JSON.stringify({ type: 'error', message: 'Auth failed' }));
      ws.close();
      return;
    }

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
      ws.send(JSON.stringify({ type: 'error', message: 'Auth failed' }));
      ws.close();
      return;
    }

    const expectedRbac = this.derivation.deriveRbacToken(
      hash.userId,
      hash.tier || 'FREE',
    );
    if (!this.crypto.timingSafeEqual(tokens.rbacToken, expectedRbac)) {
      ws.send(JSON.stringify({ type: 'error', message: 'Auth failed' }));
      ws.close();
      return;
    }

    ws.userId = hash.userId;
    ws.userName = hash.name || hash.email || 'Unknown';
    ws.deviceTokenHash = crypto
      .createHash('sha256')
      .update(tokens.deviceToken)
      .digest('hex');
    ws.userToken = this.derivation.deriveUserToken(hash.userId);
    ws.registeredServices = [];
    ws.watchedTopics = [];
    ws.socketId =
      hash.userId +
      ':' +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 7);
    ws.authenticated = true;
    this.releasePending(ws);
    clearTimeout(authTimer);

    let sockets = this.userSockets.get(hash.userId);
    if (!sockets) {
      sockets = new Set<AuthWs>();
      this.userSockets.set(hash.userId, sockets);
    }
    sockets.add(ws);
    while (sockets.size > RealtimeGateway.MAX_SOCKETS_PER_USER) {
      const oldest: AuthWs = sockets.values().next().value!;
      sockets.delete(oldest);
      this.logger.warn(
        `WS per-user connection limit for ${hash.userId}, closing oldest`,
      );
      oldest.close(1013, 'Connection limit reached');
    }

    ws.send(JSON.stringify({ type: 'authenticated' }));
    this.handleOnline(ws);
  }

  private handleRegister(ws: AuthWs, data: { services: string[] }) {
    if (!Array.isArray(data.services) || !ws.userId || !ws.deviceTokenHash)
      return;
    for (const svc of data.services) {
      if (ws.registeredServices?.includes(svc)) continue;
      ws.registeredServices?.push(svc);
      const key = `${svc}:${ws.userId}:${ws.deviceTokenHash}`;
      const indexKey = `${svc}:${ws.userId}`;
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

  private handleWatch(ws: AuthWs, data: { topic: string }) {
    if (!ws.userId) return;
    if (!TOPIC_ALLOWLIST.test(data.topic)) {
      ws.send(
        JSON.stringify({ type: 'error', message: 'Invalid topic pattern' }),
      );
      return;
    }
    if (!this.topicWatchers.has(data.topic))
      this.topicWatchers.set(data.topic, new Set());
    this.topicWatchers.get(data.topic)!.add(ws);
    if (!ws.watchedTopics) ws.watchedTopics = [];
    if (!ws.watchedTopics.includes(data.topic))
      ws.watchedTopics.push(data.topic);
  }

  private handleUnwatch(ws: AuthWs, data: { topic: string }) {
    if (!ws.userId) return;
    const watchers = this.topicWatchers.get(data.topic);
    if (watchers) {
      watchers.delete(ws);
      if (watchers.size === 0) this.topicWatchers.delete(data.topic);
    }
    if (ws.watchedTopics) {
      ws.watchedTopics = ws.watchedTopics.filter((t) => t !== data.topic);
    }
  }

  private handleOnline(ws: AuthWs) {
    const prev = this.onlineCount.get(ws.userId!) || 0;
    this.onlineCount.set(ws.userId!, prev + 1);
    if (prev === 0) {
      this.broadcastAll({
        type: 'user-online',
        user: { id: ws.userId, name: ws.userName },
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

  private cleanupServiceConnections(ws: AuthWs) {
    const svcs = ws.registeredServices;
    const uid = ws.userId;
    const dth = ws.deviceTokenHash;
    if (!svcs || !uid || !dth) return;
    for (const svc of svcs) {
      const key = `${svc}:${uid}:${dth}`;
      const indexKey = `${svc}:${uid}`;
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

  private cleanupTopicWatches(ws: AuthWs) {
    const topics = ws.watchedTopics;
    if (!topics) return;
    for (const topic of topics) {
      const watchers = this.topicWatchers.get(topic);
      if (watchers) {
        watchers.delete(ws);
        if (watchers.size === 0) this.topicWatchers.delete(topic);
      }
    }
  }

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

  private releasePending(ws: AuthWs) {
    const ip = ws.pendingIp;
    if (!ip) return;
    ws.pendingIp = undefined;
    const count = this.pendingByIp.get(ip) || 0;
    if (count <= 1) this.pendingByIp.delete(ip);
    else this.pendingByIp.set(ip, count - 1);
  }

  // ==================== Emit primitives ====================

  emitToUser(userId: string, frame: Record<string, unknown>): number {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return 0;
    const msg = JSON.stringify(frame);
    let sent = 0;
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
        sent++;
      }
    }
    return sent;
  }

  emitToService(
    userId: string,
    service: string,
    frame: Record<string, unknown>,
  ): number {
    const indexKey = `${service}:${userId}`;
    const deviceHashes = this.serviceDeviceIndex.get(indexKey);
    let sent = 0;
    if (deviceHashes) {
      const msg = JSON.stringify(frame);
      for (const deviceHash of deviceHashes) {
        const key = `${service}:${userId}:${deviceHash}`;
        const conns = this.serviceConnections.get(key);
        if (conns) {
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

  emitToTopic(topic: string, frame: Record<string, unknown>): number {
    const watchers = this.topicWatchers.get(topic);
    if (!watchers) return 0;
    const msg = JSON.stringify(frame);
    let sent = 0;
    for (const ws of watchers) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
        sent++;
      }
    }
    return sent;
  }

  hasServiceConnection(userId: string, service: string): boolean {
    const devices = this.serviceDeviceIndex.get(`${service}:${userId}`);
    return !!devices && devices.size > 0;
  }

  broadcastAll(frame: Record<string, unknown>): void {
    const msg = JSON.stringify(frame);
    this.wss.clients.forEach((c) => {
      if (c.readyState === WebSocket.OPEN) c.send(msg);
    });
  }

  broadcastToRoom(room: string, payload: Record<string, unknown>): void {
    const msg = JSON.stringify(payload);
    this.wss.clients.forEach((c) => {
      const client = c as AuthWs;
      if (client.room === room && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }

  getOnlineUserIds(): string[] {
    return Array.from(this.onlineCount.keys());
  }
}
