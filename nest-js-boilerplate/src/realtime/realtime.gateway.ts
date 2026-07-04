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
import { REDIS_CLIENT } from '../redis/redis.module';
import { TokenStoreService } from '../auth/token-store.service';
import { TokenDerivationService } from '../auth/token-derivation.service';
import { CryptoService } from '../common/crypto/crypto.service';
import type { ExceptionCode } from '../common/exceptions/exception-code';

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
  page?: string | null;
  pageParams?: Record<string, string>;
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

interface PageAllowlistEntry {
  allowed: string[];
  key: string[];
}

const PAGE_ALLOWLIST: Record<string, PageAllowlistEntry> = {
  messages: { allowed: ['peer'], key: [] },
  'friend-request': { allowed: [], key: [] },
  notification: { allowed: [], key: [] },
  feed: { allowed: [], key: [] },
  post: { allowed: ['id'], key: ['id'] },
  'chat-room': { allowed: ['room'], key: ['room'] },
};

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
  private pageClaims = new Map<string, Set<AuthWs>>();
  private pageJoinCallbacks = new Map<
    string,
    (ws: WebSocket, params: Record<string, string>) => void
  >();
  private pageLeaveCallbacks = new Map<
    string,
    (ws: WebSocket, params: Record<string, string>) => void
  >();

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly jwt: JwtService,
    private readonly tokenStore: TokenStoreService,
    private readonly derivation: TokenDerivationService,
    private readonly crypto: CryptoService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

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
        this.cleanupPageClaim(authWs);
        this.cleanupTopicWatches(authWs);
        // leaveAllRooms not needed here — page-claim leave callback already
        // removes socket from chat-room tracking via cleanupPageClaim above.
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

    let heartbeatCount = 0;
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
      // Refresh Redis presence TTL every 4th heartbeat (~2 min)
      heartbeatCount++;
      if (heartbeatCount % 4 === 0) {
        this.refreshPresenceTTL().catch(() => {});
      }
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
      this.handleWatch(authWs, data as { topic: string });
      return;
    }

    if (data.type === 'unwatch') {
      this.handleUnwatch(authWs, data as { topic: string });
      return;
    }

    if (data.type === 'page') {
      this.handlePage(
        authWs,
        data as { page: string | null; params?: Record<string, string> },
      );
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
      this.sendWsError(ws, 'EX_AUTH_INVALID_CREDENTIALS', 'Auth failed');
      ws.close();
      return;
    }

    const expectedUserToken = this.derivation.deriveUserToken(payload.sub);
    if (!this.crypto.timingSafeEqual(tokens.userToken, expectedUserToken)) {
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
      this.sendWsError(ws, 'EX_AUTH_INVALID_CREDENTIALS', 'Auth failed');
      ws.close();
      return;
    }

    const expectedRbac = this.derivation.deriveRbacToken(
      hash.userId,
      hash.tier || 'FREE',
    );
    if (!this.crypto.timingSafeEqual(tokens.rbacToken, expectedRbac)) {
      this.sendWsError(ws, 'EX_AUTH_INVALID_CREDENTIALS', 'Auth failed');
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
      const oldest = sockets.values().next().value as AuthWs;
      sockets.delete(oldest);
      this.logger.warn(
        `WS per-user connection limit for ${hash.userId}, closing oldest`,
      );
      oldest.close(1013, 'Connection limit reached');
    }

    ws.send(JSON.stringify({ type: 'authenticated' }));
    // Send initial state snapshot after auth (P1-7).
    ws.send(
      JSON.stringify({
        type: 'room-counts',
        rooms: {},
      }),
    );
    const onlineUsers = Array.from(this.onlineCount.keys())
      .filter((id) => id !== hash.userId)
      .map((id) => ({ id }));
    ws.send(
      JSON.stringify({
        type: 'online-users',
        users: onlineUsers,
      }),
    );
    this.handleOnline(ws);
  }

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
      JSON.stringify({
        type: 'registered',
        services: ws.registeredServices,
      }),
    );
  }

  private handleWatch(ws: AuthWs, data: { topic: string }) {
    if (!ws.userId) return;
    if (!TOPIC_ALLOWLIST.test(data.topic)) {
      this.sendWsError(ws, 'EX_VALIDATION_FORM', 'Invalid topic pattern');
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

  // ==================== Page-claim system (Phase 7) ====================

  registerPageCallbacks(
    page: string,
    onJoin: (ws: WebSocket, params: Record<string, string>) => void,
    onLeave: (ws: WebSocket, params: Record<string, string>) => void,
  ): void {
    this.pageJoinCallbacks.set(page, onJoin);
    this.pageLeaveCallbacks.set(page, onLeave);
  }

  private handlePage(
    ws: AuthWs,
    data: { page: string | null; params?: Record<string, string> },
  ) {
    if (!ws.userId) return;

    const newPage = data.page;
    const newParams = data.params;

    // Validate page and params
    if (newPage !== null) {
      const entry = PAGE_ALLOWLIST[newPage];
      if (!entry) {
        this.sendWsError(ws, 'EX_VALIDATION_FORM', `Invalid page "${newPage}"`);
        return;
      }
      const paramKeys = newParams ? Object.keys(newParams) : [];
      for (const key of paramKeys) {
        if (!entry.allowed.includes(key)) {
          this.sendWsError(
            ws,
            'EX_VALIDATION_FORM',
            `Invalid param "${key}" for page "${newPage}"`,
          );
          return;
        }
      }
      for (const required of entry.key) {
        if (!paramKeys.includes(required)) {
          this.sendWsError(
            ws,
            'EX_VALIDATION_FORM',
            `Missing required param "${required}" for page "${newPage}"`,
          );
          return;
        }
      }
    }

    // Clean up old claim (topic/room + index)
    if (ws.page === 'feed') {
      this.removeFromTopicWatch(ws, 'feed');
    } else if (ws.page === 'post' && ws.pageParams?.id) {
      this.removeFromTopicWatch(ws, `post:${ws.pageParams.id}`);
    } else if (ws.page === 'chat-room' && ws.pageParams?.room) {
      const cb = this.pageLeaveCallbacks.get('chat-room');
      if (cb) cb(ws, ws.pageParams);
    }
    // Remove from old page index
    if (ws.page && ws.page) {
      const oldKey = `page:${this.buildPageKey(ws.page, ws.pageParams)}:${ws.userId}`;
      const oldSockets = this.pageClaims.get(oldKey);
      if (oldSockets) {
        oldSockets.delete(ws);
        if (oldSockets.size === 0) this.pageClaims.delete(oldKey);
      }
    }

    // Set new claim
    ws.page = newPage;
    ws.pageParams = newParams;

    if (newPage === null) return;

    // Add to new page index — uses only key params for routing
    const newKey = `page:${this.buildPageKey(newPage, newParams)}:${ws.userId}`;
    if (!this.pageClaims.has(newKey)) {
      this.pageClaims.set(newKey, new Set());
    }
    this.pageClaims.get(newKey)!.add(ws);

    // Translate claim → topic/room membership
    if (newPage === 'feed') {
      this.addToTopicWatch(ws, 'feed');
    } else if (newPage === 'post' && newParams?.id) {
      this.addToTopicWatch(ws, `post:${newParams.id}`);
    } else if (newPage === 'chat-room' && newParams?.room) {
      const cb = this.pageJoinCallbacks.get('chat-room');
      if (cb) cb(ws, newParams);
    }

    // Mirror to Redis (fire-and-forget)
    this.syncPresenceToRedis(ws).catch(() => {});
  }

  private cleanupPageClaim(ws: AuthWs) {
    if (!ws.userId) return;
    // Leave room if applicable
    if (ws.page === 'chat-room' && ws.pageParams?.room) {
      const cb = this.pageLeaveCallbacks.get('chat-room');
      if (cb) cb(ws, ws.pageParams);
    }
    // Remove from page index
    if (ws.page) {
      const key = `page:${this.buildPageKey(ws.page, ws.pageParams)}:${ws.userId}`;
      const sockets = this.pageClaims.get(key);
      if (sockets) {
        sockets.delete(ws);
        if (sockets.size === 0) this.pageClaims.delete(key);
      }
    }
    // Remove from Redis presence (fire-and-forget)
    this.removePresenceFromRedis(ws).catch(() => {});
  }

  emitToPage(
    userId: string,
    pageKey: string,
    frame: Record<string, unknown>,
  ): number {
    const key = `page:${pageKey}:${userId}`;
    const sockets = this.pageClaims.get(key);
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

  private buildPageKey(page: string, params?: Record<string, string>): string {
    const entry = PAGE_ALLOWLIST[page];
    const keyParams = entry?.key ?? [];
    if (!params || keyParams.length === 0) return page;
    const relevant = keyParams
      .filter((k) => params[k] !== undefined)
      .sort((a, b) => a.localeCompare(b))
      .map((k) => `${k}:${params[k]}`);
    if (relevant.length === 0) return page;
    return `${page}:${relevant.join(':')}`;
  }

  private addToTopicWatch(ws: AuthWs, topic: string) {
    if (!this.topicWatchers.has(topic))
      this.topicWatchers.set(topic, new Set());
    this.topicWatchers.get(topic)!.add(ws);
    if (!ws.watchedTopics) ws.watchedTopics = [];
    if (!ws.watchedTopics.includes(topic)) ws.watchedTopics.push(topic);
  }

  private removeFromTopicWatch(ws: AuthWs, topic: string) {
    const watchers = this.topicWatchers.get(topic);
    if (watchers) {
      watchers.delete(ws);
      if (watchers.size === 0) this.topicWatchers.delete(topic);
    }
    if (ws.watchedTopics) {
      ws.watchedTopics = ws.watchedTopics.filter((t) => t !== topic);
    }
  }

  // ==================== Redis presence mirror (Phase 7 T2) ====================

  private static readonly PRESENCE_TTL = 120; // seconds — safety-net expiry

  private presenceKey(userId: string): string {
    return `presence:${userId}`;
  }

  private async syncPresenceToRedis(ws: AuthWs): Promise<void> {
    if (!ws.userId || !ws.deviceTokenHash || !ws.page) return;
    const field = ws.deviceTokenHash;
    const value = JSON.stringify({
      page: ws.page,
      params: ws.pageParams ?? {},
      at: Date.now(),
    });
    try {
      const key = this.presenceKey(ws.userId);
      const pipe = this.redis.pipeline();
      pipe.hset(key, field, value);
      pipe.expire(key, RealtimeGateway.PRESENCE_TTL);
      await pipe.exec();
    } catch {
      /* Redis write failure — non-critical */
    }
  }

  private async removePresenceFromRedis(ws: AuthWs): Promise<void> {
    if (!ws.userId || !ws.deviceTokenHash) return;
    try {
      await this.redis.hdel(this.presenceKey(ws.userId), ws.deviceTokenHash);
    } catch {
      /* Redis delete failure — non-critical */
    }
  }

  private async refreshPresenceTTL(): Promise<void> {
    const now = Date.now();
    for (const [, sockets] of this.pageClaims) {
      for (const ws of sockets) {
        if (
          ws.readyState !== WebSocket.OPEN ||
          !ws.userId ||
          !ws.deviceTokenHash
        )
          continue;
        try {
          const key = this.presenceKey(ws.userId);
          const field = ws.deviceTokenHash;
          const value = JSON.stringify({
            page: ws.page,
            params: ws.pageParams ?? {},
            at: now,
          });
          const pipe = this.redis.pipeline();
          pipe.hset(key, field, value);
          pipe.expire(key, RealtimeGateway.PRESENCE_TTL);
          await pipe.exec();
        } catch {
          /* non-critical */
        }
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

  private sendWsError(
    ws: WebSocket,
    exc: ExceptionCode,
    msg: string,
    key?: string,
  ): void {
    ws.send(
      JSON.stringify({
        type: 'error',
        exc,
        msg,
        key: key ?? 'error.ws',
      }),
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
