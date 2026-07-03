import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { CsrfGuard } from '../csrf/csrf.guard';
import { SessionAuthGuard } from './session-auth.guard';
import type { JwtUser } from './auth.types';

// Sessions surface (phase 4): mySessions + logoutOtherSessions.
// Only prisma.session and tokenStore.revokeAllForUser are exercised, so the
// remaining AuthService dependencies are inert stubs.

function createService(overrides: {
  findMany?: jest.Mock;
  deleteMany?: jest.Mock;
  revokeAllForUser?: jest.Mock;
}) {
  const prisma = {
    session: {
      findMany: overrides.findMany ?? jest.fn(),
      deleteMany: overrides.deleteMany ?? jest.fn(),
    },
  };
  const tokenStore = {
    revokeAllForUser: overrides.revokeAllForUser ?? jest.fn(),
  };
  const stub = {} as never;
  const service = new AuthService(
    prisma as never,
    stub, // jwt
    stub, // config
    stub, // crypto
    stub, // outbox
    stub, // mail
    stub, // devices
    tokenStore as never,
    stub, // hydration
    stub, // derivation
  );
  return { service, prisma, tokenStore };
}

describe('AuthService.findUserSessions', () => {
  const rows = [
    {
      id: 'sess-b',
      ip: '10.0.0.2',
      userAgent: 'Firefox',
      createdAt: new Date('2026-07-02T10:00:00Z'),
      expiresAt: new Date('2026-08-01T10:00:00Z'),
    },
    {
      id: 'sess-a',
      ip: '10.0.0.1',
      userAgent: 'Chrome',
      createdAt: new Date('2026-07-01T10:00:00Z'),
      expiresAt: new Date('2026-07-31T10:00:00Z'),
    },
  ];

  it('returns the user rows newest-first and marks the presented session current', async () => {
    const findMany = jest.fn().mockResolvedValue(rows);
    const { service } = createService({ findMany });

    const result = await service.findUserSessions('user-1', 'sess-a');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      }),
    );
    expect(result.map((r) => [r.id, r.current])).toEqual([
      ['sess-b', false],
      ['sess-a', true],
    ]);
  });

  it('marks nothing current when no session id is presented', async () => {
    const findMany = jest.fn().mockResolvedValue(rows);
    const { service } = createService({ findMany });

    const result = await service.findUserSessions('user-1');

    expect(result.every((r) => r.current === false)).toBe(true);
  });
});

describe('AuthService.logoutOtherSessions', () => {
  it('revokes all Redis keys first, then deletes every row but the current one', async () => {
    const revokeAllForUser = jest.fn().mockResolvedValue(2);
    const deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    const { service } = createService({ revokeAllForUser, deleteMany });

    await service.logoutOtherSessions('user-1', 'sess-a');

    expect(revokeAllForUser).toHaveBeenCalledWith('user-1');
    expect(deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', id: { not: 'sess-a' } },
    });
    // Redis revoke-all must land before the Postgres delete (design order).
    expect(revokeAllForUser.mock.invocationCallOrder[0]).toBeLessThan(
      deleteMany.mock.invocationCallOrder[0],
    );
  });

  it('deletes all rows when no current session id is presented', async () => {
    const deleteMany = jest.fn().mockResolvedValue({ count: 2 });
    const { service } = createService({ deleteMany });

    await service.logoutOtherSessions('user-1');

    expect(deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });
});

describe('AuthResolver sessions surface', () => {
  const user: JwtUser = {
    userId: 'user-1',
    email: 'a@b.com',
    role: 'USER',
    tier: 'FREE',
    sessionId: 'sess-a',
  } as JwtUser;

  it('mySessions delegates with the guard-attached session id', async () => {
    const auth = {
      findUserSessions: jest.fn().mockResolvedValue([]),
    };
    const resolver = new AuthResolver(auth as never);

    await resolver.mySessions(user);

    expect(auth.findUserSessions).toHaveBeenCalledWith('user-1', 'sess-a');
  });

  it('logoutOtherSessions delegates and resolves true', async () => {
    const auth = {
      logoutOtherSessions: jest.fn().mockResolvedValue(undefined),
    };
    const resolver = new AuthResolver(auth as never);

    await expect(resolver.logoutOtherSessions(user)).resolves.toBe(true);
    expect(auth.logoutOtherSessions).toHaveBeenCalledWith('user-1', 'sess-a');
  });

  it('guards: mySessions requires the session guard; logoutOtherSessions adds CSRF', () => {
    const mySessionsGuards = Reflect.getMetadata(
      '__guards__',
      AuthResolver.prototype.mySessions,
    ) as unknown[];
    const logoutOthersGuards = Reflect.getMetadata(
      '__guards__',
      AuthResolver.prototype.logoutOtherSessions,
    ) as unknown[];

    expect(mySessionsGuards).toContain(SessionAuthGuard);
    expect(logoutOthersGuards).toContain(CsrfGuard);
    expect(logoutOthersGuards).toContain(SessionAuthGuard);
  });
});
