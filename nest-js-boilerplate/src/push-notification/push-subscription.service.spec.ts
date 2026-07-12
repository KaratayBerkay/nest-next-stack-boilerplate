import { PushSubscriptionService } from './push-subscription.service';

interface MockPrisma {
  pushSubscription: {
    findUnique: jest.Mock;
    update: jest.Mock;
    create: jest.Mock;
    deleteMany: jest.Mock;
    findMany: jest.Mock;
  };
}

function mockPrisma(): MockPrisma {
  return {
    pushSubscription: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
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
    it('creates a new subscription when the endpoint is not already registered', async () => {
      prisma.pushSubscription.findUnique.mockResolvedValue(null);
      prisma.pushSubscription.create.mockResolvedValue({
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
      expect(prisma.pushSubscription.findUnique).toHaveBeenCalledWith({
        where: { endpoint: 'https://push.example.com/abc' },
      });
      expect(prisma.pushSubscription.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          endpoint: 'https://push.example.com/abc',
          p256dh: 'p256dh-key',
          auth: 'auth-secret',
          userAgent: 'Mozilla/5.0',
        },
      });
      expect(prisma.pushSubscription.update).not.toHaveBeenCalled();
    });

    it('re-keys an existing endpoint to the current user instead of duplicating it', async () => {
      // Browsers reuse the same push endpoint across logins/devices, and it can
      // legitimately belong to a different account than before (e.g. shared
      // device, re-login as someone else). subscribe() must upsert by endpoint.
      prisma.pushSubscription.findUnique.mockResolvedValue({
        id: 'existing-sub',
        userId: 'old-user',
        endpoint: 'https://push.example.com/shared',
      });
      prisma.pushSubscription.update.mockResolvedValue({
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
      expect(prisma.pushSubscription.update).toHaveBeenCalledWith({
        where: { id: 'existing-sub' },
        data: {
          p256dh: 'p256dh-new',
          auth: 'auth-new',
          userAgent: undefined,
          userId: 'new-user',
        },
      });
      expect(prisma.pushSubscription.create).not.toHaveBeenCalled();
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
