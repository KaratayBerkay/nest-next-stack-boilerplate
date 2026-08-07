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
    pendingUpload: { findMany: jest.Mock; updateMany: jest.Mock };
    messageAttachment: { findMany: jest.Mock };
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
      pendingUpload: {
        findMany: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      messageAttachment: { findMany: jest.fn().mockResolvedValue([]) },
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
      {
        decryptFromStorage: jest.fn(),
        encryptForStorage: jest
          .fn()
          .mockReturnValue({ v: 'storage-v1', nonce: 'sn', ct: 'sc' }),
        flattenEnvelope: jest.fn().mockReturnValue(null),
        toEnvelope: jest.fn(),
      } as never,
      {
        assertCanSendMessage: jest.fn().mockResolvedValue(undefined),
      } as never,
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
        attachments: [],
        sender: {
          id: 'u1',
          name: 'Alice',
          email: 'a@b.com',
          hideAvatar: false,
        },
        recipient: {
          id: 'u2',
          name: 'Bob',
          email: 'b@b.com',
          hideAvatar: false,
        },
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
        data: {
          senderId: 'u1',
          recipientId: 'u2',
          // Always encrypted at rest: plaintext never reaches the DB, and a
          // missing caller envelope is encrypted server-side into v/ct/nonce.
          v: 'storage-v1',
          ct: 'sc',
          nonce: 'sn',
          letterCount: 5,
          attachments: undefined,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              hideAvatar: true,
            },
          },
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              hideAvatar: true,
            },
          },
          attachments: true,
        },
      });
      expect(mockRealtime.emitToService).toHaveBeenCalled();
      expect(result.message.id).toBe('m1');
      expect(result.delivery).toHaveProperty('recipientPayload');
      expect(result.delivery).toHaveProperty('senderPayload');
    });

    it('resolves attachment envelopes from the server-side upload store, not the frame', async () => {
      const fakeMessage = {
        id: 'm1',
        senderId: 'u1',
        recipientId: 'u2',
        body: '',
        createdAt: new Date(),
        attachments: [],
        sender: {
          id: 'u1',
          name: 'Alice',
          email: 'a@b.com',
          hideAvatar: false,
        },
        recipient: {
          id: 'u2',
          name: 'Bob',
          email: 'b@b.com',
          hideAvatar: false,
        },
      };
      mockPrisma.message.create.mockResolvedValue(fakeMessage);
      mockPrisma.message.count.mockResolvedValue(0);
      areFriendsMock.mockResolvedValue(true);
      mockPrisma.pendingUpload.findMany.mockResolvedValue([
        {
          objectName: 'file-1.png',
          url: 'https://minio/uploads/file-1.png',
          v: 'storage-v1',
          nonce: 'n1',
          ct: 'c1',
          uploadedBy: 'u1',
          createdAt: new Date(),
        },
      ]);

      await service.sendAndDeliverMessage(
        'u1',
        'u2',
        '',
        areFriendsMock,
        undefined,
        undefined,
        [
          // The client frame no longer carries the full-file ciphertext —
          // only the small metadata.
          { url: 'https://minio/uploads/file-1.png', type: 'image/png', name: 'file-1.png' },
        ],
      );

      expect(mockPrisma.pendingUpload.findMany).toHaveBeenCalledWith({
        where: { url: { in: ['https://minio/uploads/file-1.png'] } },
      });
      expect(mockPrisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            attachments: {
              create: [
                {
                  url: 'https://minio/uploads/file-1.png',
                  type: 'image/png',
                  name: 'file-1.png',
                  thumbnailUrl: null,
                  v: 'storage-v1',
                  ct: 'c1',
                  nonce: 'n1',
                },
              ],
            },
          }),
        }),
      );
    });

    it('withholds the recipient avatarUrl when the recipient has hideAvatar set', async () => {
      const fakeMessage = {
        id: 'm2',
        senderId: 'u1',
        recipientId: 'u2',
        body: 'hi',
        createdAt: new Date(),
        attachments: [],
        sender: {
          id: 'u1',
          name: 'Alice',
          email: 'a@b.com',
          avatarUrl: 'https://x/alice.png',
          hideAvatar: false,
        },
        recipient: {
          id: 'u2',
          name: 'Bob',
          email: 'b@b.com',
          avatarUrl: 'https://x/bob.png',
          hideAvatar: true,
        },
      };
      mockPrisma.message.create.mockResolvedValue(fakeMessage);
      areFriendsMock.mockResolvedValue(true);
      mockPrisma.message.count.mockResolvedValue(0);

      const result = await service.sendAndDeliverMessage(
        'u1',
        'u2',
        'hi',
        areFriendsMock,
      );

      expect(result.message.recipient.avatarUrl).toBeNull();
      expect(result.message.sender.avatarUrl).toBe('https://x/alice.png');
      // This service backs a plain REST controller with no GraphQL-style
      // schema filtering — the raw preference flag must never reach the
      // JSON response, only its effect on avatarUrl.
      expect(result.message.recipient).not.toHaveProperty('hideAvatar');
      expect(result.message.sender).not.toHaveProperty('hideAvatar');
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

  describe('deliverDirectMessage', () => {
    it('echoes _tempId and the plaintext body in both wire payloads', async () => {
      mockPrisma.message.count.mockResolvedValue(0);

      const delivery = await service.deliverDirectMessage(
        {
          id: 'm1',
          senderId: 'u1',
          recipientId: 'u2',
          createdAt: new Date('2026-08-05T10:00:00Z'),
          sender: { id: 'u1', name: 'Alice', email: 'a@b.com' },
          _tempId: 'temp-123',
        },
        { text: 'hello', attachments: undefined },
      );

      expect(delivery.recipientPayload).toEqual({
        type: 'direct-message',
        message: expect.objectContaining({
          id: 'm1',
          senderId: 'u1',
          recipientId: 'u2',
          body: 'hello',
          _tempId: 'temp-123',
        }),
      });
      expect(delivery.senderPayload).toEqual({
        type: 'direct-message',
        message: expect.objectContaining({
          id: 'm1',
          senderId: 'u1',
          recipientId: 'u2',
          body: 'hello',
          _tempId: 'temp-123',
        }),
      });
    });

    it('omits _tempId when the message has none', async () => {
      mockPrisma.message.count.mockResolvedValue(0);

      const delivery = await service.deliverDirectMessage(
        {
          id: 'm1',
          senderId: 'u1',
          recipientId: 'u2',
          createdAt: new Date('2026-08-05T10:00:00Z'),
          sender: { id: 'u1', name: 'Alice', email: 'a@b.com' },
        },
        { text: 'hello' },
      );

      expect(delivery.recipientPayload.message).not.toHaveProperty('_tempId');
    });

    it('includes attachments in both wire payloads when present', async () => {
      mockPrisma.message.count.mockResolvedValue(0);

      const attachments = [
        {
          url: 'https://minio/x.png',
          type: 'image/png',
          name: 'x.png',
        },
        {
          url: 'https://minio/b.pdf',
          type: 'application/pdf',
          name: 'b.pdf',
          storageEnvelope: { v: 'storage-v1', nonce: 'an', ct: 'ac' },
        },
      ];

      const delivery = await service.deliverDirectMessage(
        {
          id: 'm1',
          senderId: 'u1',
          recipientId: 'u2',
          createdAt: new Date('2026-08-05T10:00:00Z'),
          sender: { id: 'u1', name: 'Alice', email: 'a@b.com' },
          attachments,
        },
        { text: '', attachments: undefined },
      );

      expect(delivery.recipientPayload.message).toEqual(
        expect.objectContaining({ attachments }),
      );
      expect(delivery.senderPayload.message).toEqual(
        expect.objectContaining({ attachments }),
      );
    });

    it('marks the sidebar-preview payload with hasAttachments so the recipient sidebar does not render it as a decrypt failure', async () => {
      mockPrisma.message.count.mockResolvedValue(0);

      await service.deliverDirectMessage(
        {
          id: 'm1',
          senderId: 'u1',
          recipientId: 'u2',
          createdAt: new Date('2026-08-05T10:00:00Z'),
          sender: { id: 'u1', name: 'Alice', email: 'a@b.com' },
          attachments: [
            { url: 'https://minio/x.png', type: 'image/png', name: 'x.png' },
          ],
        },
        { text: '', attachments: undefined },
      );

      expect(mockRealtime.emitToService).toHaveBeenCalledWith(
        'u2',
        'MESSAGE',
        expect.objectContaining({
          renew: 'Messages',
          type: 'Conversation',
          conversation: expect.objectContaining({
            lastMessage: '',
            hasAttachments: true,
          }),
        }),
      );
    });
  });

  describe('getConversations', () => {
    it('flags a peer whose latest message is attachment-only instead of masking it as a decrypt failure', async () => {
      mockPrisma.message.groupBy.mockResolvedValue([]);
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce([]) // sentMessages: u1 sent nothing to u2
        .mockResolvedValueOnce([
          {
            id: 'm1',
            senderId: 'u2',
            createdAt: new Date('2026-08-07T10:00:00Z'),
            v: 'v1',
            ct: 'ct1',
            nonce: 'n1',
            hasAttachments: true,
          },
        ]); // receivedMessages: u2's latest message to u1 is attachment-only
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: 'u2',
          email: 'u2@x.com',
          name: 'U2',
          avatarUrl: null,
          hideAvatar: false,
        },
      ]);

      const result = await service.getConversations('u1', () =>
        Promise.resolve(['u2']),
      );

      expect(result).toEqual([
        expect.objectContaining({
          lastMessage: '',
          hasAttachments: true,
        }),
      ]);
    });
  });

  describe('getMessages', () => {
    it('withholds avatarUrl and the raw hideAvatar flag for a peer who has hidden it', async () => {
      areFriendsMock.mockResolvedValue(true);
      mockPrisma.message.findMany.mockResolvedValue([
        {
          id: 'm1',
          senderId: 'u2',
          recipientId: 'u1',
          body: 'hi',
          createdAt: new Date(),
          attachments: [],
          sender: {
            id: 'u2',
            name: 'Bob',
            email: 'b@b.com',
            avatarUrl: 'https://x/bob.png',
            hideAvatar: true,
          },
          recipient: {
            id: 'u1',
            name: 'Alice',
            email: 'a@b.com',
            avatarUrl: 'https://x/alice.png',
            hideAvatar: false,
          },
        },
      ]);

      const { messages } = await service.getMessages(
        'u1',
        'u2',
        areFriendsMock,
      );

      expect(messages[0].sender.avatarUrl).toBeNull();
      expect(messages[0].sender).not.toHaveProperty('hideAvatar');
      expect(messages[0].recipient.avatarUrl).toBe('https://x/alice.png');
      expect(messages[0].recipient).not.toHaveProperty('hideAvatar');
    });
  });

  describe('getConversationAttachments', () => {
    it('short-circuits without querying the DB when the pair are not friends', async () => {
      areFriendsMock.mockResolvedValue(false);

      const result = await service.getConversationAttachments(
        'u1',
        'u2',
        areFriendsMock,
      );

      expect(result).toEqual({ attachments: [], hasMore: false });
      expect(mockPrisma.messageAttachment.findMany).not.toHaveBeenCalled();
    });

    it('queries both message directions, newest first, with an explicit select that excludes ciphertext', async () => {
      areFriendsMock.mockResolvedValue(true);
      mockPrisma.messageAttachment.findMany.mockResolvedValue([
        {
          id: 'a1',
          url: 'https://r2/x.pdf',
          thumbnailUrl: 'https://r2/x.thumb.webp',
          type: 'application/pdf',
          name: 'x.pdf',
          size: 1234,
          createdAt: new Date('2026-08-07T10:00:00Z'),
          messageId: 'm1',
        },
      ]);

      const result = await service.getConversationAttachments(
        'u1',
        'u2',
        areFriendsMock,
      );

      expect(mockPrisma.messageAttachment.findMany).toHaveBeenCalledWith({
        where: {
          message: {
            OR: [
              { senderId: 'u1', recipientId: 'u2' },
              { senderId: 'u2', recipientId: 'u1' },
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: {
          id: true,
          url: true,
          thumbnailUrl: true,
          type: true,
          name: true,
          size: true,
          createdAt: true,
          messageId: true,
        },
      });
      // No v/ct/nonce anywhere in the select — the full file ciphertext must
      // never leave the DB on a list call.
      const [[call]] = mockPrisma.messageAttachment.findMany.mock.calls;
      expect(call.select).not.toHaveProperty('v');
      expect(call.select).not.toHaveProperty('ct');
      expect(call.select).not.toHaveProperty('nonce');
      expect(result.attachments).toHaveLength(1);
      expect(result.hasMore).toBe(false);
    });

    it('applies the cursor and reports hasMore when a full page comes back', async () => {
      areFriendsMock.mockResolvedValue(true);
      const fullPage = Array.from({ length: 5 }, (_, i) => ({
        id: `a${i}`,
        url: `https://r2/${i}.png`,
        thumbnailUrl: null,
        type: 'image/png',
        name: `${i}.png`,
        size: 10,
        createdAt: new Date(),
        messageId: `m${i}`,
      }));
      mockPrisma.messageAttachment.findMany.mockResolvedValue(fullPage);

      const result = await service.getConversationAttachments(
        'u1',
        'u2',
        areFriendsMock,
        '2026-08-07T09:00:00Z',
        5,
      );

      expect(mockPrisma.messageAttachment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: { lt: new Date('2026-08-07T09:00:00Z') },
          }),
          take: 5,
        }),
      );
      expect(result.hasMore).toBe(true);
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
        data: { readAt: expect.any(Date) as never },
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
