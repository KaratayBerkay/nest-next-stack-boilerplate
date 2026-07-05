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
});
