import { PushSubscriptionService } from './push-subscription.service';

interface MockPrisma {
  pushSubscription: {
    upsert: jest.Mock;
    deleteMany: jest.Mock;
    findMany: jest.Mock;
  };
}

function mockPrisma(): MockPrisma {
  return {
    pushSubscription: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
    },
  };
}

describe('PushSubscriptionService', () => {
  let service: PushSubscriptionService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = mockPrisma();
    service = new PushSubscriptionService(prisma as never);
  });

  describe('subscribe', () => {
    it('upserts by endpoint in a single atomic call — regression: the prior findUnique-then-create/update was a TOCTOU race where two concurrent subscribe() calls for the same endpoint (a service worker re-registering across two open tabs) could both see no existing row and both attempt create(), so the loser hit a raw 500 from the endpoint unique-constraint violation instead of its keys simply being saved', async () => {
      prisma.pushSubscription.upsert.mockResolvedValue({
        id: 'sub1',
        userId: 'u1',
        endpoint: 'https://push.example.com/abc',
      });

      const result = await service.subscribe(
        'u1',
        'https://push.example.com/abc',
        'p256dh-key',
        'auth-secret',
        'Mozilla/5.0',
      );

      expect(result.id).toBe('sub1');
      expect(prisma.pushSubscription.upsert).toHaveBeenCalledWith({
        where: { endpoint: 'https://push.example.com/abc' },
        create: {
          userId: 'u1',
          endpoint: 'https://push.example.com/abc',
          p256dh: 'p256dh-key',
          auth: 'auth-secret',
          userAgent: 'Mozilla/5.0',
        },
        update: {
          p256dh: 'p256dh-key',
          auth: 'auth-secret',
          userAgent: 'Mozilla/5.0',
          userId: 'u1',
        },
      });
    });

    it('re-keys an existing endpoint to the current user instead of duplicating it', async () => {
      // Browsers reuse the same push endpoint across logins/devices, and it can
      // legitimately belong to a different account than before (e.g. shared
      // device, re-login as someone else). subscribe() must upsert by endpoint.
      prisma.pushSubscription.upsert.mockResolvedValue({
        id: 'existing-sub',
        userId: 'new-user',
      });

      const result = await service.subscribe(
        'new-user',
        'https://push.example.com/shared',
        'p256dh-new',
        'auth-new',
      );

      expect(result.userId).toBe('new-user');
      const call = prisma.pushSubscription.upsert.mock.calls[0] as [
        { update: { userId: string } },
      ];
      expect(call[0].update.userId).toBe('new-user');
    });
  });

  describe('unsubscribe', () => {
    it('deletes only the matching (userId, endpoint) subscription', async () => {
      prisma.pushSubscription.deleteMany.mockResolvedValue({ count: 1 });

      await service.unsubscribe('u1', 'https://push.example.com/abc');

      expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1', endpoint: 'https://push.example.com/abc' },
      });
    });

    it('resolves without throwing when no matching subscription exists', async () => {
      prisma.pushSubscription.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.unsubscribe('u1', 'https://push.example.com/missing'),
      ).resolves.toBeUndefined();
    });
  });

  describe('findByUser', () => {
    it("returns all of the user's subscriptions", async () => {
      const subs = [
        { id: 's1', userId: 'u1', endpoint: 'https://a' },
        { id: 's2', userId: 'u1', endpoint: 'https://b' },
      ];
      prisma.pushSubscription.findMany.mockResolvedValue(subs);

      const result = await service.findByUser('u1');

      expect(result).toEqual(subs);
      expect(prisma.pushSubscription.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
    });

    it('returns an empty array when the user has no subscriptions', async () => {
      prisma.pushSubscription.findMany.mockResolvedValue([]);

      const result = await service.findByUser('u1');

      expect(result).toEqual([]);
    });
  });
});
