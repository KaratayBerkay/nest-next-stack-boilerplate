import { OutboxService } from './outbox.service';

interface MockPrismaService {
  $queryRaw: jest.Mock;
  $executeRaw: jest.Mock;
  outboxEvent: { create: jest.Mock; update: jest.Mock };
}

interface MockQueue {
  add: jest.Mock;
}

interface MockConfigService {
  get: (key: string, def?: string) => string | null;
}

function mockPrisma(): MockPrismaService {
  const queryRaw = jest.fn();
  const executeRaw = jest.fn().mockResolvedValue(0);
  const create = jest.fn();
  const update = jest.fn();
  return {
    $queryRaw: queryRaw,
    $executeRaw: executeRaw,
    outboxEvent: { create, update },
  };
}

function mockQueue(): MockQueue {
  const add = jest.fn();
  return { add };
}

function mockConfig(maxAttempts = '5'): MockConfigService {
  return {
    get: (key: string, def?: string) => {
      if (key === 'OUTBOX_MAX_ATTEMPTS') return maxAttempts;
      if (key === 'OUTBOX_POLL_MS') return '0';
      return def ?? null;
    },
  };
}

function claimedRow(overrides: { attempts?: number } = {}) {
  return {
    id: 'evt-1',
    eventType: 'user.signup',
    payload: {
      aggregateType: 'User',
      aggregateId: 'u1',
      eventType: 'user.signup',
      action: 'USER_CREATED',
    },
    attempts: overrides.attempts ?? 0,
  };
}

describe('OutboxService', () => {
  let prisma: MockPrismaService;
  let queue: MockQueue;
  let service: OutboxService;

  beforeEach(() => {
    prisma = mockPrisma();
    queue = mockQueue();
    service = new OutboxService(prisma, mockConfig(), queue);
  });

  describe('relayPendingEvents — DEAD_LETTER cutoff (claim path)', () => {
    it('moves event to DEAD_LETTER when attempts >= maxAttempts at claim time', async () => {
      prisma.$queryRaw.mockResolvedValue([claimedRow({ attempts: 5 })]);

      const published = await service.relayPendingEvents();

      expect(published).toBe(0);
      // Claim-time dead-lettering (row.attempts >= maxAttempts, before any publish
      // attempt) only sets status — no publishedAt/lastError, unlike the catch-path
      // dead-letter below which records lastError.
      expect(prisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-1' },
        data: { status: 'DEAD_LETTER' },
      });
      expect(queue.add).not.toHaveBeenCalled();
    });

    it('does not dead-letter when attempts is below maxAttempts', async () => {
      prisma.$queryRaw.mockResolvedValue([claimedRow({ attempts: 3 })]);
      queue.add.mockResolvedValue({});

      const published = await service.relayPendingEvents();

      expect(published).toBe(1);
      expect(prisma.outboxEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'evt-1' },
          data: expect.objectContaining({
            status: 'PUBLISHED',
            publishedAt: expect.any(Date) as never,
          }) as never,
        }) as never,
      );
      expect(queue.add).toHaveBeenCalled();
    });
  });

  describe('relayPendingEvents — DEAD_LETTER cutoff (catch path)', () => {
    it('moves to DEAD_LETTER when queue.add fails and newAttempts >= maxAttempts', async () => {
      prisma.$queryRaw.mockResolvedValue([claimedRow({ attempts: 4 })]);
      queue.add.mockRejectedValue(new Error('ECONNREFUSED'));

      const published = await service.relayPendingEvents();

      expect(published).toBe(0);
      expect(prisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-1' },
        data: {
          status: 'DEAD_LETTER',
          lastError: 'ECONNREFUSED',
        },
      });
    });

    it('releases back to PENDING when queue.add fails below maxAttempts', async () => {
      prisma.$queryRaw.mockResolvedValue([claimedRow({ attempts: 2 })]);
      queue.add.mockRejectedValue(new Error('ECONNREFUSED'));

      const published = await service.relayPendingEvents();

      expect(published).toBe(0);
      expect(prisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-1' },
        data: {
          status: 'PENDING',
          attempts: { increment: 1 },
          lastError: 'ECONNREFUSED',
        },
      });
    });
  });

  describe('relayPendingEvents — happy path', () => {
    it('publishes event and marks as PUBLISHED', async () => {
      prisma.$queryRaw.mockResolvedValue([claimedRow({ attempts: 0 })]);
      queue.add.mockResolvedValue({});

      const published = await service.relayPendingEvents();

      expect(published).toBe(1);
      expect(queue.add).toHaveBeenCalledWith(
        'user.signup',
        expect.objectContaining({
          outboxId: 'evt-1',
          event: expect.any(Object) as never,
        }) as never,
        expect.objectContaining({ removeOnComplete: 1000 }) as never,
      );
      expect(prisma.outboxEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'evt-1' },
          data: expect.objectContaining({
            status: 'PUBLISHED',
            publishedAt: expect.any(Date) as never,
          }) as never,
        }) as never,
      );
    });

    it('returns 0 when no pending events exist', async () => {
      prisma.$queryRaw.mockResolvedValue([]);

      const published = await service.relayPendingEvents();

      expect(published).toBe(0);
      expect(queue.add).not.toHaveBeenCalled();
    });
  });

  describe('relayPendingEvents — custom maxAttempts', () => {
    it('dead-letters at the configured threshold', async () => {
      const customPrisma = mockPrisma();
      const customQueue = mockQueue();
      const customService = new OutboxService(
        customPrisma,
        mockConfig('3'),
        customQueue,
      );
      customPrisma.$queryRaw.mockResolvedValue([claimedRow({ attempts: 3 })]);

      await customService.relayPendingEvents();

      expect(customPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-1' },
        data: { status: 'DEAD_LETTER' },
      });
      expect(customQueue.add).not.toHaveBeenCalled();
    });
  });

  describe('relayPendingEvents — stale PUBLISHING reclaim', () => {
    it('reclaims stale PUBLISHING rows before claiming new PENDING events', async () => {
      prisma.$executeRaw.mockResolvedValue(2);
      prisma.$queryRaw.mockResolvedValue([claimedRow({ attempts: 1 })]);
      queue.add.mockResolvedValue({});

      const published = await service.relayPendingEvents();

      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(published).toBe(1);
      expect(queue.add).toHaveBeenCalled();
    });

    it('proceeds normally when no stale rows exist', async () => {
      prisma.$executeRaw.mockResolvedValue(0);
      prisma.$queryRaw.mockResolvedValue([]);

      const published = await service.relayPendingEvents();

      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(published).toBe(0);
    });
  });
});
