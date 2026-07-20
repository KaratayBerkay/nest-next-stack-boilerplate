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
import Redis from 'ioredis';
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT, REDIS_SUBSCRIBER } from '../redis/redis.module';
import { TokenStoreService } from '../auth/token-store.service';
import { TokenDerivationService } from '../auth/token-derivation.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { displayName } from '../common/utils/display-name';
import { parseDeviceType } from '../common/utils/device-type';
import type { ExceptionCode } from '../common/exceptions/exception-code';
import type { AuthWs, AuthTokens, FrameHandler } from './realtime.types';
import { RealtimePresenceService } from './realtime-presence.service';
import { RealtimePageManager } from './realtime-page.manager';

@Injectable()
export class RealtimeGateway implements OnModuleInit, OnModuleDestroy {
  private static readonly MAX_SOCKETS_PER_USER = 20;
  private static readonly MAX_PENDING_PER_IP = 50;
  private static readonly AUTH_TIMEOUT_MS = 15_000;
  private static readonly WS_CHANNEL = 'ws:broadcast';

  private readonly logger = new Logger(RealtimeGateway.name);
  private wss!: WebSocketServer;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private forwardingFromRedis = false;
  readonly onlineCount = new Map<string, number>();
  readonly pageManager = new RealtimePageManager();
  private serviceConnections = new Map<string, Set<WebSocket>>();
  private serviceDeviceIndex = new Map<string, Set<string>>();
  private userSockets = new Map<string, Set<AuthWs>>();
  private pendingByIp = new Map<string, number>();
  private handlers = new Map<string, FrameHandler>();
  private redisFailureCount = 0;

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly jwt: JwtService,
    private readonly tokenStore: TokenStoreService,
    private readonly derivation: TokenDerivationService,
    private readonly crypto: CryptoService,
    private readonly presence: RealtimePresenceService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(REDIS_SUBSCRIBER) private readonly subscriber: Redis,
  ) {}

  private safeRedis<T>(
    label: string,
    fn: () => Promise<T>,
  ): Promise<T | undefined> {
    return fn().catch((err: Error) => {
      this.redisFailureCount++;
      this.logger.warn(
        {
          event: 'redis_failure',
          label,
          error: err.message,
          failureCount: this.redisFailureCount,
        },
        `Redis ${label} failed: ${err.message}`,
      );
      return undefined;
    });
  }

  onModuleInit() {
    const httpServer = this.adapterHost.httpAdapter.getHttpServer() as Server;
    this.wss = new WebSocketServer({
      server: httpServer,
      path: '/ws',
      maxPayload: 64 * 1024,
    });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      const authWs = ws as AuthWs;
      authWs.authenticated = false;
      authWs.isAlive = true;
      authWs.tabClaims = new Map();

      const ip = this.clientIp(req);
      const pending = this.pendingByIp.get(ip) || 0;
      if (pending >= RealtimeGateway.MAX_PENDING_PER_IP) {
        this.logger.warn(`WS pending-connection limit for ${ip}, closing`);
        ws.close(1013, 'Too many pending connections');
        return;
      }
      authWs.pendingIp = ip;
      this.pendingByIp.set(ip, pending + 1);

      this.logger.log({
        category: 'session',
        event: 'ws.connect',
        ip,
        userAgent: req.headers['user-agent'],
        deviceType: parseDeviceType(req.headers['user-agent']),
      });

      ws.on('pong', () => {
        authWs.isAlive = true;
      });

      const authTimer = setTimeout(() => {
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

      ws.on('close', (code?: number, reason?: Buffer) => {
        const uid = authWs.userId;
        if (code !== undefined && code !== 1000 && code !== 1001) {
          this.logger.log({
            category: 'websocket-exception',
            event: 'connection-loss',
            token: authWs.sessionId,
            userId: uid,
            code,
            reason: reason?.toString() ?? '',
          });
        }
        this.logger.log({
          category: 'session',
          event: 'ws.disconnect',
          token: authWs.sessionId,
          userId: uid,
          socketId: authWs.socketId,
        });
        this.releasePending(authWs);
        this.cleanupServiceConnections(authWs);
        this.pageManager.cleanupPageClaim(authWs);
        this.pageManager.cleanupTopicWatches(authWs);
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

    let heartbeatCount = 0;
    this.heartbeatTimer = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const client = ws as AuthWs;
        if (client.isAlive === false) {
          this.logger.log({
            category: 'session',
            event: 'ws.heartbeat_timeout',
            token: client.sessionId,
            userId: client.userId,
            socketId: client.socketId,
          });
          ws.terminate();
          return;
        }
        client.isAlive = false;
        ws.ping();
      });
      heartbeatCount++;
      if (heartbeatCount % 4 === 0) {
        void this.safeRedis('refreshPresenceTTL', () =>
          this.presence.refreshPresenceTTL(this.pageManager.pageClaims),
        );
      }
    }, 30000);

    void this.subscriber.subscribe(RealtimeGateway.WS_CHANNEL, (err) => {
      if (err) {
        this.logger.warn(
          'Redis pub/sub subscribe failed (multi-replica WS unavailable)',
        );
      }
    });

    this.subscriber.on('message', (_channel, raw) => {
      try {
        const { target, userId, service, room, topic, page, frame } =
          JSON.parse(raw) as {
            target:
              | 'broadcastAll'
              | 'broadcastToRoom'
              | 'emitToTopic'
              | 'emitToService'
              | 'emitToUser'
              | 'emitToPage';
            frame: Record<string, unknown>;
            userId?: string;
            service?: string;
            room?: string;
            topic?: string;
            page?: string;
          };
        this.forwardingFromRedis = true;
        try {
          switch (target) {
            case 'broadcastAll':
              this.broadcastAll(frame);
              break;
            case 'broadcastToRoom':
              if (room) this.broadcastToRoom(room, frame);
              break;
            case 'emitToTopic':
              if (topic) this.emitToTopic(topic, frame);
              break;
            case 'emitToService':
              if (userId && service) this.emitToService(userId, service, frame);
              break;
            case 'emitToUser':
              if (userId) this.emitToUser(userId, frame);
              break;
            case 'emitToPage':
              if (userId && page) this.emitToPage(userId, page, frame);
              break;
          }
        } finally {
          this.forwardingFromRedis = false;
        }
      } catch {
        /* malformed frame */
      }
    });
  }

  onModuleDestroy() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    void this.safeRedis('unsubscribe', () =>
      this.subscriber.unsubscribe(RealtimeGateway.WS_CHANNEL),
    );
    this.wss?.close();
  }

  registerHandler(type: string, handler: FrameHandler): void {
    if (this.handlers.has(type)) {
      throw new Error(`Handler for frame type "${type}" is already registered`);
    }
    this.handlers.set(type, handler);
  }

  // ==================== Message routing ====================

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
        this.sendWsError(
          authWs,
          'EX_AUTH_INVALID_CREDENTIALS',
          'Authenticate first',
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
      const error = this.pageManager.handleWatch(
        authWs,
        data as { topic: string },
      );
      if (error) this.sendWsError(authWs, 'EX_VALIDATION_FORM', error);
      return;
    }

    if (data.type === 'unwatch') {
      this.pageManager.handleUnwatch(authWs, data as { topic: string });
      return;
    }

    if (data.type === 'page') {
      const error = this.pageManager.handlePage(
        authWs,
        data as { page: string | null; params?: Record<string, string> },
      );
      if (error) {
        this.sendWsError(authWs, 'EX_VALIDATION_FORM', error);
      } else {
        void this.safeRedis('syncPresenceToRedis', () =>
          this.presence.syncPresenceToRedis(authWs),
        );
      }
      return;
    }

    const handler = this.handlers.get(data.type as string);
    if (handler) await handler(authWs, data);
  }

  // ==================== Auth ====================

  private async handleAuth(
    ws: AuthWs,
    tokens: AuthTokens,
    authTimer: ReturnType<typeof setTimeout>,
  ): Promise<void> {
    let payload: { sub: string };
    try {
      payload = this.jwt.verify<{ sub: string }>(tokens.accessToken);
    } catch {
      this.logger.log({
        category: 'session',
        event: 'ws.auth_fail',
        reason: 'invalid_jwt',
      });
      this.sendWsError(ws, 'EX_AUTH_INVALID_CREDENTIALS', 'Auth failed');
      ws.close();
      return;
    }

    const expectedUserToken = this.derivation.deriveUserToken(payload.sub);
    if (!this.crypto.timingSafeEqual(tokens.userToken, expectedUserToken)) {
      this.logger.log({
        category: 'session',
        event: 'ws.auth_fail',
        reason: 'user_token_mismatch',
        userId: payload.sub,
      });
      this.sendWsError(ws, 'EX_AUTH_INVALID_CREDENTIALS', 'Auth failed');
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
      this.logger.log({
        category: 'session',
        event: 'ws.auth_fail',
        reason: 'session_miss',
        userId: payload.sub,
      });
      this.sendWsError(ws, 'EX_AUTH_INVALID_CREDENTIALS', 'Auth failed');
      ws.close();
      return;
    }

    const expectedRbac = this.derivation.deriveRbacToken(
      hash.userId,
      hash.tier || 'FREE',
    );
    if (!this.crypto.timingSafeEqual(tokens.rbacToken, expectedRbac)) {
      this.logger.log({
        category: 'session',
        event: 'ws.auth_fail',
        reason: 'rbac_mismatch',
        userId: payload.sub,
      });
      this.sendWsError(ws, 'EX_AUTH_INVALID_CREDENTIALS', 'Auth failed');
      ws.close();
      return;
    }

    ws.userId = hash.userId;
    ws.sessionId = hash.sessionId;
    ws.userName = displayName(hash);
    ws.tier = hash.tier || 'FREE';
    ws.deviceTokenHash = crypto
      .createHash('sha256')
      .update(tokens.deviceToken)
      .digest('hex');
    ws.userToken = this.derivation.deriveUserToken(hash.userId);
    ws.registeredServices = [];
    ws.watchedTopics = [];
    ws.socketId =
      hash.userId + ':' + Date.now().toString(36) + this.crypto.randomToken(5);
    ws.authenticated = true;
    this.releasePending(ws);
    clearTimeout(authTimer);

    this.logger.log({
      category: 'session',
      event: 'ws.auth_success',
      token: hash.sessionId,
      userId: hash.userId,
      socketId: ws.socketId,
    });

    let sockets = this.userSockets.get(hash.userId);
    if (!sockets) {
      sockets = new Set<AuthWs>();
      this.userSockets.set(hash.userId, sockets);
    }
    sockets.add(ws);
    while (sockets.size > RealtimeGateway.MAX_SOCKETS_PER_USER) {
      const oldest = sockets.values().next().value as AuthWs;
      sockets.delete(oldest);
      this.logger.warn(
        `WS per-user connection limit for ${hash.userId}, closing oldest`,
      );
      oldest.close(1013, 'Connection limit reached');
    }

    ws.send(JSON.stringify({ type: 'authenticated' }));
    ws.send(JSON.stringify({ type: 'room-counts', rooms: {} }));
    const onlineUsers = Array.from(this.onlineCount.keys())
      .filter((id) => id !== hash.userId)
      .map((id) => ({ id }));
    ws.send(JSON.stringify({ type: 'online-users', users: onlineUsers }));
    this.handleOnline(ws);
  }

  // ==================== Register, Online, Cleanup ====================

  private handleRegister(ws: AuthWs, data: { services: string[] }) {
    if (!Array.isArray(data.services) || !ws.userId || !ws.deviceTokenHash)
      return;
    const allowed = new Set(['MESSAGE', 'NOTIFICATION', 'CHAT']);
    for (const svc of data.services) {
      if (!allowed.has(svc)) continue;
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
      JSON.stringify({ type: 'registered', services: ws.registeredServices }),
    );
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
    ws.send(JSON.stringify({ type: 'online-users', users: onlineUsers }));
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
    if (!this.forwardingFromRedis) {
      void this.safeRedis('publish', () =>
        this.redis.publish(
          RealtimeGateway.WS_CHANNEL,
          JSON.stringify({ target: 'emitToUser', userId, frame }),
        ),
      );
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
    if (!this.forwardingFromRedis) {
      void this.safeRedis('publish', () =>
        this.redis.publish(
          RealtimeGateway.WS_CHANNEL,
          JSON.stringify({ target: 'emitToService', userId, service, frame }),
        ),
      );
    }
    return sent;
  }

  emitToTopic(topic: string, frame: Record<string, unknown>): number {
    const watchers = this.pageManager.topicWatchers.get(topic);
    if (!watchers) return 0;
    const msg = JSON.stringify(frame);
    let sent = 0;
    for (const ws of watchers) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
        sent++;
      }
    }
    if (!this.forwardingFromRedis) {
      void this.safeRedis('publish', () =>
        this.redis.publish(
          RealtimeGateway.WS_CHANNEL,
          JSON.stringify({ target: 'emitToTopic', topic, frame }),
        ),
      );
    }
    return sent;
  }

  emitToPage(
    userId: string,
    pageKey: string,
    frame: Record<string, unknown>,
  ): number {
    const local = this.pageManager.emitToPage(userId, pageKey, frame);
    if (!this.forwardingFromRedis) {
      void this.safeRedis('publish', () =>
        this.redis.publish(
          RealtimeGateway.WS_CHANNEL,
          JSON.stringify({
            target: 'emitToPage',
            userId,
            page: pageKey,
            frame,
          }),
        ),
      );
    }
    return local;
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
    if (!this.forwardingFromRedis) {
      void this.safeRedis('publish', () =>
        this.redis.publish(
          RealtimeGateway.WS_CHANNEL,
          JSON.stringify({ target: 'broadcastAll', frame }),
        ),
      );
    }
  }

  broadcastToRoom(room: string, payload: Record<string, unknown>): void {
    const msg = JSON.stringify(payload);
    this.wss.clients.forEach((c) => {
      const client = c as AuthWs;
      if (client.room === room && client.readyState === WebSocket.OPEN)
        client.send(msg);
    });
    if (!this.forwardingFromRedis) {
      void this.safeRedis('publish', () =>
        this.redis.publish(
          RealtimeGateway.WS_CHANNEL,
          JSON.stringify({ target: 'broadcastToRoom', room, frame: payload }),
        ),
      );
    }
  }

  registerPageCallbacks(
    page: string,
    onJoin: (ws: WebSocket, params: Record<string, string>) => void,
    onLeave: (ws: WebSocket, params: Record<string, string>) => void,
  ): void {
    this.pageManager.registerPageCallbacks(page, onJoin, onLeave);
  }

  getOnlineUserIds(): string[] {
    return Array.from(this.onlineCount.keys());
  }

  updateUserTier(userId: string, tier: string): void {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;
    const frame = JSON.stringify({ type: 'tier-changed', tier });
    for (const ws of sockets) {
      ws.tier = tier;
      if (ws.readyState === WebSocket.OPEN) ws.send(frame);
    }
  }

  closeSocketsForSession(userId: string, sessionId: string): number {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return 0;
    let closed = 0;
    for (const ws of sockets) {
      if (ws.sessionId === sessionId && ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Session revoked');
        closed++;
      }
    }
    return closed;
  }

  closeAllSocketsForUser(userId: string): number {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return 0;
    let closed = 0;
    for (const ws of sockets) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, 'Account suspended');
        closed++;
      }
    }
    this.userSockets.delete(userId);
    return closed;
  }

  // ==================== Helpers ====================

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

  private sendWsError(
    ws: WebSocket,
    exc: ExceptionCode,
    msg: string,
    key?: string,
  ): void {
    ws.send(
      JSON.stringify({ type: 'error', exc, msg, key: key ?? 'error.ws' }),
    );
  }

  private releasePending(ws: AuthWs) {
    const ip = ws.pendingIp;
    if (!ip) return;
    ws.pendingIp = undefined;
    const count = this.pendingByIp.get(ip) || 0;
    if (count <= 1) this.pendingByIp.delete(ip);
    else this.pendingByIp.set(ip, count - 1);
  }
}
