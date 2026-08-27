import { createHash } from 'node:crypto';
import { RealtimeGateway, chainAfter } from './realtime.gateway';
import { RealtimePresenceService } from './realtime-presence.service';

describe('chainAfter', () => {
  it('runs the next task only after the previous one settles, even when the previous one resolves later — regression: WS frames were dispatched via a bare fire-and-forget handleMessage().catch(...), so two frames sent back to back on the same connection could finish (and broadcast/persist) out of the order the client actually sent them in', async () => {
    const order: string[] = [];
    let resolveFirst!: () => void;
    const first = () =>
      new Promise<void>((resolve) => {
        resolveFirst = () => {
          order.push('first');
          resolve();
        };
      });
    const second = () => {
      order.push('second');
      return Promise.resolve();
    };

    const chain1 = chainAfter(undefined, first, () => {});
    const chain2 = chainAfter(chain1, second, () => {});

    // `second` must not have run yet — `first` hasn't resolved.
    await Promise.resolve();
    await Promise.resolve();
    expect(order).toEqual([]);

    resolveFirst();
    await chain2;

    expect(order).toEqual(['first', 'second']);
  });

  it('reports a failure via onError without leaving the chain rejected — one bad frame must not jam every frame queued after it on the same connection', async () => {
    const onError = jest.fn();
    const chain1 = chainAfter(
      undefined,
      () => Promise.reject(new Error('boom')),
      onError,
    );
    await chain1;
    expect(onError).toHaveBeenCalledWith(new Error('boom'));

    const second = jest.fn().mockResolvedValue(undefined);
    await chainAfter(chain1, second, () => {});
    expect(second).toHaveBeenCalled();
  });
});

function mockCryptoService() {
  return {
    sha256: (value: string) => createHash('sha256').update(value).digest('hex'),
  };
}

interface MockWs {
  readyState: number;
  userId: string;
  sessionId: string;
  deviceTokenHash: string;
  authenticated: boolean;
  isAlive: boolean;
  send: jest.Mock;
  close: jest.Mock;
  tier?: string;
  registeredServices?: string[];
  tabClaims: Map<string, unknown>;
  [key: string]: unknown;
}

function makeWs(overrides: Record<string, unknown> = {}): MockWs {
  const send = jest.fn();
  const close = jest.fn();
  return {
    readyState: 1, // OPEN
    userId: 'u1',
    sessionId: 'sess-1',
    deviceTokenHash: 'hash-1',
    authenticated: true,
    isAlive: true,
    registeredServices: [],
    tabClaims: new Map(),
    send,
    close,
    ...overrides,
  };
}

function mockPresenceService(): RealtimePresenceService {
  return {
    // Resolved promises, not bare jest.fn(): the gateway invokes these
    // through safeRedis, which chains .catch() onto the return value —
    // an undefined return would crash the very cleanup paths under test.
    syncPresenceToRedis: jest.fn().mockResolvedValue(undefined),
    removePresenceFromRedis: jest.fn().mockResolvedValue(undefined),
    refreshPresenceTTL: jest.fn().mockResolvedValue(undefined),
  } as unknown as RealtimePresenceService;
}

function mockRedisClient() {
  return {
    publish: jest.fn().mockResolvedValue(0),
    multi: jest.fn().mockReturnValue({
      hset: jest.fn().mockReturnThis(),
      sadd: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      srem: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    }),
  };
}

describe('RealtimeGateway — public methods', () => {
  let gateway: RealtimeGateway;

  beforeEach(() => {
    gateway = new RealtimeGateway(
      {} as never, // HttpAdapterHost
      mockCryptoService() as never, // CryptoService
      mockPresenceService(),
      { get: jest.fn().mockReturnValue(5) } as never, // ConfigService
      mockRedisClient() as never, // REDIS_CLIENT
      {} as never, // REDIS_SUBSCRIBER
      {} as never, // SessionValidatorService
      {} as never, // WireCryptoService
    );
  });

  describe('emitToUser', () => {
    it('sends to all open sockets for a user', () => {
      const ws1 = makeWs();
      const ws2 = makeWs();
      (
        gateway as unknown as { userSockets: Map<string, Set<unknown>> }
      ).userSockets.set('u1', new Set([ws1, ws2]));

      const sent = gateway.emitToUser('u1', { type: 'test' });

      expect(sent).toBe(2);
      expect(ws1.send).toHaveBeenCalledWith(JSON.stringify({ type: 'test' }));
      expect(ws2.send).toHaveBeenCalledWith(JSON.stringify({ type: 'test' }));
    });

    it('returns 0 when user has no sockets', () => {
      expect(gateway.emitToUser('unknown', { type: 'test' })).toBe(0);
    });

    it('skips closed sockets', () => {
      const wsClosed = makeWs({ readyState: 3 }); // CLOSED
      const wsOpen = makeWs();
      (
        gateway as unknown as { userSockets: Map<string, Set<unknown>> }
      ).userSockets.set('u1', new Set([wsClosed, wsOpen]));

      const sent = gateway.emitToUser('u1', { type: 'test' });

      expect(sent).toBe(1);
      expect(wsOpen.send).toHaveBeenCalled();
      expect(wsClosed.send).not.toHaveBeenCalled();
    });
  });

  describe('emitToService', () => {
    it('sends to registered service connections', () => {
      const ws = makeWs();
      const serviceConns = (
        gateway as unknown as { serviceConnections: Map<string, Set<unknown>> }
      ).serviceConnections;
      serviceConns.set('NOTIFICATION:u1:hash-1', new Set([ws]));

      const deviceIndex = (
        gateway as unknown as { serviceDeviceIndex: Map<string, Set<string>> }
      ).serviceDeviceIndex;
      deviceIndex.set('NOTIFICATION:u1', new Set(['hash-1']));

      const sent = gateway.emitToService('u1', 'NOTIFICATION', {
        type: 'count',
        value: 5,
      });

      expect(sent).toBe(1);
      expect(ws.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'count', value: 5 }),
      );
    });

    it('returns 0 when no service connections exist', () => {
      expect(
        gateway.emitToService('u1', 'NOTIFICATION', { type: 'test' }),
      ).toBe(0);
    });
  });

  describe('hasServiceConnection', () => {
    it('returns true when user has registered the service', () => {
      const deviceIndex = (
        gateway as unknown as { serviceDeviceIndex: Map<string, Set<string>> }
      ).serviceDeviceIndex;
      deviceIndex.set('NOTIFICATION:u1', new Set(['hash-1']));

      expect(gateway.hasServiceConnection('u1', 'NOTIFICATION')).toBe(true);
    });

    it('returns false when no registration exists', () => {
      expect(gateway.hasServiceConnection('u1', 'NOTIFICATION')).toBe(false);
    });
  });

  describe('closeSocketsForSession', () => {
    it('closes open sockets matching the session', () => {
      const wsMatch = makeWs({ sessionId: 'sess-target', readyState: 1 });
      const wsOther = makeWs({ sessionId: 'sess-other', readyState: 1 });
      (
        gateway as unknown as { userSockets: Map<string, Set<unknown>> }
      ).userSockets.set('u1', new Set([wsMatch, wsOther]));

      const closed = gateway.closeSocketsForSession('u1', 'sess-target');

      expect(closed).toBe(1);
      expect(wsMatch.close).toHaveBeenCalledWith(1000, 'Session revoked');
      expect(wsOther.close).not.toHaveBeenCalled();
    });

    it('returns 0 when user has no sockets', () => {
      expect(gateway.closeSocketsForSession('u1', 'sess-1')).toBe(0);
    });
  });

  describe('updateUserTier', () => {
    it('updates tier on all user sockets and sends tier-changed frame', () => {
      const ws1 = makeWs({ tier: 'FREE' });
      const ws2 = makeWs({ tier: 'FREE' });
      (
        gateway as unknown as { userSockets: Map<string, Set<unknown>> }
      ).userSockets.set('u1', new Set([ws1, ws2]));

      gateway.updateUserTier('u1', 'PREMIUM');

      const expectedFrame = JSON.stringify({
        type: 'tier-changed',
        tier: 'PREMIUM',
      });
      expect(ws1.send).toHaveBeenCalledWith(expectedFrame);
      expect(ws2.send).toHaveBeenCalledWith(expectedFrame);
    });

    it('does nothing when user has no sockets', () => {
      expect(() => gateway.updateUserTier('unknown', 'PREMIUM')).not.toThrow();
    });
  });

  describe('getOnlineUserIds', () => {
    it('returns array of online user IDs', () => {
      const onlineCount = (
        gateway as unknown as { onlineCount: Map<string, number> }
      ).onlineCount;
      onlineCount.set('u1', 2);
      onlineCount.set('u2', 1);

      const ids = gateway.getOnlineUserIds();

      expect(ids).toContain('u1');
      expect(ids).toContain('u2');
      expect(ids).toHaveLength(2);
    });

    it('returns empty array when no users online', () => {
      expect(gateway.getOnlineUserIds()).toEqual([]);
    });
  });

  describe('registerHandler', () => {
    it('registers a frame handler', () => {
      const handler = jest.fn();
      gateway.registerHandler('chat', handler);

      const handlers = (
        gateway as unknown as { handlers: Map<string, unknown> }
      ).handlers;
      expect(handlers.get('chat')).toBe(handler);
    });

    it('throws when registering duplicate handler', () => {
      gateway.registerHandler('chat', jest.fn());
      expect(() => gateway.registerHandler('chat', jest.fn())).toThrow(
        'Handler for frame type "chat" is already registered',
      );
    });
  });

  describe('cleanupSocket', () => {
    const internal = () =>
      gateway as unknown as {
        cleanupSocket: (ws: MockWs, opts?: { silent?: boolean }) => void;
        userSockets: Map<string, Set<MockWs>>;
        deviceSockets: Map<string, MockWs>;
        onlineCount: Map<string, number>;
      };

    it('removes the socket from every index and decrements online count (last socket broadcasts user-offline)', () => {
      const ws = makeWs({ socketId: 'ws-hash-1' });
      const userSockets = internal().userSockets;
      const deviceSockets = internal().deviceSockets;
      userSockets.set('u1', new Set([ws]));
      deviceSockets.set('ws-hash-1', ws);
      internal().onlineCount.set('u1', 1);
      const broadcastAll = jest
        .spyOn(gateway, 'broadcastAll')
        .mockImplementation(() => undefined);

      internal().cleanupSocket(ws);

      expect(broadcastAll).toHaveBeenCalledWith({
        type: 'user-offline',
        userId: 'u1',
      });
      expect(userSockets.has('u1')).toBe(false);
      expect(deviceSockets.has('ws-hash-1')).toBe(false);
      expect(internal().onlineCount.has('u1')).toBe(false);
    });

    it('does not broadcast user-offline when silent (device replacement)', () => {
      const ws = makeWs({ socketId: 'ws-hash-1' });
      const userSockets = internal().userSockets;
      const deviceSockets = internal().deviceSockets;
      userSockets.set('u1', new Set([ws]));
      deviceSockets.set('ws-hash-1', ws);
      internal().onlineCount.set('u1', 1);
      const broadcastAll = jest
        .spyOn(gateway, 'broadcastAll')
        .mockImplementation(() => undefined);

      internal().cleanupSocket(ws, { silent: true });

      expect(broadcastAll).not.toHaveBeenCalled();
      expect(userSockets.has('u1')).toBe(false);
      expect(deviceSockets.has('ws-hash-1')).toBe(false);
    });

    it('keeps another online socket of the user online', () => {
      const ws = makeWs({ socketId: 'ws-hash-1' });
      const other = makeWs({ socketId: 'ws-hash-2' });
      internal().userSockets.set('u1', new Set([ws, other]));
      internal().deviceSockets.set('ws-hash-1', ws);
      internal().onlineCount.set('u1', 2);
      const broadcastAll = jest
        .spyOn(gateway, 'broadcastAll')
        .mockImplementation(() => undefined);

      internal().cleanupSocket(ws);

      expect(broadcastAll).not.toHaveBeenCalled();
      expect(internal().onlineCount.get('u1')).toBe(1);
      expect(internal().deviceSockets.has('ws-hash-1')).toBe(false);
    });

    it('is idempotent — a second call does not double-decrement', () => {
      const ws = makeWs({ socketId: 'ws-hash-1' });
      internal().userSockets.set('u1', new Set([ws]));
      internal().deviceSockets.set('ws-hash-1', ws);
      internal().onlineCount.set('u1', 1);
      const broadcastAll = jest
        .spyOn(gateway, 'broadcastAll')
        .mockImplementation(() => undefined);

      internal().cleanupSocket(ws);
      internal().cleanupSocket(ws);

      expect(broadcastAll).toHaveBeenCalledTimes(1);
      expect(internal().onlineCount.has('u1')).toBe(false);
    });
  });

  describe('replaceDeviceSocket (one-socket-per-device)', () => {
    const internal = () =>
      gateway as unknown as {
        replaceDeviceSocket: (ws: MockWs) => MockWs | undefined;
        deviceSockets: Map<string, MockWs>;
        userSockets: Map<string, Set<MockWs>>;
        onlineCount: Map<string, number>;
      };

    it('returns the previous socket and detaches+closes it', () => {
      const oldWs = makeWs({
        socketId: 'ws-hash-1',
        userId: 'u1',
        sessionId: 'sess-old',
      });
      const newWs = makeWs({
        socketId: 'ws-hash-1',
        userId: 'u1',
        sessionId: 'sess-new',
      });
      internal().deviceSockets.set('ws-hash-1', oldWs);
      internal().userSockets.set('u1', new Set([oldWs]));
      internal().onlineCount.set('u1', 1);

      const replaced = internal().replaceDeviceSocket(newWs);

      expect(replaced).toBe(oldWs);
      expect(oldWs.close).toHaveBeenCalledWith(1008, 'Device reconnected');
      expect((oldWs as MockWs & { detached?: boolean }).detached).toBe(true);
      // Old socket fully removed from indexes before the new one registers.
      expect(internal().userSockets.has('u1')).toBe(false);
      expect(internal().deviceSockets.has('ws-hash-1')).toBe(false);
      expect(internal().onlineCount.has('u1')).toBe(false);
    });

    it('returns undefined when the device has no existing socket', () => {
      const ws = makeWs({ socketId: 'ws-hash-1' });
      expect(internal().replaceDeviceSocket(ws)).toBeUndefined();
      expect(ws.close).not.toHaveBeenCalled();
    });

    it('returns undefined for a socket without a socketId (token-less fallback)', () => {
      const ws = makeWs({ socketId: undefined });
      expect(internal().replaceDeviceSocket(ws)).toBeUndefined();
      expect(ws.close).not.toHaveBeenCalled();
    });
  });
});

describe('emitToUserEncrypted / emitToRoomEncrypted — cross-replica republish', () => {
  let gateway: RealtimeGateway;
  let redis: ReturnType<typeof mockRedisClient>;
  let wireCrypto: { encryptForSession: jest.Mock };

  beforeEach(() => {
    redis = mockRedisClient();
    wireCrypto = {
      encryptForSession: jest
        .fn()
        .mockResolvedValue({ v: 2, nonce: 'n', ct: 'c' }),
    };
    gateway = new RealtimeGateway(
      {} as never,
      mockCryptoService() as never,
      mockPresenceService(),
      { get: jest.fn().mockReturnValue(5) } as never,
      redis as never,
      {} as never,
      {} as never,
      wireCrypto as never,
    );
  });

  it('emitToUserEncrypted republishes to Redis by default (a genuine local-originated send)', async () => {
    const ws = makeWs({ sessionId: 'sess-1' });
    (
      gateway as unknown as { userSockets: Map<string, Set<unknown>> }
    ).userSockets.set('u1', new Set([ws]));

    await gateway.emitToUserEncrypted('u1', { type: 'test' });

    expect(redis.publish).toHaveBeenCalled();
  });

  it("does NOT republish when fromRedis=true — regression: the Redis subscriber sets forwardingFromRedis=true, calls this method with `void` (fire-and-forget), then resets the flag to false in its own synchronous finally before this method's post-await continuation resumes. Reading that shared flag here (instead of an argument captured at call time) meant every cross-replica encrypted message got wrongly republished with a fresh eid the other replica had never seen — duplicating delivery and able to ping-pong indefinitely between replicas", async () => {
    const ws = makeWs({ sessionId: 'sess-1' });
    (
      gateway as unknown as { userSockets: Map<string, Set<unknown>> }
    ).userSockets.set('u1', new Set([ws]));

    await gateway.emitToUserEncrypted('u1', { type: 'test' }, true);

    expect(redis.publish).not.toHaveBeenCalled();
    // Local delivery must still happen — only the republish is suppressed.
    expect(ws.send).toHaveBeenCalled();
  });

  it('emitToRoomEncrypted republishes to Redis by default', async () => {
    const ws = makeWs({ sessionId: 'sess-1' });
    const roomMap = new Map([['sock-1', ws]]);
    (
      gateway as unknown as { roomSockets: Map<string, Map<string, unknown>> }
    ).roomSockets.set('general', roomMap);

    await gateway.emitToRoomEncrypted('general', { type: 'test' });

    expect(redis.publish).toHaveBeenCalled();
  });

  it('emitToRoomEncrypted does NOT republish when fromRedis=true — same regression as emitToUserEncrypted', async () => {
    const ws = makeWs({ sessionId: 'sess-1' });
    const roomMap = new Map([['sock-1', ws]]);
    (
      gateway as unknown as { roomSockets: Map<string, Map<string, unknown>> }
    ).roomSockets.set('general', roomMap);

    await gateway.emitToRoomEncrypted('general', { type: 'test' }, true);

    expect(redis.publish).not.toHaveBeenCalled();
    expect(ws.send).toHaveBeenCalled();
  });
});
