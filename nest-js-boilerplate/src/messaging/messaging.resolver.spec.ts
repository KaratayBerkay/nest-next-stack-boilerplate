import { MessagingResolver } from './messaging.resolver';

describe('MessagingResolver', () => {
  let resolver: MessagingResolver;
  let mockMs: {
    getUsers: jest.Mock;
    getConversations: jest.Mock;
    getMessages: jest.Mock;
    sendAndDeliverMessage: jest.Mock;
    markConversationRead: jest.Mock;
  };
  let mockStorageCrypto: {
    encryptForStorage: jest.Mock;
  };

  beforeEach(() => {
    mockMs = {
      getUsers: jest.fn().mockResolvedValue([]),
      getConversations: jest.fn().mockResolvedValue([]),
      getMessages: jest
        .fn()
        .mockResolvedValue({ messages: [], hasMore: false }),
      sendAndDeliverMessage: jest
        .fn()
        .mockResolvedValue({ id: 'm1', body: 'hello' }),
      markConversationRead: jest
        .fn()
        .mockResolvedValue({ readAt: '2026-01-01T00:00:00.000Z' }),
    };
    mockStorageCrypto = {
      encryptForStorage: jest
        .fn()
        .mockResolvedValue({ v: 'storage-v1', nonce: 'sn', ct: 'sc' }),
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
        { text: 'hello', attachment: undefined },
      );
      expect(result).toEqual({ id: 'm1', body: 'hello' });
    });

    it('passes attachment fields through as a MessageAttachment', async () => {
      const user = { userId: 'u1', email: 'a@b.com' };
      const attachment = {
        url: 'https://cdn.example.com/uuid.pdf',
        type: 'application/pdf',
        name: 'report.pdf',
        storageEnvelope: undefined,
      };
      await resolver.sendMessage(user, {
        recipientId: 'u2',
        text: 'hello',
        attachmentUrl: 'https://cdn.example.com/uuid.pdf',
        attachmentType: 'application/pdf',
        attachmentName: 'report.pdf',
      });

      expect(mockMs.sendAndDeliverMessage).toHaveBeenCalledWith(
        'u1',
        'u2',
        'hello',
        undefined,
        attachment,
        undefined,
        { text: 'hello', attachment },
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
        { text: '', attachment: undefined },
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
});
