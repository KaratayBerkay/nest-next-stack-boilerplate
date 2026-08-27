import { RtcCallService } from './rtc-call.service';
import { PrismaService } from '../prisma/prisma.service';
import { LiveKitService } from './livekit.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationService } from '../notification/notification.service';
import type { AuthWs } from '../realtime/realtime.types';

describe('RtcCallService.invite error codes', () => {
  let service: RtcCallService;
  let mockPrisma: { callSession: { count: jest.Mock } };
  let mockRealtime: { onlineCount: Map<string, number> };
  let ws: { userId: string; send: jest.Mock };

  beforeEach(() => {
    mockPrisma = {
      callSession: { count: jest.fn().mockResolvedValue(0) },
    };
    mockRealtime = { onlineCount: new Map([['callee-1', 1]]) };
    ws = { userId: 'caller-1', send: jest.fn() };

    service = new RtcCallService(
      mockPrisma as unknown as PrismaService,
      {} as LiveKitService,
      mockRealtime as unknown as RealtimeGateway,
      {} as NotificationService,
    );
  });

  // Regression: these used to be full English sentences ('That user is
  // offline', 'Busy', 'You cannot call yourself') sent verbatim as the
  // wire-level `reason`, with the frontend string-matching against that
  // exact English text to pick a translated message — any wording tweak on
  // either side would silently fall through to a generic error. The wire
  // value is now the same stable snake_case code already used for logging.

  it('sends the self_call code when a user calls themselves', async () => {
    await service.invite(ws as unknown as AuthWs, 'caller-1', true);

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'rtc:error', reason: 'self_call' }),
    );
  });

  it('sends the callee_offline code when the callee is not connected', async () => {
    mockRealtime.onlineCount = new Map();

    await service.invite(ws as unknown as AuthWs, 'callee-1', true);

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'rtc:error', reason: 'callee_offline' }),
    );
  });

  it('sends the busy code when either party already has an active call', async () => {
    mockPrisma.callSession.count.mockResolvedValue(1);

    await service.invite(ws as unknown as AuthWs, 'callee-1', true);

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'rtc:error', reason: 'busy' }),
    );
  });
});

describe('RtcCallService.accept error codes', () => {
  let service: RtcCallService;
  let mockPrisma: {
    callSession: { updateMany: jest.Mock; findUnique: jest.Mock };
  };
  let ws: { userId: string; send: jest.Mock };

  beforeEach(() => {
    mockPrisma = {
      callSession: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    ws = { userId: 'callee-1', send: jest.fn() };

    service = new RtcCallService(
      mockPrisma as unknown as PrismaService,
      {} as LiveKitService,
      { onlineCount: new Map() } as unknown as RealtimeGateway,
      {} as NotificationService,
    );
  });

  it('sends the call_unavailable code when the call is no longer ringing for this callee', async () => {
    await service.accept(ws as unknown as AuthWs, 'call-1');

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'rtc:error',
        reason: 'call_unavailable',
        callId: 'call-1',
      }),
    );
  });

  it('sends the call_unavailable code when the claimed call cannot be found', async () => {
    mockPrisma.callSession.updateMany.mockResolvedValue({ count: 1 });

    await service.accept(ws as unknown as AuthWs, 'call-1');

    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'rtc:error',
        reason: 'call_unavailable',
        callId: 'call-1',
      }),
    );
  });
});
