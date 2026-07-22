import { RealtimeGateway } from './realtime.gateway';
import { RealtimePresenceService } from './realtime-presence.service';

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
    send,
    close,
    ...overrides,
  };
}

function mockPresenceService(): RealtimePresenceService {
  return {
    syncPresenceToRedis: jest.fn(),
    removePresenceFromRedis: jest.fn(),
    refreshPresenceTTL: jest.fn(),
  } as unknown as RealtimePresenceService;
}

describe('RealtimeGateway — public methods', () => {
  let gateway: RealtimeGateway;

  beforeEach(() => {
    const mockRedis = { publish: jest.fn().mockResolvedValue(0) };
    gateway = new RealtimeGateway(
      {} as never, // HttpAdapterHost
      {} as never, // JwtService
      {} as never, // TokenStoreService
      {} as never, // TokenDerivationService
      {} as never, // CryptoService
      mockPresenceService(),
      { get: jest.fn().mockReturnValue(5) } as never, // ConfigService
      mockRedis as never, // REDIS_CLIENT
      {} as never, // REDIS_SUBSCRIBER
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
});
