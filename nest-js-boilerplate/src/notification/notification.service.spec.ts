import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { TokenStoreService } from '../auth/token-store.service';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

interface MockNotificationPrisma {
  notification: {
    create: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
    updateMany: jest.Mock;
  };
}

function mockPrisma(): MockNotificationPrisma {
  const create = jest.fn();
  const findMany = jest.fn();
  const count = jest.fn();
  const updateMany = jest.fn();
  return { notification: { create, findMany, count, updateMany } };
}

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: MockNotificationPrisma;
  let mockRealtime: {
    emitToService: jest.Mock;
    hasServiceConnection: jest.Mock;
  };
  let mockPush: { sendToUser: jest.Mock };
  let mockTokenStore: {
    incrUnreadForUser: jest.Mock;
    rewriteFieldsForUser: jest.Mock;
  };

  beforeEach(() => {
    prisma = mockPrisma();
    mockRealtime = {
      emitToService: jest.fn(),
      hasServiceConnection: jest.fn().mockReturnValue(false),
    };
    mockPush = {
      sendToUser: jest.fn().mockResolvedValue(undefined),
    };
    mockTokenStore = {
      incrUnreadForUser: jest.fn().mockResolvedValue(undefined),
      rewriteFieldsForUser: jest.fn().mockResolvedValue(undefined),
    };
  });

  async function createService() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: RealtimeGateway, useValue: mockRealtime },
        { provide: PushNotificationService, useValue: mockPush },
        { provide: TokenStoreService, useValue: mockTokenStore },
      ],
    }).compile();
    return module.get(NotificationService);
  }

  describe('create', () => {
    it('creates notification, increments unread, emits via realtime, and sends push when no socket', async () => {
      service = await createService();
      const mockNotification = {
        id: 'n1',
        type: 'LIKE',
        title: 'New like',
        body: null,
        payload: {},
        createdAt: new Date('2026-01-01T00:00:00Z'),
        actor: {
          id: 'a1',
          name: 'Alice',
          email: 'alice@example.com',
          avatarUrl: null,
        },
      };
      prisma.notification.create.mockResolvedValue(mockNotification);
      prisma.notification.count.mockResolvedValue(3);

      const result = await service.create({
        userId: 'u1',
        actorId: 'a1',
        type: 'LIKE',
        title: 'New like',
      });

      expect(result.id).toBe('n1');
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          actorId: 'a1',
          type: 'LIKE',
          title: 'New like',
          body: undefined,
          payload: {},
        },
        include: { actor: true },
      });
      expect(mockTokenStore.incrUnreadForUser).toHaveBeenCalledWith('u1', 1);
      expect(mockRealtime.emitToService).toHaveBeenCalledTimes(2);
      // First emit: Item with notification data
      expect(mockRealtime.emitToService).toHaveBeenCalledWith(
        'u1',
        'NOTIFICATION',
        expect.objectContaining({
          renew: 'Notifications',
          type: 'Item',
        }),
      );
      // Second emit: Count
      expect(mockRealtime.emitToService).toHaveBeenCalledWith(
        'u1',
        'NOTIFICATION',
        expect.objectContaining({
          renew: 'Notifications',
          type: 'Count',
          value: 3,
        }),
      );
      // Push sent because no live NOTIFICATION socket
      expect(mockPush.sendToUser).toHaveBeenCalledWith(
        'u1',
        'New like',
        undefined,
        undefined,
        undefined,
      );
    });

    it('skips push when user has live NOTIFICATION socket', async () => {
      service = await createService();
      prisma.notification.create.mockResolvedValue({
        id: 'n2',
        type: 'COMMENT',
        title: 'New comment',
        body: 'Hello',
        payload: {},
        createdAt: new Date('2026-01-01T00:00:00Z'),
        actor: null,
      });
      prisma.notification.count.mockResolvedValue(1);
      mockRealtime.hasServiceConnection.mockReturnValue(true);

      await service.create({
        userId: 'u1',
        actorId: null,
        type: 'COMMENT',
        title: 'New comment',
        body: 'Hello',
      });

      expect(mockPush.sendToUser).not.toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('returns paginated notifications', async () => {
      service = await createService();
      const mockNotifications = [
        { id: 'n2', title: 'B' },
        { id: 'n1', title: 'A' },
      ];
      prisma.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await service.findByUser('u1', undefined, 10);

      expect(result).toEqual(mockNotifications);
      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        take: 11,
        where: { userId: 'u1' },
        orderBy: { createdAt: 'desc' },
        include: { actor: true },
      });
    });

    it('uses cursor when provided', async () => {
      service = await createService();
      prisma.notification.findMany.mockResolvedValue([]);

      await service.findByUser('u1', 'cursor-n1', 5);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        take: 6,
        skip: 1,
        cursor: { id: 'cursor-n1' },
        where: { userId: 'u1' },
        orderBy: { createdAt: 'desc' },
        include: { actor: true },
      });
    });
  });

  describe('unreadCount', () => {
    it('counts unread notifications', async () => {
      service = await createService();
      prisma.notification.count.mockResolvedValue(5);

      const result = await service.unreadCount('u1');

      expect(result).toBe(5);
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'u1', readAt: null },
      });
    });
  });

  describe('markRead', () => {
    it('marks notification as read and updates unread count', async () => {
      service = await createService();
      prisma.notification.updateMany.mockResolvedValue({ count: 1 });
      prisma.notification.count.mockResolvedValue(2);

      const result = await service.markRead('n1', 'u1');

      expect(result.count).toBe(1);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'n1', userId: 'u1' },
          data: expect.objectContaining({
            readAt: expect.any(Date) as never,
          }) as never,
        }) as never,
      );
      expect(mockTokenStore.rewriteFieldsForUser).toHaveBeenCalledWith('u1', {
        unread: '2',
      });
      expect(mockRealtime.emitToService).toHaveBeenCalledWith(
        'u1',
        'NOTIFICATION',
        expect.objectContaining({
          type: 'Count',
          value: 2,
        }),
      );
    });

    it('does not update unread when notification not found', async () => {
      service = await createService();
      prisma.notification.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.markRead('nonexistent', 'u1');

      expect(result.count).toBe(0);
      expect(mockTokenStore.rewriteFieldsForUser).not.toHaveBeenCalled();
      expect(mockRealtime.emitToService).not.toHaveBeenCalled();
    });
  });

  describe('markAllRead', () => {
    it('marks all as read and emits Count + Read events', async () => {
      service = await createService();
      prisma.notification.updateMany.mockResolvedValue({ count: 5 });
      prisma.notification.count.mockResolvedValue(0);

      await service.markAllRead('u1');

      expect(prisma.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1', readAt: null },
          data: expect.objectContaining({
            readAt: expect.any(Date) as never,
          }) as never,
        }) as never,
      );
      expect(mockTokenStore.rewriteFieldsForUser).toHaveBeenCalledWith('u1', {
        unread: '0',
      });
      expect(mockRealtime.emitToService).toHaveBeenCalledTimes(2);
      expect(mockRealtime.emitToService).toHaveBeenCalledWith(
        'u1',
        'NOTIFICATION',
        expect.objectContaining({ type: 'Count', value: 0 }),
      );
      expect(mockRealtime.emitToService).toHaveBeenCalledWith(
        'u1',
        'NOTIFICATION',
        expect.objectContaining({ type: 'Read' }),
      );
    });
  });
});
