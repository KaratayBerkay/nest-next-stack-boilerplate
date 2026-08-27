import { MessagingDmService } from './messaging-dm.service';

describe('MessagingDmService', () => {
  let service: MessagingDmService;
  let mockRealtime: {
    emitToService: jest.Mock;
    emitToPage: jest.Mock;
    hasServiceConnection: jest.Mock;
    emitToUserEncrypted: jest.Mock;
  };
  let mockPush: { sendToUser: jest.Mock };
  let mockPrisma: {
    message: {
      create: jest.Mock;
      updateMany: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      groupBy: jest.Mock;
    };
    messageDeletion: { upsert: jest.Mock };
    favoriteConversation: {
      upsert: jest.Mock;
      deleteMany: jest.Mock;
      findMany: jest.Mock;
    };
    pendingUpload: { findMany: jest.Mock; updateMany: jest.Mock };
    messageAttachment: { findMany: jest.Mock };
    user: { findMany: jest.Mock };
    $queryRawUnsafe: jest.Mock;
    $transaction: jest.Mock;
  };
  let mockCache: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let areFriendsMock: jest.Mock;

  beforeEach(() => {
    mockRealtime = {
      emitToService: jest.fn(),
      emitToPage: jest.fn(),
      hasServiceConnection: jest.fn().mockReturnValue(true),
      emitToUserEncrypted: jest.fn().mockResolvedValue(undefined),
    };
    mockPush = { sendToUser: jest.fn().mockResolvedValue(undefined) };
    mockPrisma = {
      message: {
        create: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      messageDeletion: { upsert: jest.fn().mockResolvedValue(undefined) },
      favoriteConversation: {
        upsert: jest.fn().mockResolvedValue(undefined),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      user: { findMany: jest.fn() },
      pendingUpload: {
        findMany: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      messageAttachment: { findMany: jest.fn().mockResolvedValue([]) },
      $queryRawUnsafe: jest.fn().mockResolvedValue([]),
      $transaction: jest.fn(),
    };
    // Interactive $transaction: run the callback with `tx` === this same
    // mock, matching this repo's established Prisma-mock convention (see
    // comment.service.spec.ts / billing.service.spec.ts).
    mockPrisma.$transaction.mockImplementation(
      (cb: (tx: typeof mockPrisma) => unknown) => cb(mockPrisma),
    );
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
          replyToId: null,
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
          replyTo: { include: { attachments: true } },
        },
      });
      expect(mockRealtime.emitToService).toHaveBeenCalled();
      expect(result.message.id).toBe('m1');
      expect(result.delivery).toHaveProperty('recipientPayload');
      expect(result.delivery).toHaveProperty('senderPayload');
    });

    it('reports the unread count as-is, not +1 — regression: getUnreadCount() queries AFTER the message was already created and committed by sendMessage(), so its result already includes the message just sent; adding 1 on top inflated the recipient-side conversation badge by one on every send', async () => {
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
      // 3 unread messages from u1 to u2 already exist (this new one included,
      // since count() runs after the create commits).
      mockPrisma.message.count.mockResolvedValue(3);

      await service.sendAndDeliverMessage('u1', 'u2', 'hello', areFriendsMock);

      const call = mockRealtime.emitToService.mock.calls[0] as [
        string,
        string,
        { conversation: { unread: number } },
      ];
      expect(call[0]).toBe('u2');
      expect(call[2].conversation.unread).toBe(3);
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
          kind: 'MESSAGES',
          scopeId: 'u1',
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
          {
            url: 'https://minio/uploads/file-1.png',
            type: 'image/png',
            name: 'file-1.png',
          },
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
                },
              ],
            },
          }),
        }),
      );
    });

    it('creates the message and relinks its PendingUpload rows inside the same transaction — regression: these were two separate top-level writes, so a crash/transient error between them left the message saved and visible to the sender while every OTHER recipient got a 404 trying to view the attachment (assertCanAccessUpload only lets the uploader through when messageId is still null)', async () => {
      const fakeMessage = {
        id: 'm1',
        senderId: 'u1',
        recipientId: 'u2',
        attachments: [],
        replyTo: null,
        sender: {
          id: 'u1',
          name: 'Alice',
          email: 'a@a.com',
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
          kind: 'MESSAGES',
          scopeId: 'u1',
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
          {
            url: 'https://minio/uploads/file-1.png',
            type: 'image/png',
            name: 'file-1.png',
          },
        ],
      );

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrisma.pendingUpload.updateMany).toHaveBeenCalledWith({
        where: { url: { in: ['https://minio/uploads/file-1.png'] } },
        data: { messageId: 'm1' },
      });
      // The create must run (and the id it produces be used) inside the
      // same transaction call, not a bare top-level create racing the relink.
      expect(
        mockPrisma.message.create.mock.invocationCallOrder[0],
      ).toBeLessThan(
        mockPrisma.pendingUpload.updateMany.mock.invocationCallOrder[0],
      );
    });

    it('does not hydrate or re-link an attachment uploaded by someone else', async () => {
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
      // Row exists, but it was uploaded by a different user (u2) — u1 merely
      // saw this url in a message u2 sent them and is trying to attach it to
      // a message of their own.
      mockPrisma.pendingUpload.findMany.mockResolvedValue([
        {
          objectName: 'file-1.png',
          url: 'https://minio/uploads/file-1.png',
          v: 'storage-v1',
          nonce: 'n1',
          ct: 'c1',
          uploadedBy: 'u2',
          kind: 'MESSAGES',
          scopeId: 'u2',
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
          {
            url: 'https://minio/uploads/file-1.png',
            type: 'image/png',
            name: 'file-1.png',
          },
        ],
      );

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
                },
              ],
            },
          }),
        }),
      );
      expect(mockPrisma.pendingUpload.updateMany).not.toHaveBeenCalled();
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

    it('renders a tombstoned latest message as the [Deleted] sentinel instead of decrypting it', async () => {
      mockPrisma.message.groupBy.mockResolvedValue([]);
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce([]) // sentMessages
        .mockResolvedValueOnce([
          {
            id: 'm1',
            senderId: 'u2',
            createdAt: new Date('2026-08-07T10:00:00Z'),
            v: 'v1',
            ct: 'ct1',
            nonce: 'n1',
            deletedAt: new Date('2026-08-07T10:05:00Z'),
            hasAttachments: true,
          },
        ]);
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
          lastMessage: '[Deleted]',
          hasAttachments: false,
        }),
      ]);
    });

    it('excludes messages this viewer deleted-for-me from the DISTINCT ON queries', async () => {
      mockPrisma.message.groupBy.mockResolvedValue([]);
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);
      mockPrisma.user.findMany.mockResolvedValue([]);

      await service.getConversations('u1', () => Promise.resolve(['u2']));

      const [sentSql] = mockPrisma.$queryRawUnsafe.mock.calls[0];
      const [receivedSql] = mockPrisma.$queryRawUnsafe.mock.calls[1];
      expect(sentSql).toContain('NOT EXISTS');
      expect(sentSql).toContain('"MessageDeletion"');
      expect(receivedSql).toContain('NOT EXISTS');
      expect(receivedSql).toContain('"MessageDeletion"');
    });

    it('marks a peer as favorite only when a FavoriteConversation row exists for this viewer', async () => {
      mockPrisma.message.groupBy.mockResolvedValue([]);
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce([]) // sentMessages
        .mockResolvedValueOnce([
          {
            id: 'm1',
            senderId: 'u2',
            createdAt: new Date('2026-08-07T10:00:00Z'),
            v: 'v1',
            ct: 'ct1',
            nonce: 'n1',
            hasAttachments: false,
          },
          {
            id: 'm2',
            senderId: 'u3',
            createdAt: new Date('2026-08-07T09:00:00Z'),
            v: 'v1',
            ct: 'ct1',
            nonce: 'n1',
            hasAttachments: false,
          },
        ]); // receivedMessages
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: 'u2',
          email: 'u2@x.com',
          name: 'U2',
          avatarUrl: null,
          hideAvatar: false,
        },
        {
          id: 'u3',
          email: 'u3@x.com',
          name: 'U3',
          avatarUrl: null,
          hideAvatar: false,
        },
      ]);
      mockPrisma.favoriteConversation.findMany.mockResolvedValue([
        { peerId: 'u2' },
      ]);

      const result = await service.getConversations('u1', () =>
        Promise.resolve(['u2', 'u3']),
      );

      expect(mockPrisma.favoriteConversation.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1', peerId: { in: ['u2', 'u3'] } },
        select: { peerId: true },
      });
      expect(result.find((c) => c.user.id === 'u2')?.favorite).toBe(true);
      expect(result.find((c) => c.user.id === 'u3')?.favorite).toBe(false);
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

    it('excludes rows this viewer deleted-for-me via the where clause', async () => {
      areFriendsMock.mockResolvedValue(true);
      mockPrisma.message.findMany.mockResolvedValue([]);

      await service.getMessages('u1', 'u2', areFriendsMock);

      expect(mockPrisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletions: { none: { userId: 'u1' } },
          }),
        }),
      );
    });

    it('strips attachments from a tombstoned row instead of decrypting/wiring them', async () => {
      areFriendsMock.mockResolvedValue(true);
      const baseUser = {
        id: 'u2',
        name: 'Bob',
        email: 'b@b.com',
        avatarUrl: null,
        hideAvatar: false,
      };
      mockPrisma.message.findMany.mockResolvedValue([
        {
          id: 'm1',
          senderId: 'u2',
          recipientId: 'u1',
          createdAt: new Date(),
          deletedAt: new Date(),
          attachments: [{ url: 'https://r2/x.pdf' }],
          sender: baseUser,
          recipient: { ...baseUser, id: 'u1', name: 'Alice' },
        },
      ]);

      const { messages } = await service.getMessages(
        'u1',
        'u2',
        areFriendsMock,
      );

      expect(messages[0].attachments).toEqual([]);
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
            deletedAt: null,
            deletions: { none: { userId: 'u1' } },
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

  describe('setFavorite', () => {
    it("upserts a FavoriteConversation row and busts only the actor's cache when favoriting", async () => {
      const result = await service.setFavorite('u1', 'u2', true);

      expect(mockPrisma.favoriteConversation.upsert).toHaveBeenCalledWith({
        where: { userId_peerId: { userId: 'u1', peerId: 'u2' } },
        create: { userId: 'u1', peerId: 'u2' },
        update: {},
      });
      expect(mockPrisma.favoriteConversation.deleteMany).not.toHaveBeenCalled();
      expect(mockCache.del).toHaveBeenCalledWith('conversations:u1');
      expect(mockCache.del).not.toHaveBeenCalledWith('conversations:u2');
      expect(result).toEqual({ favorite: true });
    });

    it('deletes the FavoriteConversation row when unfavoriting', async () => {
      const result = await service.setFavorite('u1', 'u2', false);

      expect(mockPrisma.favoriteConversation.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1', peerId: 'u2' },
      });
      expect(mockPrisma.favoriteConversation.upsert).not.toHaveBeenCalled();
      expect(mockCache.del).toHaveBeenCalledWith('conversations:u1');
      expect(result).toEqual({ favorite: false });
    });
  });

  describe('deleteMessageForMe', () => {
    it('throws NotFoundException when the message does not exist or the user is not a party to it', async () => {
      mockPrisma.message.findFirst.mockResolvedValue(null);

      await expect(service.deleteMessageForMe('u1', 'm1')).rejects.toThrow(
        'Message not found',
      );
    });

    it('upserts the deletion row, invalidates only the actor cache, and syncs only the actor', async () => {
      mockPrisma.message.findFirst
        .mockResolvedValueOnce({
          id: 'm1',
          senderId: 'u1',
          recipientId: 'u2',
        })
        // getLatestPreviewForPeer's lookup — no visible messages left.
        .mockResolvedValueOnce(null);

      const result = await service.deleteMessageForMe('u1', 'm1');

      expect(mockPrisma.messageDeletion.upsert).toHaveBeenCalledWith({
        where: { messageId_userId: { messageId: 'm1', userId: 'u1' } },
        create: { messageId: 'm1', userId: 'u1' },
        update: {},
      });
      expect(mockCache.del).toHaveBeenCalledWith('conversations:u1');
      expect(mockCache.del).not.toHaveBeenCalledWith('conversations:u2');
      expect(mockRealtime.emitToService).toHaveBeenCalledWith('u1', 'MESSAGE', {
        renew: 'Messages',
        type: 'ConversationRemoved',
        peerId: 'u2',
      });
      // Only the actor's own connections are synced — the peer never learns
      // this happened.
      expect(mockRealtime.emitToUserEncrypted).toHaveBeenCalledTimes(1);
      expect(mockRealtime.emitToUserEncrypted).toHaveBeenCalledWith('u1', {
        type: 'message-deleted',
        scope: 'me',
        messageId: 'm1',
        peerId: 'u2',
      });
      expect(result).toEqual({ id: 'm1' });
    });

    it('derives the peer as the sender when the actor is the recipient', async () => {
      mockPrisma.message.findFirst
        .mockResolvedValueOnce({
          id: 'm1',
          senderId: 'u2',
          recipientId: 'u1',
        })
        .mockResolvedValueOnce(null);

      await service.deleteMessageForMe('u1', 'm1');

      expect(mockRealtime.emitToUserEncrypted).toHaveBeenCalledWith('u1', {
        type: 'message-deleted',
        scope: 'me',
        messageId: 'm1',
        peerId: 'u2',
      });
    });

    it('is idempotent — upsert absorbs a repeat delete without throwing', async () => {
      mockPrisma.message.findFirst
        .mockResolvedValueOnce({ id: 'm1', senderId: 'u1', recipientId: 'u2' })
        .mockResolvedValueOnce(null);

      await expect(service.deleteMessageForMe('u1', 'm1')).resolves.toEqual({
        id: 'm1',
      });
    });
  });

  describe('deleteMessageForEveryone', () => {
    const recent = (msAgo: number) => new Date(Date.now() - msAgo);

    it('throws NotFoundException when the message does not exist', async () => {
      mockPrisma.message.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteMessageForEveryone('u1', 'm1'),
      ).rejects.toThrow('Message not found');
    });

    it('throws ForbiddenException when the caller is not the sender', async () => {
      mockPrisma.message.findUnique.mockResolvedValue({
        id: 'm1',
        senderId: 'u1',
        recipientId: 'u2',
        createdAt: recent(1000),
        deletedAt: null,
      });

      await expect(
        service.deleteMessageForEveryone('u2', 'm1'),
      ).rejects.toThrow('Only the sender can delete this message for everyone');
      expect(mockPrisma.message.update).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException once the delete window has expired', async () => {
      mockPrisma.message.findUnique.mockResolvedValue({
        id: 'm1',
        senderId: 'u1',
        recipientId: 'u2',
        createdAt: recent(16 * 60 * 1000), // 16 minutes ago > 15-minute window
        deletedAt: null,
      });

      await expect(
        service.deleteMessageForEveryone('u1', 'm1'),
      ).rejects.toThrow('Delete window has expired');
      expect(mockPrisma.message.update).not.toHaveBeenCalled();
    });

    it('tombstones the message and notifies both parties identically', async () => {
      mockPrisma.message.findUnique.mockResolvedValue({
        id: 'm1',
        senderId: 'u1',
        recipientId: 'u2',
        createdAt: recent(1000),
        deletedAt: null,
      });
      mockPrisma.message.update.mockResolvedValue(undefined);
      // getLatestPreviewForPeer runs once per side — no visible messages left.
      mockPrisma.message.findFirst.mockResolvedValue(null);

      const result = await service.deleteMessageForEveryone('u1', 'm1');

      expect(mockPrisma.message.update).toHaveBeenCalledWith({
        where: { id: 'm1' },
        data: { deletedAt: expect.any(Date) },
      });
      expect(mockCache.del).toHaveBeenCalledWith('conversations:u1');
      expect(mockCache.del).toHaveBeenCalledWith('conversations:u2');

      const expectedFrame = {
        type: 'message-deleted',
        scope: 'everyone',
        messageId: 'm1',
        senderId: 'u1',
        recipientId: 'u2',
        deletedAt: result.deletedAt,
      };
      expect(mockRealtime.emitToUserEncrypted).toHaveBeenCalledWith(
        'u1',
        expectedFrame,
      );
      expect(mockRealtime.emitToUserEncrypted).toHaveBeenCalledWith(
        'u2',
        expectedFrame,
      );
      expect(result).toEqual({ id: 'm1', deletedAt: expect.any(String) });
    });

    it('is idempotent — a second call on an already-tombstoned message is a harmless no-op', async () => {
      const alreadyDeletedAt = recent(20 * 60 * 1000); // outside the window,
      // but that guard is skipped once deletedAt is already set.
      mockPrisma.message.findUnique.mockResolvedValue({
        id: 'm1',
        senderId: 'u1',
        recipientId: 'u2',
        createdAt: recent(30 * 60 * 1000),
        deletedAt: alreadyDeletedAt,
      });
      mockPrisma.message.findFirst.mockResolvedValue(null);

      const result = await service.deleteMessageForEveryone('u1', 'm1');

      expect(mockPrisma.message.update).not.toHaveBeenCalled();
      expect(result.deletedAt).toBe(alreadyDeletedAt.toISOString());
    });
  });
});
