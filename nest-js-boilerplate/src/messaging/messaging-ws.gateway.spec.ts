import { Test, TestingModule } from '@nestjs/testing';
import { MessagingWsGateway } from './messaging-ws.gateway';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingService } from './messaging.service';
import { PushNotificationService } from '../push-notification/push-notification.service';

interface MockWs {
  userId: string;
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
  handleDirectMessage: (
    ws: MockWs,
    data: {
      recipientId: string;
      text: string;
      attachmentUrl?: string;
    },
  ) => Promise<void>;
  handleRoomMessage: (
    ws: MockWs,
    data: { room: string; text?: string; attachmentUrl?: string },
  ) => Promise<void>;
};

describe('MessagingWsGateway — VIP room tier gate', () => {
  let gateway: MessagingWsGateway;
  let mockRealtime: {
    broadcastToRoom: jest.Mock;
    broadcastAll: jest.Mock;
  };
  let mockMs: {
    joinRoom: jest.Mock;
    leaveRoom: jest.Mock;
    getRoomCounts: jest.Mock;
    sendMessage: jest.Mock;
    deliverDirectMessage: jest.Mock;
    saveRoomMessage: jest.Mock;
  };

  beforeEach(async () => {
    mockRealtime = {
      broadcastToRoom: jest.fn(),
      broadcastAll: jest.fn(),
    };
    mockMs = {
      joinRoom: jest.fn().mockReturnValue([]),
      leaveRoom: jest.fn().mockReturnValue([]),
      getRoomCounts: jest.fn().mockReturnValue({}),
      sendMessage: jest
        .fn()
        .mockResolvedValue({ id: 'm1', senderId: 'u1', recipientId: 'u2' }),
      deliverDirectMessage: jest.fn().mockResolvedValue(undefined),
      saveRoomMessage: jest.fn().mockResolvedValue({
        id: 'm1',
        senderId: 'u1',
        body: 'hello',
        attachmentUrl: null,
        attachmentType: null,
        attachmentName: null,
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

  describe('F34 — text-or-attachment guard', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('rejects direct-message with empty text and no attachment', async () => {
      const ws = createMockWs('MEDIUM');
      await (
        gateway as unknown as GatewayInternal
      ).handleDirectMessage(ws, { text: '   ' });
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('must contain either text or an attachment'),
      );
      expect(mockMs.sendMessage).not.toHaveBeenCalled();
    });

    it('rejects direct-message with omitted text and no attachment', async () => {
      const ws = createMockWs('MEDIUM');
      await (
        gateway as unknown as GatewayInternal
      ).handleDirectMessage(ws, {} as { text: string });
      expect(mockMs.sendMessage).not.toHaveBeenCalled();
    });

    it('allows direct-message with attachment only', async () => {
      const ws = createMockWs('MEDIUM');
      await (
        gateway as unknown as GatewayInternal
      ).handleDirectMessage(ws, {
        recipientId: 'u2',
        text: '',
        attachmentUrl: 'https://minio/x.png',
        attachmentType: 'image/png',
        attachmentName: 'x.png',
      });
      expect(mockMs.sendMessage).toHaveBeenCalledWith(
        'u1',
        'u2',
        '',
        undefined,
        expect.objectContaining({ url: 'https://minio/x.png' }),
      );
    });

    it('rejects room-message with empty text and no attachment', async () => {
      const ws = createMockWs('FREE');
      await (
        gateway as unknown as GatewayInternal
      ).handleRoomMessage(ws, { room: 'general', text: '' });
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('must contain either text or an attachment'),
      );
      expect(mockMs.saveRoomMessage).not.toHaveBeenCalled();
    });

    it('allows room-message with text', async () => {
      const ws = createMockWs('FREE');
      await (
        gateway as unknown as GatewayInternal
      ).handleRoomMessage(ws, { room: 'general', text: 'hello' });
      expect(mockMs.saveRoomMessage).toHaveBeenCalledWith(
        'general',
        'u1',
        'hello',
        undefined,
      );
    });
  });
});
