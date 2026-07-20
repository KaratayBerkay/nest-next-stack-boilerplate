import { MessagingDmService } from './messaging-dm.service';

describe('MessagingDmService', () => {
  let service: MessagingDmService;
  let mockRealtime: {
    emitToService: jest.Mock;
    emitToPage: jest.Mock;
    hasServiceConnection: jest.Mock;
  };
  let mockPush: { sendToUser: jest.Mock };
  let mockPrisma: {
    message: {
      create: jest.Mock;
      updateMany: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
      groupBy: jest.Mock;
    };
    user: { findMany: jest.Mock };
    $queryRawUnsafe: jest.Mock;
  };
  let mockCache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let areFriendsMock: jest.Mock;

  beforeEach(() => {
    mockRealtime = {
      emitToService: jest.fn(),
      emitToPage: jest.fn(),
      hasServiceConnection: jest.fn().mockReturnValue(true),
    };
    mockPush = { sendToUser: jest.fn().mockResolvedValue(undefined) };
    mockPrisma = {
      message: {
        create: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      user: { findMany: jest.fn() },
      $queryRawUnsafe: jest.fn().mockResolvedValue([]),
    };
    mockCache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      del: jest.fn().mockResolvedValue(undefined),
    };
    areFriendsMock = jest.fn();

    service = new MessagingDmService(
      mockPrisma as never,
      mockCache as never,
      mockRealtime as never,
      mockPush as never,
    );
  });

  describe('sendAndDeliverMessage', () => {
    it('sends message and delivers it', async () => {
      const fakeMessage = {
        id: 'm1',
        senderId: 'u1',
        recipientId: 'u2',
        body: 'hello',
        createdAt: new Date(),
        sender: { id: 'u1', name: 'Alice', email: 'a@b.com' },
      };
      mockPrisma.message.create.mockResolvedValue(fakeMessage);
      areFriendsMock.mockResolvedValue(true);
      mockPrisma.message.count.mockResolvedValue(0);

      const result = await service.sendAndDeliverMessage(
        'u1',
        'u2',
        'hello',
        areFriendsMock,
      );

      expect(mockPrisma.message.create).toHaveBeenCalledWith({
        data: { senderId: 'u1', recipientId: 'u2', body: 'hello' },
        include: { sender: { select: { id: true, name: true, email: true } } },
      });
      expect(mockRealtime.emitToService).toHaveBeenCalled();
      expect(mockRealtime.emitToPage).toHaveBeenCalled();
      expect(result.id).toBe('m1');
    });

    it('does not deliver when sendMessage throws', async () => {
      mockPrisma.message.create.mockRejectedValue(new Error('DB fail'));
      areFriendsMock.mockResolvedValue(true);

      await expect(
        service.sendAndDeliverMessage('u1', 'u2', 'hello', areFriendsMock),
      ).rejects.toThrow('DB fail');
      expect(mockRealtime.emitToService).not.toHaveBeenCalled();
    });
  });

  describe('markConversationRead', () => {
    it('marks read and emits full fan-out', async () => {
      mockPrisma.message.updateMany.mockResolvedValue({ count: 3 });
      mockPrisma.message.count.mockResolvedValue(0);

      const getPeerDisplay = jest.fn().mockResolvedValue({
        id: 'u2',
        email: 'b@b.com',
        name: 'Bob',
        avatar: 'BB',
      });

      const result = await service.markConversationRead(
        'u1',
        'u2',
        getPeerDisplay,
      );

      expect(mockPrisma.message.updateMany).toHaveBeenCalledWith({
        where: {
          senderId: 'u2',
          recipientId: 'u1',
          readAt: null,
        },
        data: { readAt: expect.any(Date) },
      });
      // Full fan-out assertions
      expect(mockRealtime.emitToPage).toHaveBeenCalledWith('u2', 'messages', {
        type: 'message-read',
        readerId: 'u1',
        senderId: 'u2',
        readAt: result.readAt,
        peerId: 'u1',
      });
      expect(mockRealtime.emitToService).toHaveBeenCalledWith('u2', 'MESSAGE', {
        type: 'message-read',
        readerId: 'u1',
        senderId: 'u2',
        readAt: result.readAt,
        peerId: 'u1',
      });
      expect(mockRealtime.emitToService).toHaveBeenCalledWith('u1', 'MESSAGE', {
        renew: 'Messages',
        type: 'Conversation',
        conversation: {
          user: { id: 'u2', email: 'b@b.com', name: 'Bob', avatar: 'BB' },
          unread: 0,
        },
      });
      expect(mockRealtime.emitToService).toHaveBeenCalledWith(
        'u1',
        'NOTIFICATION',
        {
          renew: 'Notifications',
          type: 'DmCount',
          value: 0,
        },
      );
      expect(result.readAt).toBeDefined();
    });

    it('works without getPeerDisplay (skips conversation renew)', async () => {
      mockPrisma.message.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.message.count.mockResolvedValue(0);

      await service.markConversationRead('u1', 'u2');

      // Without getPeerDisplay: emitToPage + emitToService message-read + DmCount
      expect(mockRealtime.emitToPage).toHaveBeenCalledTimes(1);
      expect(mockRealtime.emitToService).toHaveBeenCalledTimes(2);
      expect(mockRealtime.emitToService).toHaveBeenCalledWith(
        'u1',
        'NOTIFICATION',
        {
          renew: 'Notifications',
          type: 'DmCount',
          value: 0,
        },
      );
    });
  });
});
