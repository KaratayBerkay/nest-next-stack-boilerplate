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

    resolver = new MessagingResolver(mockMs as never);
  });

  describe('sendMessage', () => {
    it('calls sendAndDeliverMessage with correct args', async () => {
      const user = { userId: 'u1', email: 'a@b.com' };
      const result = await resolver.sendMessage(user, {
        recipientId: 'u2',
        text: 'hello',
      });

      expect(mockMs.sendAndDeliverMessage).toHaveBeenCalledWith(
        'u1',
        'u2',
        'hello',
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual({ id: 'm1', body: 'hello' });
    });

    it('passes attachment fields through as a MessageAttachment', async () => {
      const user = { userId: 'u1', email: 'a@b.com' };
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
        {
          url: 'https://cdn.example.com/uuid.pdf',
          type: 'application/pdf',
          name: 'report.pdf',
        },
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
});
