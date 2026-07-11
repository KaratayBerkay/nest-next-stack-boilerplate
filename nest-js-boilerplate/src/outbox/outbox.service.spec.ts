import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { OutboxService } from './outbox.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { Queue } from 'bullmq';

function mockPrisma() {
  return {
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn().mockResolvedValue(0),
    outboxEvent: {
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;
}

function mockQueue() {
  return {
    add: jest.fn(),
  } as unknown as Queue;
}

function mockConfig(maxAttempts = '5') {
  return {
    get: (key: string, def?: string) => {
      if (key === 'OUTBOX_MAX_ATTEMPTS') return maxAttempts;
      if (key === 'OUTBOX_POLL_MS') return '0';
      return def ?? null;
    },
  } as unknown as ConfigService;
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
  let prisma: ReturnType<typeof mockPrisma>;
  let queue: ReturnType<typeof mockQueue>;
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
      expect(prisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-1' },
        data: { status: 'PUBLISHED', publishedAt: expect.any(Date) },
      });
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
        { outboxId: 'evt-1', event: expect.any(Object) },
        expect.objectContaining({ removeOnComplete: 1000 }),
      );
      expect(prisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-1' },
        data: { status: 'PUBLISHED', publishedAt: expect.any(Date) },
      });
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
});
