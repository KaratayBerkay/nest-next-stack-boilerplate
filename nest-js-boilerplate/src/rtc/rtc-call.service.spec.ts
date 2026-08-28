import { RtcCallService } from './rtc-call.service';
import { PrismaService } from '../prisma/prisma.service';
import { LiveKitService } from './livekit.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationService } from '../notification/notification.service';
import { FriendsService } from '../friends/friends.service';
import type { AuthWs } from '../realtime/realtime.types';

describe('RtcCallService.invite error codes', () => {
  let service: RtcCallService;
  let mockPrisma: { callSession: { count: jest.Mock } };
  let mockRealtime: { onlineCount: Map<string, number> };
  let mockFriends: { areFriends: jest.Mock };
  let ws: { userId: string; send: jest.Mock };

  beforeEach(() => {
    mockPrisma = {
      callSession: { count: jest.fn().mockResolvedValue(0) },
    };
    mockRealtime = { onlineCount: new Map([['callee-1', 1]]) };
    mockFriends = { areFriends: jest.fn().mockResolvedValue(true) };
    ws = { userId: 'caller-1', send: jest.fn() };

    service = new RtcCallService(
      mockPrisma as unknown as PrismaService,
      {} as LiveKitService,
      mockRealtime as unknown as RealtimeGateway,
      {} as NotificationService,
      mockFriends as unknown as FriendsService,
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

  // Regression for the friendship gate: any authenticated user could
  // previously ring ANY online user id — the invite path enforced no
  // relationship at all, unlike DMs.
  it('sends the not_friends code when the parties are not friends', async () => {
    mockFriends.areFriends.mockResolvedValue(false);

    await service.invite(ws as unknown as AuthWs, 'callee-1', true);

    expect(mockFriends.areFriends).toHaveBeenCalledWith('caller-1', 'callee-1');
    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'rtc:error', reason: 'not_friends' }),
    );
    // No CallSession row must ever be probed/created for a non-friend pair.
    expect(mockPrisma.callSession.count).not.toHaveBeenCalled();
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
      {
        areFriends: jest.fn().mockResolvedValue(true),
      } as unknown as FriendsService,
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

// Regression for the live call-drop of 2026-08-27: livekit-client recovers a
// broken connection with a FULL reconnect — it sends a LeaveRequest, then
// rejoins the same room ~40ms later — and LiveKit fires participant_left for
// the old session. handlePeerLeft used to end the call (broadcasting
// rtc:hangup and deleting the LiveKit room out from under the freshly
// rejoined participant) on that webhook alone, killing every call the moment
// any client reconnected. It now probes LiveKit for the identity and only
// ends the call once a grace window confirms the participant is really gone.
describe('RtcCallService.handlePeerLeft reconnect grace', () => {
  const GRACE_MS = 10_000;
  const call = {
    id: 'call-1',
    roomId: 'room-1',
    callerId: 'u-caller',
    calleeId: 'u-callee',
    state: 'CONNECTED',
  };

  let service: RtcCallService;
  let mockPrisma: {
    callSession: {
      findUnique: jest.Mock;
      findUniqueOrThrow: jest.Mock;
      updateMany: jest.Mock;
    };
    rtcRoom: { update: jest.Mock };
  };
  let mockLiveKit: { isParticipantConnected: jest.Mock; deleteRoom: jest.Mock };
  let mockRealtime: { emitToUser: jest.Mock };

  beforeEach(() => {
    jest.useFakeTimers();
    mockPrisma = {
      callSession: {
        findUnique: jest.fn().mockResolvedValue(call),
        findUniqueOrThrow: jest.fn().mockResolvedValue(call),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      rtcRoom: {
        update: jest.fn().mockResolvedValue({ livekitRoomName: 'call-lk-1' }),
      },
    };
    mockLiveKit = {
      isParticipantConnected: jest.fn().mockResolvedValue(false),
      deleteRoom: jest.fn().mockResolvedValue(undefined),
    };
    mockRealtime = { emitToUser: jest.fn() };

    service = new RtcCallService(
      mockPrisma as unknown as PrismaService,
      mockLiveKit as unknown as LiveKitService,
      mockRealtime as unknown as RealtimeGateway,
      {} as NotificationService,
      {} as FriendsService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ignores participant_left when the identity is already back in the room (full reconnect rejoined before the webhook was processed)', async () => {
    mockLiveKit.isParticipantConnected.mockResolvedValue(true);

    await service.handlePeerLeft('room-1', 'call-lk-1', 'u-callee');
    await jest.advanceTimersByTimeAsync(GRACE_MS + 1000);

    expect(mockLiveKit.isParticipantConnected).toHaveBeenCalledWith(
      'call-lk-1',
      'u-callee',
    );
    expect(mockPrisma.callSession.updateMany).not.toHaveBeenCalled();
    expect(mockRealtime.emitToUser).not.toHaveBeenCalled();
  });

  it('ends the call only after the grace window re-confirms the participant is gone', async () => {
    await service.handlePeerLeft('room-1', 'call-lk-1', 'u-callee');

    // Grace window still open — nothing torn down yet.
    expect(mockPrisma.callSession.updateMany).not.toHaveBeenCalled();
    expect(mockRealtime.emitToUser).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(GRACE_MS);

    expect(mockPrisma.callSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'call-1', state: { in: ['CONNECTED'] } },
      }),
    );
    expect(mockLiveKit.deleteRoom).toHaveBeenCalledWith('call-lk-1');
    const frame = { type: 'rtc:hangup', callId: 'call-1', reason: 'hangup' };
    expect(mockRealtime.emitToUser).toHaveBeenCalledWith('u-caller', frame);
    expect(mockRealtime.emitToUser).toHaveBeenCalledWith('u-callee', frame);
  });

  it('cancels the teardown when the participant rejoins during the grace window', async () => {
    mockLiveKit.isParticipantConnected
      .mockResolvedValueOnce(false) // at webhook time: old session just closed
      .mockResolvedValueOnce(true); // at grace-check time: rejoined

    await service.handlePeerLeft('room-1', 'call-lk-1', 'u-callee');
    await jest.advanceTimersByTimeAsync(GRACE_MS + 1000);

    expect(mockLiveKit.isParticipantConnected).toHaveBeenCalledTimes(2);
    expect(mockPrisma.callSession.updateMany).not.toHaveBeenCalled();
    expect(mockRealtime.emitToUser).not.toHaveBeenCalled();
  });

  it('does not stack duplicate grace timers for repeated participant_left webhooks of the same identity', async () => {
    await service.handlePeerLeft('room-1', 'call-lk-1', 'u-callee');
    await service.handlePeerLeft('room-1', 'call-lk-1', 'u-callee');
    await jest.advanceTimersByTimeAsync(GRACE_MS + 1000);

    // One grace check (plus the two webhook-time probes), one teardown.
    expect(mockLiveKit.isParticipantConnected).toHaveBeenCalledTimes(3);
    expect(mockPrisma.callSession.updateMany).toHaveBeenCalledTimes(1);
  });
});
