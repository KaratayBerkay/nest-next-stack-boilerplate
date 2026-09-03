import { SessionsResolver } from './sessions.resolver';
import { TokenStoreService } from '../auth/token-store.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { JwtUser } from '../auth/auth.types';
import { hashSessionId } from '../common/crypto/crypto.service';

describe('SessionsResolver', () => {
  let resolver: SessionsResolver;
  let mockTokenStore: {
    listSessionsWithKeys: jest.Mock;
    revokeSessionBySessionId: jest.Mock;
    revoke: jest.Mock;
    consumeMfaFresh: jest.Mock;
  };
  let mockGateway: { closeSocketsForSession: jest.Mock };
  let mockPrisma: {
    device: {
      findMany: jest.Mock;
      update: jest.Mock;
    };
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
      // Default: the session just passed MFA (the legitimate follow-up call).
      consumeMfaFresh: jest.fn().mockResolvedValue(true),
    };
    mockGateway = {
      closeSocketsForSession: jest.fn(),
    };
    mockPrisma = {
      device: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({}),
      },
    };

    resolver = new SessionsResolver(
      mockTokenStore as unknown as TokenStoreService,
      mockPrisma as never,
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
      mockPrisma.device.findMany.mockResolvedValue([
        { id: 'dev-1', trusted: true, type: 'MOBILE_ANDROID' },
      ]);

      const result = await resolver.mySessions(mockUser);

      expect(mockPrisma.device.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['dev-1'] } },
        select: { id: true, trusted: true, type: true },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        sessionId: hashSessionId('sess-1'),
        deviceId: 'dev-1',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        issuedAt: '2026-01-01T00:00:00Z',
        deviceType: 'MOBILE_ANDROID',
        trusted: true,
      });
      expect(result[1]).toEqual({
        sessionId: hashSessionId('sess-2'),
        deviceId: '',
        ip: undefined,
        userAgent: undefined,
        issuedAt: undefined,
        deviceType: undefined,
        trusted: undefined,
      });
      expect(mockTokenStore.listSessionsWithKeys).toHaveBeenCalledWith('u1');
    });

    it('returns sessions even when device enrichment fails', async () => {
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
      ]);
      mockPrisma.device.findMany.mockRejectedValue(
        new Error('db connection lost'),
      );

      const result = await resolver.mySessions(mockUser);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        sessionId: hashSessionId('sess-1'),
        deviceId: 'dev-1',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        issuedAt: '2026-01-01T00:00:00Z',
        deviceType: undefined,
        trusted: undefined,
      });
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

  describe('trustCurrentDevice', () => {
    it('marks the current device as trusted', async () => {
      mockTokenStore.listSessionsWithKeys.mockResolvedValue([
        {
          key: 'token-key-1',
          session: { sessionId: 'sess-1', deviceId: 'dev-1' },
        },
      ]);

      const result = await resolver.trustCurrentDevice(mockUser);

      expect(result).toBe(true);
    });

    it('returns false when session has no deviceId', async () => {
      mockTokenStore.listSessionsWithKeys.mockResolvedValue([
        {
          key: 'token-key-1',
          session: { sessionId: 'sess-1', deviceId: null },
        },
      ]);

      const result = await resolver.trustCurrentDevice(mockUser);

      expect(result).toBe(false);
    });

    // BE-030: no step-up meant any authenticated (possibly hijacked) session
    // could mark its device trusted and skip MFA on every future login.
    it('rejects a session that did not just pass MFA, without touching the device', async () => {
      mockTokenStore.consumeMfaFresh.mockResolvedValue(false);
      mockTokenStore.listSessionsWithKeys.mockResolvedValue([
        {
          key: 'token-key-1',
          session: { sessionId: 'sess-1', deviceId: 'dev-1' },
        },
      ]);

      await expect(resolver.trustCurrentDevice(mockUser)).rejects.toMatchObject(
        { response: { exc: 'EX_AUTH_MFA_STEP_UP_REQUIRED' } },
      );
      expect(mockTokenStore.consumeMfaFresh).toHaveBeenCalledWith('sess-1');
      expect(mockPrisma.device.update).not.toHaveBeenCalled();
    });

    it('rejects a session snapshot with no sessionId at all', async () => {
      await expect(
        resolver.trustCurrentDevice({ ...mockUser, sessionId: undefined }),
      ).rejects.toMatchObject({
        response: { exc: 'EX_AUTH_MFA_STEP_UP_REQUIRED' },
      });
      expect(mockTokenStore.consumeMfaFresh).not.toHaveBeenCalled();
    });

    it('the marker is single-use: a second call right after is rejected', async () => {
      mockTokenStore.consumeMfaFresh
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      mockTokenStore.listSessionsWithKeys.mockResolvedValue([
        {
          key: 'token-key-1',
          session: { sessionId: 'sess-1', deviceId: 'dev-1' },
        },
      ]);

      expect(await resolver.trustCurrentDevice(mockUser)).toBe(true);
      await expect(resolver.trustCurrentDevice(mockUser)).rejects.toMatchObject(
        { response: { exc: 'EX_AUTH_MFA_STEP_UP_REQUIRED' } },
      );
      expect(mockPrisma.device.update).toHaveBeenCalledTimes(1);
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
