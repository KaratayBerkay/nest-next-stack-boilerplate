import { NotificationResolver } from './notification.resolver';
import { decryptId } from '../common/id-codec/id-codec';
import type { JwtUser } from '../auth/auth.types';

function buildUser(overrides: Partial<JwtUser> = {}): JwtUser {
  return {
    userId: 'u1',
    email: 'u1@example.com',
    role: 'USER',
    tier: 'FREE',
    ...overrides,
  };
}

describe('NotificationResolver', () => {
  const RAW_CALL_ID = '01890a5d-ac96-774b-bcce-b302099a8057';
  const RAW_ACTOR_ID = '01890a5d-ac96-774b-bcce-b302099a8058';

  function buildResolver(items: unknown[]) {
    const notificationService = {
      findByUser: jest.fn().mockResolvedValue(items),
    };
    const resolver = new NotificationResolver(notificationService as never);
    return { resolver, notificationService };
  }

  it('encrypts database-uuid fields embedded in the payload JSON blob — the GraphQL schema transformer only checks field names, it cannot see inside a JSON scalar, so a raw callId/postId would otherwise reach any authenticated client as-is', async () => {
    const { resolver } = buildResolver([
      {
        id: 'n1',
        type: 'MISSED_CALL',
        title: 'Missed call',
        body: null,
        payload: { kind: 'rtc-missed-call', callId: RAW_CALL_ID },
        createdAt: new Date('2024-01-01T00:00:00Z'),
        actor: null,
      },
    ]);

    const page = await resolver.myNotifications(buildUser());

    const payload = page.items[0].payload as { kind: string; callId: string };
    expect(payload.callId).not.toBe(RAW_CALL_ID);
    expect(decryptId(payload.callId)).toBe(RAW_CALL_ID);
    expect(payload.kind).toBe('rtc-missed-call');
  });

  it('leaves a null payload as an empty object rather than throwing', async () => {
    const { resolver } = buildResolver([
      {
        id: 'n1',
        type: 'SYSTEM',
        title: 'Welcome',
        body: null,
        payload: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        actor: null,
      },
    ]);

    const page = await resolver.myNotifications(buildUser());

    expect(page.items[0].payload).toEqual({});
  });

  it('still redacts a hidden avatar for a non-self actor (pre-existing behavior, unaffected by the payload fix)', async () => {
    const { resolver } = buildResolver([
      {
        id: 'n1',
        type: 'FRIEND_REQUEST',
        title: 'New friend request',
        body: null,
        payload: {},
        createdAt: new Date('2024-01-01T00:00:00Z'),
        actor: {
          id: RAW_ACTOR_ID,
          name: 'Actor',
          email: 'actor@example.com',
          hideAvatar: true,
          avatarUrl: 'https://example.com/avatar.png',
        },
      },
    ]);

    const page = await resolver.myNotifications(buildUser());

    expect(page.items[0].actor?.avatarUrl).toBeNull();
  });
});
