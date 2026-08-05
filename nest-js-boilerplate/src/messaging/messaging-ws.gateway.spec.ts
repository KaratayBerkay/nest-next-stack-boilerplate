import { Test, TestingModule } from '@nestjs/testing';
import { MessagingWsGateway } from './messaging-ws.gateway';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingService } from './messaging.service';
import { PushNotificationService } from '../push-notification/push-notification.service';
import { WireCryptoService } from '../wire-crypto/wire-crypto.service';

interface MockWs {
  userId: string;
  sessionId: string;
  userName: string;
  tier: string;
  socketId: string;
  room: string | undefined;
  authenticated: boolean;
  isAlive: boolean;
  send: jest.Mock;
  sent: string[];
}

function createMockWs(tier = 'FREE'): MockWs {
  const sent: string[] = [];
  return {
    userId: 'u1',
    sessionId: 'sess-123',
    userName: 'Test',
    tier,
    socketId: 'u1:abc',
    room: undefined,
    authenticated: true,
    isAlive: true,
    send: jest.fn((data: string) => sent.push(data)),
    sent,
  };
}

type GatewayInternal = {
  handleJoinRoom: (ws: MockWs, data: { room: string }) => void;
  handleClaimJoinRoom: (ws: MockWs, params: Record<string, string>) => void;
  handleGetRoomMembers: (ws: MockWs, data: { room: string }) => void;
  handleDirectMessage: (
    ws: MockWs,
    data: {
      recipientId?: string;
      text?: string;
      tempId?: string;
      attachments?: { url: string; type: string; name: string }[];
      envelope?: Record<string, unknown>;
    },
  ) => Promise<void>;
  handleRoomMessage: (
    ws: MockWs,
    data: {
      room: string;
      text?: string;
      attachments?: { url: string; type: string; name: string }[];
      envelope?: Record<string, unknown>;
    },
  ) => Promise<void>;
};

describe('MessagingWsGateway — VIP room tier gate', () => {
  let gateway: MessagingWsGateway;
  let mockRealtime: {
    broadcastToRoom: jest.Mock;
    broadcastAll: jest.Mock;
    emitToPageEncrypted: jest.Mock;
    emitToUserEncrypted: jest.Mock;
    emitToRoomEncrypted: jest.Mock;
    registerRoomSocket: jest.Mock;
    leaveRoomSocket: jest.Mock;
  };
  let mockMs: {
    joinRoom: jest.Mock;
    leaveRoom: jest.Mock;
    getRoomCounts: jest.Mock;
    getRoomMembers: jest.Mock;
    sendMessage: jest.Mock;
    deliverDirectMessage: jest.Mock;
    saveRoomMessage: jest.Mock;
    persistJoin: jest.Mock;
    persistLeave: jest.Mock;
  };

  beforeEach(async () => {
    mockRealtime = {
      broadcastToRoom: jest.fn(),
      broadcastAll: jest.fn(),
      emitToPageEncrypted: jest.fn().mockResolvedValue(1),
      emitToUserEncrypted: jest.fn().mockResolvedValue(1),
      emitToRoomEncrypted: jest.fn().mockResolvedValue(1),
      registerRoomSocket: jest.fn(),
      leaveRoomSocket: jest.fn(),
    };
    mockMs = {
      joinRoom: jest.fn().mockReturnValue([]),
      leaveRoom: jest.fn().mockReturnValue([]),
      getRoomCounts: jest.fn().mockReturnValue({}),
      getRoomMembers: jest.fn().mockReturnValue([]),
      persistJoin: jest.fn().mockResolvedValue(undefined),
      persistLeave: jest.fn().mockResolvedValue(undefined),
      sendMessage: jest
        .fn()
        .mockResolvedValue({ id: 'm1', senderId: 'u1', recipientId: 'u2' }),
      deliverDirectMessage: jest.fn().mockResolvedValue({
        recipientPayload: { type: 'message', peerId: 'u2' },
        senderPayload: { type: 'message', peerId: 'u1' },
      }),
      saveRoomMessage: jest.fn().mockResolvedValue({
        id: 'm1',
        senderId: 'u1',
        body: 'hello',
        attachments: [],
        createdAt: new Date(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingWsGateway,
        { provide: RealtimeGateway, useValue: mockRealtime },
        { provide: PrismaService, useValue: {} },
        { provide: MessagingService, useValue: mockMs },
        { provide: PushNotificationService, useValue: {} },
        {
          provide: WireCryptoService,
          useValue: {
            decryptFromClient: jest.fn().mockResolvedValue({ text: 'hello' }),
            encryptForSession: jest.fn().mockResolvedValue({ v: 2, nonce: 'bn', ct: 'bc' }),
          },
        },
      ],
    }).compile();

    gateway = module.get(MessagingWsGateway);
  });

  describe('handleJoinRoom', () => {
    it('rejects FREE tier joining vip- room', () => {
      const ws = createMockWs('FREE');
      (gateway as unknown as GatewayInternal).handleJoinRoom(ws, {
        room: 'vip-lounge',
      });
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('VIP rooms require MEDIUM tier'),
      );
      expect(mockMs.joinRoom).not.toHaveBeenCalled();
    });

    it('rejects BASIC tier joining vip- room', () => {
      const ws = createMockWs('BASIC');
      (gateway as unknown as GatewayInternal).handleJoinRoom(ws, {
        room: 'vip-lounge',
      });
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('VIP rooms require MEDIUM tier'),
      );
      expect(mockMs.joinRoom).not.toHaveBeenCalled();
    });

    it('allows MEDIUM tier joining vip- room', () => {
      const ws = createMockWs('MEDIUM');
      (gateway as unknown as GatewayInternal).handleJoinRoom(ws, {
        room: 'vip-lounge',
      });
      expect(ws.send).not.toHaveBeenCalled();
      expect(mockMs.joinRoom).toHaveBeenCalledWith(
        'vip-lounge',
        expect.any(Object),
      );
    });

    it('allows PREMIUM tier joining vip- room', () => {
      const ws = createMockWs('PREMIUM');
      (gateway as unknown as GatewayInternal).handleJoinRoom(ws, {
        room: 'vip-lounge',
      });
      expect(ws.send).not.toHaveBeenCalled();
      expect(mockMs.joinRoom).toHaveBeenCalledWith(
        'vip-lounge',
        expect.any(Object),
      );
    });

    it('allows all tiers joining non-vip rooms', () => {
      const ws = createMockWs('FREE');
      (gateway as unknown as GatewayInternal).handleJoinRoom(ws, {
        room: 'general',
      });
      expect(ws.send).not.toHaveBeenCalled();
      expect(mockMs.joinRoom).toHaveBeenCalledWith(
        'general',
        expect.any(Object),
      );
    });
  });

  describe('handleGetRoomMembers', () => {
    it('replies with the current member list for a valid room', () => {
      const members = [{ socketId: 'u2:x', userId: 'u2', name: 'Two' }];
      mockMs.getRoomMembers.mockReturnValue(members);
      const ws = createMockWs('FREE');
      (gateway as unknown as GatewayInternal).handleGetRoomMembers(ws, {
        room: 'general',
      });
      expect(mockMs.getRoomMembers).toHaveBeenCalledWith('general');
      expect(ws.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'room-members', room: 'general', members }),
      );
    });

    it('does not reply for an invalid room', () => {
      const ws = createMockWs('FREE');
      (gateway as unknown as GatewayInternal).handleGetRoomMembers(ws, {
        room: 'not-a-real-room',
      });
      expect(ws.send).not.toHaveBeenCalled();
      expect(mockMs.getRoomMembers).not.toHaveBeenCalled();
    });

    it('does not reply when room is missing', () => {
      const ws = createMockWs('FREE');
      (gateway as unknown as GatewayInternal).handleGetRoomMembers(
        ws,
        {} as { room: string },
      );
      expect(ws.send).not.toHaveBeenCalled();
    });
  });

  describe('F34 — text-or-attachment guard', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('rejects direct-message with empty text and no attachment', async () => {
      const ws = createMockWs('MEDIUM');
      await (gateway as unknown as GatewayInternal).handleDirectMessage(ws, {
        text: '   ',
      });
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('an attachment, or an envelope'),
      );
      expect(mockMs.sendMessage).not.toHaveBeenCalled();
    });

    it('rejects direct-message with omitted text and no attachment', async () => {
      const ws = createMockWs('MEDIUM');
      await (gateway as unknown as GatewayInternal).handleDirectMessage(
        ws,
        {} as { text: string },
      );
      expect(mockMs.sendMessage).not.toHaveBeenCalled();
    });

    it('allows direct-message with attachment only', async () => {
      const ws = createMockWs('MEDIUM');
      const attachments = [
        { url: 'https://minio/x.png', type: 'image/png', name: 'x.png' },
      ];
      await (gateway as unknown as GatewayInternal).handleDirectMessage(ws, {
        recipientId: 'u2',
        text: '',
        attachments,
      });
      // No client envelope → the service encrypts for storage itself.
      expect(mockMs.sendMessage).toHaveBeenCalledWith(
        'u1',
        'u2',
        '',
        undefined,
        attachments,
        undefined,
      );
      expect(mockMs.deliverDirectMessage).toHaveBeenCalled();
    });

    it('allows direct-message with many attachments', async () => {
      const ws = createMockWs('MEDIUM');
      const attachments = [
        { url: 'https://minio/a.png', type: 'image/png', name: 'a.png' },
        { url: 'https://minio/b.pdf', type: 'application/pdf', name: 'b.pdf' },
      ];
      await (gateway as unknown as GatewayInternal).handleDirectMessage(ws, {
        recipientId: 'u2',
        text: '',
        attachments,
      });
      expect(mockMs.sendMessage).toHaveBeenCalledWith(
        'u1',
        'u2',
        '',
        undefined,
        attachments,
        undefined,
      );
    });

    it('passes a client-provided E2EE envelope through untouched (DM)', async () => {
      const ws = createMockWs('MEDIUM');
      const envelope = { v: 'e2ee-v1', nonce: 'n', ct: 'c' };
      await (gateway as unknown as GatewayInternal).handleDirectMessage(ws, {
        recipientId: 'u2',
        text: '',
        envelope,
      });
      expect(mockMs.sendMessage).toHaveBeenCalledWith(
        'u1',
        'u2',
        '',
        undefined,
        [],
        envelope,
      );
    });

    it('echoes the client tempId in the wire payloads so the optimistic entry can be replaced', async () => {
      const ws = createMockWs('MEDIUM');
      await (gateway as unknown as GatewayInternal).handleDirectMessage(ws, {
        recipientId: 'u2',
        text: 'hello',
        tempId: 'temp-123',
      });
      const delivered = mockMs.deliverDirectMessage.mock.calls[0][0];
      expect(delivered).toHaveProperty('_tempId', 'temp-123');
      expect(mockMs.deliverDirectMessage).toHaveBeenCalledWith(
        expect.objectContaining({ _tempId: 'temp-123' }),
        { text: 'hello', attachments: [] },
      );
    });

    it('rejects room-message with empty text and no attachment', async () => {
      const ws = createMockWs('FREE');
      await (gateway as unknown as GatewayInternal).handleRoomMessage(ws, {
        room: 'general',
        text: '',
      });
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('an attachment, or an envelope'),
      );
      expect(mockMs.saveRoomMessage).not.toHaveBeenCalled();
    });

    it('allows room-message with text', async () => {
      const ws = createMockWs('FREE');
      await (gateway as unknown as GatewayInternal).handleRoomMessage(ws, {
        room: 'general',
        text: 'hello',
      });
      // No client envelope → the service encrypts for storage itself.
      expect(mockMs.saveRoomMessage).toHaveBeenCalledWith(
        'general',
        'u1',
        'hello',
        [],
        undefined,
      );
    });

    it('allows room-message with many attachments', async () => {
      const ws = createMockWs('FREE');
      const attachments = [
        { url: 'https://minio/a.png', type: 'image/png', name: 'a.png' },
        { url: 'https://minio/b.pdf', type: 'application/pdf', name: 'b.pdf' },
      ];
      await (gateway as unknown as GatewayInternal).handleRoomMessage(ws, {
        room: 'general',
        text: '',
        attachments,
      });
      expect(mockMs.saveRoomMessage).toHaveBeenCalledWith(
        'general',
        'u1',
        '',
        attachments,
        undefined,
      );
    });

    it('passes a client-provided E2EE envelope through untouched (room)', async () => {
      const ws = createMockWs('FREE');
      const envelope = { v: 'e2ee-v1', nonce: 'n', ct: 'c' };
      await (gateway as unknown as GatewayInternal).handleRoomMessage(ws, {
        room: 'general',
        text: '',
        envelope,
      });
      expect(mockMs.saveRoomMessage).toHaveBeenCalledWith(
        'general',
        'u1',
        '',
        [],
        envelope,
      );
    });

    it('rejects a direct-message envelope over the size cap (WS bypasses the DTO pipeline)', async () => {
      const ws = createMockWs('MEDIUM');
      const oversized = { text: 'x'.repeat(40_000) };
      await (gateway as unknown as GatewayInternal).handleDirectMessage(ws, {
        recipientId: 'u2',
        text: '',
        envelope: oversized,
      });
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('envelope too large'),
      );
      expect(mockMs.sendMessage).not.toHaveBeenCalled();
    });

    it('rejects a room-message envelope over the size cap (WS bypasses the DTO pipeline)', async () => {
      const ws = createMockWs('FREE');
      const oversized = { text: 'x'.repeat(40_000) };
      await (gateway as unknown as GatewayInternal).handleRoomMessage(ws, {
        room: 'general',
        text: '',
        envelope: oversized,
      });
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('envelope too large'),
      );
      expect(mockMs.saveRoomMessage).not.toHaveBeenCalled();
    });
  });
});
