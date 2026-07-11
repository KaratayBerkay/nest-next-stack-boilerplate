import { SessionsResolver } from './sessions.resolver';
import { TokenStoreService } from '../auth/token-store.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { JwtUser } from '../auth/auth.types';

describe('SessionsResolver', () => {
  let resolver: SessionsResolver;
  let mockTokenStore: {
    listSessionsWithKeys: jest.Mock;
    revokeSessionBySessionId: jest.Mock;
    revoke: jest.Mock;
  };
  let mockGateway: {
    closeSocketsForSession: jest.Mock;
  };

  const mockUser: JwtUser = {
    userId: 'u1',
    sessionId: 'sess-1',
    email: 'test@example.com',
    role: 'USER',
    tier: 'FREE',
    unread: 0,
  };

  beforeEach(() => {
    mockTokenStore = {
      listSessionsWithKeys: jest.fn(),
      revokeSessionBySessionId: jest.fn(),
      revoke: jest.fn(),
    };
    mockGateway = {
      closeSocketsForSession: jest.fn(),
    };

    resolver = new SessionsResolver(
      mockTokenStore as unknown as TokenStoreService,
      mockGateway as unknown as RealtimeGateway,
    );
  });

  describe('mySessions', () => {
    it('returns mapped session list', async () => {
      mockTokenStore.listSessionsWithKeys.mockResolvedValue([
        {
          key: 'token-key-1',
          session: {
            sessionId: 'sess-1',
            deviceId: 'dev-1',
            ip: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
            issuedAt: '2026-01-01T00:00:00Z',
          },
        },
        {
          key: 'token-key-2',
          session: {
            sessionId: 'sess-2',
            deviceId: null,
            ip: null,
            userAgent: null,
            issuedAt: null,
          },
        },
      ]);

      const result = await resolver.mySessions(mockUser);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        sessionId: 'sess-1',
        deviceId: 'dev-1',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        issuedAt: '2026-01-01T00:00:00Z',
      });
      expect(result[1]).toEqual({
        sessionId: 'sess-2',
        deviceId: '',
        ip: undefined,
        userAgent: undefined,
        issuedAt: undefined,
      });
      expect(mockTokenStore.listSessionsWithKeys).toHaveBeenCalledWith('u1');
    });

    it('returns empty array when no sessions', async () => {
      mockTokenStore.listSessionsWithKeys.mockResolvedValue([]);
      const result = await resolver.mySessions(mockUser);
      expect(result).toEqual([]);
    });
  });

  describe('revokeSession', () => {
    it('revokes session and closes sockets when found', async () => {
      mockTokenStore.revokeSessionBySessionId.mockResolvedValue(true);

      const result = await resolver.revokeSession(mockUser, 'sess-2');

      expect(result).toBe(true);
      expect(mockTokenStore.revokeSessionBySessionId).toHaveBeenCalledWith(
        'u1',
        'sess-2',
      );
      expect(mockGateway.closeSocketsForSession).toHaveBeenCalledWith(
        'u1',
        'sess-2',
      );
    });

    it('returns false and skips socket close when session not found', async () => {
      mockTokenStore.revokeSessionBySessionId.mockResolvedValue(false);

      const result = await resolver.revokeSession(mockUser, 'nonexistent');

      expect(result).toBe(false);
      expect(mockGateway.closeSocketsForSession).not.toHaveBeenCalled();
    });
  });

  describe('revokeAllOtherSessions', () => {
    it('revokes all sessions except current and closes their sockets', async () => {
      mockTokenStore.listSessionsWithKeys.mockResolvedValue([
        {
          key: 'key-1',
          session: { sessionId: 'sess-1', deviceId: 'd1' },
        },
        {
          key: 'key-2',
          session: { sessionId: 'sess-2', deviceId: 'd2' },
        },
        {
          key: 'key-3',
          session: { sessionId: 'sess-3', deviceId: 'd3' },
        },
      ]);
      mockTokenStore.revoke.mockResolvedValue(undefined);

      const result = await resolver.revokeAllOtherSessions(mockUser);

      expect(result).toBe(true);
      expect(mockTokenStore.revoke).toHaveBeenCalledTimes(2);
      expect(mockTokenStore.revoke).toHaveBeenCalledWith('key-2');
      expect(mockTokenStore.revoke).toHaveBeenCalledWith('key-3');
      expect(mockGateway.closeSocketsForSession).toHaveBeenCalledTimes(2);
      expect(mockGateway.closeSocketsForSession).toHaveBeenCalledWith(
        'u1',
        'sess-2',
      );
      expect(mockGateway.closeSocketsForSession).toHaveBeenCalledWith(
        'u1',
        'sess-3',
      );
    });

    it('returns false when no other sessions exist', async () => {
      mockTokenStore.listSessionsWithKeys.mockResolvedValue([
        {
          key: 'key-1',
          session: { sessionId: 'sess-1', deviceId: 'd1' },
        },
      ]);

      const result = await resolver.revokeAllOtherSessions(mockUser);

      expect(result).toBe(false);
      expect(mockTokenStore.revoke).not.toHaveBeenCalled();
      expect(mockGateway.closeSocketsForSession).not.toHaveBeenCalled();
    });
  });
});
