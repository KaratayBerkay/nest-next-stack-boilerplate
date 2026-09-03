import { MessagingResolver } from './messaging.resolver';

describe('MessagingResolver', () => {
  let resolver: MessagingResolver;
  let mockMs: {
    getUsers: jest.Mock;
    getConversations: jest.Mock;
    getMessages: jest.Mock;
    sendAndDeliverMessage: jest.Mock;
    markConversationRead: jest.Mock;
    deleteMessageForMe: jest.Mock;
    deleteMessageForEveryone: jest.Mock;
  };
  let mockStorageCrypto: {
    encryptForStorage: jest.Mock;
    toEnvelope: jest.Mock;
    decryptForRoom: jest.Mock;
    decryptFromStorage: jest.Mock;
  };

  beforeEach(() => {
    mockMs = {
      getUsers: jest.fn().mockResolvedValue([]),
      getConversations: jest.fn().mockResolvedValue([]),
      getMessages: jest
        .fn()
        .mockResolvedValue({ messages: [], hasMore: false }),
      sendAndDeliverMessage: jest.fn().mockResolvedValue({
        message: { id: 'm1', body: 'hello' },
        delivery: { recipientPayload: {}, senderPayload: {} },
      }),
      markConversationRead: jest
        .fn()
        .mockResolvedValue({ readAt: '2026-01-01T00:00:00.000Z' }),
      deleteMessageForMe: jest.fn().mockResolvedValue({ id: 'm1' }),
      deleteMessageForEveryone: jest
        .fn()
        .mockResolvedValue({ id: 'm1', deletedAt: '2026-01-01T00:00:00.000Z' }),
    };
    mockStorageCrypto = {
      encryptForStorage: jest
        .fn()
        .mockResolvedValue({ v: 'storage-v1', nonce: 'sn', ct: 'sc' }),
      toEnvelope: jest.fn(),
      decryptForRoom: jest.fn(),
      decryptFromStorage: jest.fn(),
    };

    resolver = new MessagingResolver(
      mockMs as never,
      mockStorageCrypto as never,
    );
  });

  describe('sendMessage', () => {
    it('calls sendAndDeliverMessage with correct args', async () => {
      const user = { userId: 'u1', email: 'a@b.com' };
      const result = await resolver.sendMessage(user, {
        recipientId: 'u2',
        text: 'hello',
      });

      // No client envelope → no encryption here; the service encrypts the
      // plaintext for at-rest storage itself.
      expect(mockStorageCrypto.encryptForStorage).not.toHaveBeenCalled();
      expect(mockMs.sendAndDeliverMessage).toHaveBeenCalledWith(
        'u1',
        'u2',
        'hello',
        undefined,
        undefined,
        undefined,
        { text: 'hello', attachments: undefined },
        undefined,
      );
      expect(result).toEqual({ id: 'm1', body: 'hello' });
    });

    it('passes replyToId through when the input is a reply', async () => {
      const user = { userId: 'u1', email: 'a@b.com' };
      await resolver.sendMessage(user, {
        recipientId: 'u2',
        text: 'hello',
        replyToId: 'm0',
      });

      expect(mockMs.sendAndDeliverMessage).toHaveBeenCalledWith(
        'u1',
        'u2',
        'hello',
        undefined,
        undefined,
        undefined,
        { text: 'hello', attachments: undefined },
        'm0',
      );
    });

    it('passes attachments through as MessageAttachment array', async () => {
      const user = { userId: 'u1', email: 'a@b.com' };
      const attachments = [
        {
          url: 'https://cdn.example.com/uuid.pdf',
          type: 'application/pdf',
          name: 'report.pdf',
          storageEnvelope: undefined,
        },
      ];
      await resolver.sendMessage(user, {
        recipientId: 'u2',
        text: 'hello',
        attachments,
      });

      expect(mockMs.sendAndDeliverMessage).toHaveBeenCalledWith(
        'u1',
        'u2',
        'hello',
        undefined,
        attachments,
        undefined,
        { text: 'hello', attachments },
        undefined,
      );
    });

    it('passes a client-provided E2EE envelope through untouched', async () => {
      const user = { userId: 'u1', email: 'a@b.com' };
      const envelope = { v: 'e2ee-v1', nonce: 'n', ct: 'c' };
      await resolver.sendMessage(user, {
        recipientId: 'u2',
        text: '',
        envelope,
      });

      expect(mockMs.sendAndDeliverMessage).toHaveBeenCalledWith(
        'u1',
        'u2',
        '',
        undefined,
        undefined,
        envelope,
        { text: '', attachments: undefined },
        undefined,
      );
    });
  });

  describe('markMessagesRead', () => {
    it('calls markConversationRead with correct args', async () => {
      const user = { userId: 'u1', email: 'a@b.com' };
      await resolver.markMessagesRead(user, 'u2');

      expect(mockMs.markConversationRead).toHaveBeenCalledWith('u1', 'u2');
    });
  });

  describe('deleteMessageForMe', () => {
    it('delegates to the service and returns true', async () => {
      const user = { userId: 'u1', email: 'a@b.com' };
      const result = await resolver.deleteMessageForMe(user, 'm1');

      expect(mockMs.deleteMessageForMe).toHaveBeenCalledWith('u1', 'm1');
      expect(result).toBe(true);
    });
  });

  describe('deleteMessageForEveryone', () => {
    it('delegates to the service and returns true', async () => {
      const user = { userId: 'u1', email: 'a@b.com' };
      const result = await resolver.deleteMessageForEveryone(user, 'm1');

      expect(mockMs.deleteMessageForEveryone).toHaveBeenCalledWith('u1', 'm1');
      expect(result).toBe(true);
    });
  });

  describe('body (ResolveField)', () => {
    it('returns the decrypted body for a normal message', () => {
      const message = { v: 'v1', ct: 'ct1', nonce: 'n1', senderId: 'u1' };
      mockStorageCrypto.toEnvelope.mockReturnValue({
        v: 'v1',
        ct: 'ct1',
        nonce: 'n1',
      });
      mockStorageCrypto.decryptForRoom.mockReturnValue({ text: 'hi' });

      const result = resolver.body(
        message as never,
        {
          userId: 'u1',
          email: 'a@b.com',
        } as never,
      );

      expect(result).toBe('hi');
    });

    it('returns null without decrypting for a tombstoned message', () => {
      const message = {
        v: 'v1',
        ct: 'ct1',
        nonce: 'n1',
        senderId: 'u1',
        deletedAt: new Date(),
      };

      const result = resolver.body(
        message as never,
        {
          userId: 'u1',
          email: 'a@b.com',
        } as never,
      );

      expect(result).toBeNull();
      expect(mockStorageCrypto.toEnvelope).not.toHaveBeenCalled();
    });
  });

  // Regression: this @ResolveField didn't exist at all — `replyTo` is
  // @HideField()'d on the generated Message type with nothing resolving a
  // replacement, so every `conversationMessages` query that selected
  // `replyTo { ... }` (as the Flutter client's does) failed outright with
  // "Cannot query field \"replyTo\" on type \"Message\"." — a 400 on every
  // single load, not an intermittent auth/network issue.
  describe('replyTo (ResolveField)', () => {
    it('returns a decrypted reply preview when the message has one', () => {
      const replyTo = {
        id: 'r1',
        senderId: 'u2',
        v: 'v1',
        ct: 'ct1',
        nonce: 'n1',
        deletedAt: null,
        attachments: [],
      };
      const message = { id: 'm1', replyTo };
      mockStorageCrypto.toEnvelope.mockReturnValue({
        v: 'v1',
        ct: 'ct1',
        nonce: 'n1',
      });
      mockStorageCrypto.decryptForRoom.mockReturnValue({ text: 'quoted' });

      const result = resolver.replyTo(
        message as never,
        { userId: 'u1', email: 'a@b.com' } as never,
      );

      expect(result).toEqual({
        id: 'r1',
        senderId: 'u2',
        body: 'quoted',
        deletedAt: null,
        hasAttachments: false,
      });
    });

    it('returns null when the message is not a reply', () => {
      const message = { id: 'm1', replyTo: null };

      const result = resolver.replyTo(
        message as never,
        { userId: 'u1', email: 'a@b.com' } as never,
      );

      expect(result).toBeNull();
      expect(mockStorageCrypto.toEnvelope).not.toHaveBeenCalled();
    });
  });
});
