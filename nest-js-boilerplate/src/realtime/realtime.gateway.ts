import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { WebSocketServer, WebSocket } from 'ws';
import type { VerifyClientCallbackAsync } from 'ws';
import { Server } from 'http';
import { IncomingMessage } from 'http';
import crypto from 'crypto';
import { parseCookie } from 'cookie';
import Redis from 'ioredis';
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT, REDIS_SUBSCRIBER } from '../redis/redis.module';
import { SessionValidatorService } from '../auth/session-validator.service';
import { CryptoService } from '../common/crypto/crypto.service';
import { displayName } from '../common/utils/display-name';
import { parseDeviceType } from '../common/utils/device-type';
import type { ExceptionCode } from '../common/exceptions/exception-code';
import type {
  AuthWs,
  FrameHandler,
  VerifiedUpgradeRequest,
} from './realtime.types';
import { RealtimePresenceService } from './realtime-presence.service';
import { RealtimePageManager } from './realtime-page.manager';
import {
  RealtimeRateLimiter,
  type RealtimeRateLimiterConfig,
} from './realtime-rate-limiter';
import { WireCryptoService } from '../wire-crypto/wire-crypto.service';
import type { WireEnvelopeV2 } from '../wire-crypto/wire-crypto.types';

@Injectable()
export class RealtimeGateway implements OnModuleInit, OnModuleDestroy {
  private static readonly MAX_SOCKETS_PER_USER = 20;
  private static readonly MAX_PENDING_PER_IP = 50;
  private static readonly WS_CHANNEL = 'ws:broadcast';
  /** Socket-registry key TTL (s); heartbeat refreshes it for live sockets. */
  private static readonly SOCKET_REGISTRY_TTL = 300;
  /** Stable id for THIS replica, stored in the socket registry. */
  private static readonly INSTANCE_ID =
    process.env.INSTANCE_ID ?? process.env.HOSTNAME ?? `pid:${process.pid}`;
  /** Default inbound-frame limits (overridable via env). */
  private static readonly FRAME_LIMITS: RealtimeRateLimiterConfig = {
    socketRatePerSec: 10,
    socketBurst: 50,
    userRatePerSec: 30,
    userBurst: 120,
  };
  /** Min interval between plaintext crypto-resync signals per device. */
  private static readonly RESYNC_THROTTLE_MS = 5_000;

  // Deliberately NOT this app's own env-prefixed cookie-name helpers
  // (access-cookie.ts etc. return __Secure-prefixed names in production).
  // Those are only ever exercised when this backend sets/reads cookies on
  // its own direct responses (e2e tests); real browser traffic goes through
  // the Next.js BFF, which sets these four cookies with plain, unprefixed
  // names in every environment (see next-js-boilerplate/src/lib/cookie.ts)
  // and forwards them to this backend as headers/Bearer, never as raw
  // cookies — so this is the only code path that ever reads the browser's
  // actual cookie jar directly, and it has to match what's really there.
  private static readonly SESSION_COOKIE_NAMES = {
    access: 'access_token',
    rbac: 'rbac_token',
    device: 'device_token',
    user: 'user_token',
  } as const;

  private readonly logger = new Logger(RealtimeGateway.name);
  private wss!: WebSocketServer;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private forwardingFromRedis = false;
  readonly onlineCount = new Map<string, number>();
  readonly pageManager = new RealtimePageManager();
  private serviceConnections = new Map<string, Set<WebSocket>>();
  private serviceDeviceIndex = new Map<string, Set<string>>();
  private userSockets = new Map<string, Set<AuthWs>>();
  /**
   * socketId (`ws-<deviceTokenHash>`) → AuthWs. One socket per device, so this
   * is a 1:1 map giving O(1) device→socket lookup — no per-user scan needed
   * once a device-token hash is known. Also drives the one-socket-per-device
   * replace policy (a reconnect with the same device token supersedes the old
   * connection).
   */
  private deviceSockets = new Map<string, AuthWs>();
  /** roomId → socketId → AuthWs. Room-targeted delivery uses this index
   *  instead of scanning every client on the instance. */
  private roomSockets = new Map<string, Map<string, AuthWs>>();
  private pendingByIp = new Map<string, number>();
  private handlers = new Map<string, FrameHandler>();
  private redisFailureCount = 0;
  private userIps = new Map<string, Map<string, number>>();
  /** IDs of emitToPageEncrypted messages published by THIS instance.
   *  Used to skip redundant local delivery when the subscriber echoes
   *  the message back. Entries auto-expire after 5 s. */
  private recentlyPublished = new Map<string, ReturnType<typeof setTimeout>>();
  /** deviceHash|sessionId → last crypto-resync sent at (ms). */
  private lastResyncSignal = new Map<string, number>();

  /**
   * Allocates a unique publish id and remembers it for 5s so that when the
   * Redis subscriber echoes this instance's own publish, the local delivery
   * is skipped (no duplicate frames on the originating replica).
   */
  private newPublishEid(): string {
    const eid = crypto.randomBytes(8).toString('hex');
    const timer = setTimeout(() => {
      this.recentlyPublished.delete(eid);
    }, 5_000);
    this.recentlyPublished.set(eid, timer);
    return eid;
  }

  /** Returns true when `eid` marks one of this instance's own publishes. */
  private skipPublished(eid?: string): boolean {
    if (!eid || !this.recentlyPublished.has(eid)) return false;
    clearTimeout(this.recentlyPublished.get(eid));
    this.recentlyPublished.delete(eid);
    return true;
  }

  /**
   * Send a plaintext crypto-resync control frame (throttled per device) after
   * a c2s decrypt failure. The client re-runs the handshake and adopts the
   * server's sequence counters — no key material is invalidated.
   */
  private signalCryptoResync(authWs: AuthWs): void {
    const key = authWs.deviceTokenHash ?? authWs.sessionId;
    if (!key) return;
    const now = Date.now();
    const last = this.lastResyncSignal.get(key) ?? 0;
    if (now - last < RealtimeGateway.RESYNC_THROTTLE_MS) return;
    this.lastResyncSignal.set(key, now);
    authWs.send(JSON.stringify({ type: 'crypto-resync' }));
  }
  private readonly frameLimiter: RealtimeRateLimiter;

  constructor(
    private readonly adapterHost: HttpAdapterHost,
    private readonly crypto: CryptoService,
    private readonly presence: RealtimePresenceService,
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Inject(REDIS_SUBSCRIBER) private readonly subscriber: Redis,
    private readonly validator: SessionValidatorService,
    private readonly wireCrypto: WireCryptoService,
  ) {
    this.frameLimiter = new RealtimeRateLimiter({
      socketRatePerSec: this.config.get<number>(
        'WS_SOCKET_FRAME_RATE',
        RealtimeGateway.FRAME_LIMITS.socketRatePerSec,
      ),
      socketBurst: this.config.get<number>(
        'WS_SOCKET_FRAME_BURST',
        RealtimeGateway.FRAME_LIMITS.socketBurst,
      ),
      userRatePerSec: this.config.get<number>(
        'WS_USER_FRAME_RATE',
        RealtimeGateway.FRAME_LIMITS.userRatePerSec,
      ),
      userBurst: this.config.get<number>(
        'WS_USER_FRAME_BURST',
        RealtimeGateway.FRAME_LIMITS.userBurst,
      ),
    });
  }

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
      // Must stay a plain 2-param arrow — `ws` picks sync vs. async verifyClient
      // by checking Function.prototype.length; anything else silently falls
      // back to the sync path, where a truthy Promise return accepts every
      // connection unconditionally (see verifyUpgrade's own doc comment).
      verifyClient: ((info, cb) => {
        void this.verifyUpgrade(info, cb);
      }) as VerifyClientCallbackAsync,
    });

    this.wss.on('connection', (ws: WebSocket, req: VerifiedUpgradeRequest) => {
      const authWs = ws as AuthWs;
      const session = req.sessionUser;
      if (!session) {
        // Unreachable in practice — verifyClient rejects the upgrade before
        // a socket exists whenever validation fails. Defensive close only.
        ws.close(1011, 'Internal error');
        return;
      }

      const ip = this.clientIp(req);
      authWs.clientIp = ip;
      authWs.isAlive = true;
      authWs.tabClaims = new Map();

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

      authWs.userId = session.userId;
      authWs.sessionId = session.sessionId;
      authWs.userName = displayName(session);
      authWs.chatNickname = session.chatNickname ?? '';
      authWs.useNickname = session.useNickname ?? false;
      authWs.avatarUrl = session.hideAvatar ? null : session.avatarUrl || null;
      authWs.tier = session.tier || 'FREE';
      authWs.deviceTokenHash = crypto
        .createHash('sha256')
        .update(req.deviceToken ?? '')
        .digest('hex');
      authWs.registeredServices = [];
      authWs.watchedTopics = [];
      // Socket id is DERIVED from the device token: `ws-<deviceTokenHash>`.
      // Only one socket is allowed per device, so this is the stable key used
      // to find (and replace) the device's existing connection in O(1).
      // Token-less clients fall back to a random id so they can never collide
      // with — or accidentally replace — one another.
      authWs.socketId = req.deviceToken
        ? `ws-${authWs.deviceTokenHash}`
        : session.userId +
          ':' +
          Date.now().toString(36) +
          this.crypto.randomToken(5);
      authWs.authenticated = true;

      this.logger.log({
        category: 'session',
        event: 'ws.auth_success',
        token: session.sessionId,
        userId: session.userId,
        socketId: authWs.socketId,
      });

      let sockets = this.userSockets.get(session.userId);
      if (!sockets) {
        sockets = new Set<AuthWs>();
        this.userSockets.set(session.userId, sockets);
      }
      sockets.add(authWs);

      // One socket per device: a fresh connection carrying a device token
      // that is already connected here supersedes that device's previous
      // socket. Its cleanup runs synchronously BEFORE this socket registers
      // anywhere, so the shared deterministic socketId cannot clobber the new
      // connection's state (registry, room membership, frame bucket).
      const replaced = this.replaceDeviceSocket(authWs);
      while (sockets.size > RealtimeGateway.MAX_SOCKETS_PER_USER) {
        const oldest = sockets.values().next().value as AuthWs;
        sockets.delete(oldest);
        this.logger.warn(
          `WS per-user connection limit for ${session.userId}, closing oldest`,
        );
        oldest.close(1013, 'Connection limit reached');
      }

      this.trackUserIp(session.userId, authWs.clientIp);
      if (authWs.socketId) this.deviceSockets.set(authWs.socketId, authWs);
      this.registerSocketRegistry(authWs);

      authWs.send(
        JSON.stringify({ type: 'authenticated', sessionId: authWs.sessionId }),
      );
      authWs.send(JSON.stringify({ type: 'room-counts', rooms: {} }));
      const onlineUsers = Array.from(this.onlineCount.keys())
        .filter((id) => id !== session.userId)
        .map((id) => ({ id }));
      authWs.send(JSON.stringify({ type: 'online-users', users: onlineUsers }));
      this.handleOnline(authWs, { silent: !!replaced });

      ws.on('message', (raw: Buffer) => {
        this.handleMessage(authWs, raw).catch((err) =>
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
        if (authWs.detached) {
          // Replaced by a newer socket for the same device — its cleanup ran
          // synchronously during the replacement. Running it again here would
          // remove the replacement socket's registry/room/bucket under the
          // same deterministic socketId.
          return;
        }
        this.cleanupSocket(authWs);
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
        void this.safeRedis('refreshSocketRegistryTTL', async () => {
          const pipe = this.redis.pipeline();
          for (const c of this.wss.clients) {
            const sid = (c as AuthWs).socketId;
            if (sid)
              pipe.expire(
                this.socketKey(sid),
                RealtimeGateway.SOCKET_REGISTRY_TTL,
              );
          }
          await pipe.exec();
        });
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
        const { target, userId, service, room, topic, page, frame, eid } =
          JSON.parse(raw) as {
            target:
              | 'broadcastAll'
              | 'broadcastToRoom'
              | 'emitToTopic'
              | 'emitToService'
              | 'emitToUser'
              | 'emitToPage'
              | 'emitToPageEncrypted'
              | 'emitToUserEncrypted'
              | 'emitToRoomEncrypted';
            frame: Record<string, unknown>;
            userId?: string;
            service?: string;
            room?: string;
            topic?: string;
            page?: string;
            eid?: string;
          };
        this.forwardingFromRedis = true;
        try {
          switch (target) {
            case 'broadcastAll':
              if (!this.skipPublished(eid)) this.broadcastAll(frame);
              break;
            case 'broadcastToRoom':
              if (room && !this.skipPublished(eid)) this.broadcastToRoom(room, frame);
              break;
            case 'emitToTopic':
              if (topic && !this.skipPublished(eid)) this.emitToTopic(topic, frame);
              break;
            case 'emitToService':
              if (userId && service && !this.skipPublished(eid)) {
                this.emitToService(userId, service, frame);
              }
              break;
            case 'emitToUser':
              if (userId && !this.skipPublished(eid)) this.emitToUser(userId, frame);
              break;
            case 'emitToPage':
              if (userId && page && !this.skipPublished(eid)) {
                this.emitToPage(userId, page, frame);
              }
              break;
            case 'emitToPageEncrypted':
              if (userId && page && frame) {
                if (this.skipPublished(eid)) break;
                void this.pageManager.emitToPageWith(
                  userId,
                  page,
                  (sid, dth) =>
                    this.wireCrypto.encryptForSession(
                      sid,
                      frame,
                      dth,
                    ) as unknown as Promise<Record<string, unknown>>,
                );
              }
              break;
            case 'emitToUserEncrypted':
              if (userId && frame) {
                if (this.skipPublished(eid)) break;
                void this.emitToUserEncrypted(userId, frame);
              }
              break;
            case 'emitToRoomEncrypted':
              if (room && frame) {
                if (this.skipPublished(eid)) break;
                void this.emitToRoomEncrypted(room, frame);
              }
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
    this.frameLimiter.clear();
    void this.safeRedis('unsubscribe', () =>
      this.subscriber.unsubscribe(RealtimeGateway.WS_CHANNEL),
    );
    this.wss?.close();
  }

  // ==================== Handshake auth ====================

  /**
   * Validates the WS handshake using the same httpOnly session cookies any
   * normal HTTP request presents — never a client-sent token message. Runs
   * before a socket is ever created: rejection here means the client never
   * gets to speak the WebSocket protocol at all.
   *
   * Cheapest checks first (mirrors SessionAuthGuard's own "fastest first"
   * ordering): Origin, then the per-IP concurrency cap, then cookie parsing,
   * then the one Redis/JWT-touching step.
   */
  private async verifyUpgrade(
    info: { origin: string; secure: boolean; req: VerifiedUpgradeRequest },
    cb: (res: boolean, code?: number, message?: string) => void,
  ): Promise<void> {
    const { req } = info;

    if (!this.isAllowedOrigin(info.origin)) {
      cb(false, 403, 'Forbidden');
      return;
    }

    const ip = this.clientIp(req);
    const pending = this.pendingByIp.get(ip) || 0;
    if (pending >= RealtimeGateway.MAX_PENDING_PER_IP) {
      this.logger.warn(`WS pending-connection limit for ${ip}, closing`);
      cb(false, 429, 'Too Many Requests');
      return;
    }
    this.pendingByIp.set(ip, pending + 1);

    try {
      const cookies = parseCookie(req.headers.cookie ?? '');
      const names = RealtimeGateway.SESSION_COOKIE_NAMES;
      const deviceToken = cookies[names.device] ?? null;
      const result = await this.validator.validate({
        accessToken: cookies[names.access] ?? null,
        rbacToken: cookies[names.rbac] ?? null,
        deviceToken,
        userToken: cookies[names.user] ?? null,
      });

      if (!result.ok) {
        this.logger.log({
          category: 'session',
          event: 'ws.auth_fail',
          reason: result.reason,
          ip,
        });
        cb(
          false,
          result.reason === 'redis_unavailable' ? 503 : 401,
          'Unauthorized',
        );
        return;
      }

      req.sessionUser = result.session;
      req.deviceToken = deviceToken;
      cb(true);
    } finally {
      const count = this.pendingByIp.get(ip) || 0;
      if (count <= 1) this.pendingByIp.delete(ip);
      else this.pendingByIp.set(ip, count - 1);
    }
  }

  /**
   * A real browser always sends Origin on a WS handshake (no JS API can
   * suppress it), so a missing header can only come from a non-browser
   * client — pass those through rather than break first-party tooling.
   * An unset/empty CORS_ORIGIN disables the check entirely: WS handshakes
   * aren't covered by app.enableCors() (that only wraps the HTTP pipeline),
   * so this is net-new, WS-specific protection, not inherited elsewhere —
   * and CORS_ORIGIN isn't configured in local dev, so treating unset as
   * "reject everything" would break every local WS connection by default.
   */
  private isAllowedOrigin(origin: string | undefined): boolean {
    const allowList = this.config
      .get<string>('CORS_ORIGIN')
      ?.split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    if (!allowList?.length || !origin) return true;
    return allowList.includes(origin);
  }

  registerHandler(type: string, handler: FrameHandler): void {
    if (this.handlers.has(type)) {
      throw new Error(`Handler for frame type "${type}" is already registered`);
    }
    this.handlers.set(type, handler);
  }

  // ==================== Message routing ====================

  private async handleMessage(authWs: AuthWs, raw: Buffer): Promise<void> {
    const limit = this.frameLimiter.check(
      authWs.socketId,
      authWs.userId ?? null,
    );
    if (limit !== 'ok') {
      this.logger.warn({
        category: 'websocket-exception',
        event: 'ws.rate_limited',
        userId: authWs.userId,
        sessionId: authWs.sessionId,
        socketId: authWs.socketId,
        scope: limit,
      });
      authWs.close(
        1008,
        limit === 'socket'
          ? 'Frame rate limit exceeded'
          : 'Account frame rate limit exceeded',
      );
      return;
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(raw.toString()) as Record<string, unknown>;
    } catch {
      return;
    }

    // Wire-encrypted frames: detect WireEnvelopeV2, decrypt, then route on the
    // decrypted payload's type. Control frames (watch/unwatch/register/page)
    // are always sent as plaintext by the client.
    if (
      data.v === 2 &&
      typeof data.nonce === 'string' &&
      typeof data.ct === 'string'
    ) {
      if (!authWs.sessionId) return;
      try {
        const decrypted = (await this.wireCrypto.decryptFromClient(
          authWs.sessionId,
          data,
          authWs.deviceTokenHash,
        )) as Record<string, unknown>;
        if (decrypted && typeof decrypted === 'object') {
          data = decrypted;
        } else {
          return;
        }
      } catch (err) {
        this.logger.warn({
          category: 'websocket-exception',
          event: 'wire.decrypt_fail',
          userId: authWs.userId,
          sessionId: authWs.sessionId,
          deviceHash: authWs.deviceTokenHash,
          reason: (err as Error)?.message,
        });
        // Tell the client its c2s seq is desynced. The client re-handshakes
        // and adopts the server's counters (max of local vs server), which
        // restores encryption without flushing any keys. Throttled so a
        // stuck client can't be spammed on every dropped frame.
        this.signalCryptoResync(authWs);
        return;
      }
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

  private handleOnline(ws: AuthWs, opts: { silent?: boolean } = {}) {
    const prev = this.onlineCount.get(ws.userId!) || 0;
    this.onlineCount.set(ws.userId!, prev + 1);
    // `silent` suppresses the user-online broadcast for device-token replaces:
    // the user never actually went offline, so announcing it would flicker
    // the presence for every other peer.
    if (prev === 0 && !opts.silent) {
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

  /**
   * Fully removes a socket from every index it may be registered in. Guarded
   * to be effectively idempotent: the per-user bookkeeping (online count, IP
   * tracking, userSockets entry) runs exactly once, because it is gated on the
   * identity-based Set delete. Pass `{ silent: true }` when the offline
   * broadcast must be suppressed (one-socket-per-device replacement).
   */
  private cleanupSocket(ws: AuthWs, opts: { silent?: boolean } = {}): void {
    this.cleanupServiceConnections(ws);
    this.pageManager.cleanupPageClaim(ws);
    this.pageManager.cleanupTopicWatches(ws);
    this.leaveAllRoomSockets(ws.socketId);
    this.unregisterSocketRegistry(ws);
    this.frameLimiter.releaseSocket(ws.socketId);
    if (ws.socketId && this.deviceSockets.get(ws.socketId) === ws) {
      this.deviceSockets.delete(ws.socketId);
    }
    const uid = ws.userId;
    if (!uid) return;
    const sockets = this.userSockets.get(uid);
    if (!sockets?.delete(ws)) return;
    if (sockets.size === 0) {
      this.userSockets.delete(uid);
      this.frameLimiter.releaseUser(uid);
    }
    const prev = this.onlineCount.get(uid) || 1;
    if (prev <= 1) {
      this.onlineCount.delete(uid);
      if (!opts.silent) {
        this.broadcastAll({ type: 'user-offline', userId: uid });
      }
    } else {
      this.onlineCount.set(uid, prev - 1);
    }
    this.untrackUserIp(uid, ws.clientIp);
  }

  /**
   * One-socket-per-device replace policy. Returns the previous socket for the
   * same device (already detached and closed) or undefined when no replacement
   * is needed. Called on connect, BEFORE the new socket registers anywhere, so
   * the superseded socket's shared deterministic socketId can't wipe the new
   * connection's registry, room membership, or frame bucket.
   */
  private replaceDeviceSocket(ws: AuthWs): AuthWs | undefined {
    if (!ws.socketId) return undefined;
    const existing = this.deviceSockets.get(ws.socketId);
    if (!existing || existing === ws) return undefined;
    this.logger.log({
      category: 'session',
      event: 'ws.device_replaced',
      userId: ws.userId,
      socketId: ws.socketId,
      previousSessionId: existing.sessionId,
    });
    existing.detached = true;
    this.cleanupSocket(existing, { silent: true });
    existing.close(1008, 'Device reconnected');
    return existing;
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
          JSON.stringify({ target: 'emitToUser', userId, frame, eid: this.newPublishEid() }),
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
          JSON.stringify({ target: 'emitToService', userId, service, frame, eid: this.newPublishEid() }),
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
          JSON.stringify({ target: 'emitToTopic', topic, frame, eid: this.newPublishEid() }),
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
            eid: this.newPublishEid(),
          }),
        ),
      );
    }
    return local;
  }

  /**
   * Per-connection encrypted emit: encrypts `payload` with each connection's
   * own wire-crypto key and sends the resulting frame. Publishes the
   * plaintext payload to Redis so other instances can encrypt and deliver
   * to their local connections.
   *
   * Each published message carries a unique `eid`. When the Redis subscriber
   * echoes the message back to this instance, it sees the `eid` in the
   * `recentlyPublished` set and skips redundant local delivery — preventing
   * duplicate frames to connections on the originating instance.
   */
  async emitToPageEncrypted(
    userId: string,
    pageKey: string,
    payload: Record<string, unknown>,
  ): Promise<number> {
    const local = await this.pageManager.emitToPageWith(
      userId,
      pageKey,
      (sid, dth) =>
        this.wireCrypto.encryptForSession(
          sid,
          payload,
          dth,
        ) as unknown as Promise<Record<string, unknown>>,
    );
    if (!this.forwardingFromRedis) {
      void this.safeRedis('publish', () =>
        this.redis.publish(
          RealtimeGateway.WS_CHANNEL,
          JSON.stringify({
            target: 'emitToPageEncrypted',
            userId,
            page: pageKey,
            frame: payload,
            eid: this.newPublishEid(),
          }),
        ),
      );
    }
    return local;
  }

  /**
   * Per-connection encrypted emit to EVERY socket of a user, regardless of
   * page or room. One Redis publish; other replicas resolve their own local
   * sockets for that user (so every device gets a copy). Used for DMs —
   * compared to emitToPage (which only reaches sockets that claimed a page).
   */
  async emitToUserEncrypted(
    userId: string,
    payload: Record<string, unknown>,
  ): Promise<number> {
    const sockets = this.userSockets.get(userId);
    let sent = 0;
    if (sockets) {
      for (const ws of sockets) {
        if (ws.readyState !== WebSocket.OPEN || !ws.sessionId) continue;
        try {
          const enc = (await this.wireCrypto.encryptForSession(
            ws.sessionId,
            payload,
            ws.deviceTokenHash ?? '',
          )) as unknown as Record<string, unknown>;
          ws.send(JSON.stringify(enc));
          sent++;
        } catch {
          /* per-connection failure — skip */
        }
      }
    }
    if (!this.forwardingFromRedis) {
      void this.safeRedis('publish', () =>
        this.redis.publish(
          RealtimeGateway.WS_CHANNEL,
          JSON.stringify({
            target: 'emitToUserEncrypted',
            userId,
            frame: payload,
            eid: this.newPublishEid(),
          }),
        ),
      );
    }
    return sent;
  }

  /**
   * Per-connection encrypted emit to every socket currently joined to a room.
   * Uses the roomSockets index (not a client scan). One Redis publish; every
   * replica encrypts and delivers to its own room members locally.
   */
  async emitToRoomEncrypted(
    room: string,
    payload: Record<string, unknown>,
  ): Promise<number> {
    let sent = 0;
    const sockets = this.roomSockets.get(room);
    if (sockets) {
      for (const sock of sockets.values()) {
        const ws = sock;
        if (ws.readyState !== WebSocket.OPEN || !ws.sessionId) continue;
        try {
          const enc = (await this.wireCrypto.encryptForSession(
            ws.sessionId,
            payload,
            ws.deviceTokenHash ?? '',
          )) as unknown as Record<string, unknown>;
          ws.send(JSON.stringify(enc));
          sent++;
        } catch {
          /* per-connection failure — skip */
        }
      }
    }
    if (!this.forwardingFromRedis) {
      void this.safeRedis('publish', () =>
        this.redis.publish(
          RealtimeGateway.WS_CHANNEL,
          JSON.stringify({
            target: 'emitToRoomEncrypted',
            room,
            frame: payload,
            eid: this.newPublishEid(),
          }),
        ),
      );
    }
    return sent;
  }

  // ==================== Room socket index ====================

  registerRoomSocket(room: string, ws: AuthWs): void {
    const sid = ws.socketId;
    if (!room || !sid) return;
    let sockets = this.roomSockets.get(room);
    if (!sockets) {
      sockets = new Map<string, AuthWs>();
      this.roomSockets.set(room, sockets);
    }
    sockets.set(sid, ws);
    void this.safeRedis('socketRegistryRoom', () =>
      this.redis.hset(this.socketKey(sid), 'room', room),
    );
  }

  leaveRoomSocket(room: string, socketId: string | undefined): void {
    if (!room || !socketId) return;
    const sockets = this.roomSockets.get(room);
    if (!sockets) return;
    sockets.delete(socketId);
    if (sockets.size === 0) this.roomSockets.delete(room);
  }

  leaveAllRoomSockets(socketId: string | undefined): void {
    if (!socketId) return;
    for (const [room, sockets] of this.roomSockets) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        if (sockets.size === 0) this.roomSockets.delete(room);
      }
    }
  }

  getRoomSockets(room: string): AuthWs[] {
    const sockets = this.roomSockets.get(room);
    if (!sockets) return [];
    return [...sockets.values()];
  }

  // ==================== Socket registry (Redis) ====================

  private socketKey(socketId: string): string {
    return `socket:${socketId}`;
  }

  private userSocketsSetKey(userId: string): string {
    return `user:${userId}:sockets`;
  }

  private registerSocketRegistry(ws: AuthWs): void {
    const sid = ws.socketId;
    const userId = ws.userId;
    if (!sid || !userId) return;
    void this.safeRedis('socketRegistryWrite', () =>
      this.redis
        .multi()
        .hset(this.socketKey(sid), {
          userId,
          sessionId: ws.sessionId ?? '',
          deviceHash: ws.deviceTokenHash ?? '',
          userName: ws.userName ?? '',
          tier: ws.tier ?? 'FREE',
          instanceId: RealtimeGateway.INSTANCE_ID,
          ip: ws.clientIp ?? '',
          connectedAt: new Date().toISOString(),
        })
        .sadd(this.userSocketsSetKey(userId), sid)
        .expire(this.socketKey(sid), RealtimeGateway.SOCKET_REGISTRY_TTL)
        .exec(),
    );
  }

  private unregisterSocketRegistry(ws: AuthWs): void {
    const sid = ws.socketId;
    const userId = ws.userId;
    if (!sid) return;
    void this.safeRedis('socketRegistryRemoval', () =>
      this.redis
        .multi()
        .del(this.socketKey(sid))
        .srem(userId ? this.userSocketsSetKey(userId) : '', sid)
        .exec(),
    );
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
          JSON.stringify({ target: 'broadcastAll', frame, eid: this.newPublishEid() }),
        ),
      );
    }
  }

  broadcastToRoom(room: string, payload: Record<string, unknown>): void {
    const msg = JSON.stringify(payload);
    const sockets = this.roomSockets.get(room);
    if (sockets) {
      for (const client of sockets.values()) {
        if (client.readyState === WebSocket.OPEN) client.send(msg);
      }
    }
    if (!this.forwardingFromRedis) {
      void this.safeRedis('publish', () =>
        this.redis.publish(
          RealtimeGateway.WS_CHANNEL,
          JSON.stringify({ target: 'broadcastToRoom', room, frame: payload, eid: this.newPublishEid() }),
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
    // No direct userSockets.delete here: each socket's close handler clears
    // itself (and, for the last one, the user's bucket + online presence).
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

  private trackUserIp(userId: string, ip?: string): void {
    if (!ip) return;
    let ipMap = this.userIps.get(userId);
    if (!ipMap) {
      ipMap = new Map();
      this.userIps.set(userId, ipMap);
    }

    const isNewIp = !ipMap.has(ip);
    ipMap.set(ip, (ipMap.get(ip) || 0) + 1);

    if (isNewIp) {
      this.emitToUser(userId, {
        type: 'new-ip-detected',
        ip,
        activeIpCount: ipMap.size,
      });
    }

    const maxIps = this.config.get<number>('MAX_SAME_IP_SESSIONS', 5);
    if (ipMap.size > maxIps) {
      this.logger.warn({
        event: 'ws.same_ip_limit_exceeded',
        userId,
        ipCount: ipMap.size,
        maxIps,
        ips: Array.from(ipMap.keys()),
      });
    }
  }

  private untrackUserIp(userId: string, ip?: string): void {
    if (!ip) return;
    const ipMap = this.userIps.get(userId);
    if (!ipMap) return;
    const count = ipMap.get(ip) || 1;
    if (count <= 1) ipMap.delete(ip);
    else ipMap.set(ip, count - 1);
    if (ipMap.size === 0) this.userIps.delete(userId);
  }
}
