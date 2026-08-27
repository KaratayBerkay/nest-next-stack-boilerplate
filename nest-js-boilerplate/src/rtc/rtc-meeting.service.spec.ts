import { ForbiddenException } from '@nestjs/common';
import { RtcMeetingService } from './rtc-meeting.service';

function buildService() {
  const rtcRoom = {
    create: jest.fn<
      Promise<Record<string, unknown>>,
      [{ data: Record<string, unknown> }]
    >(),
    update: jest.fn(),
  };
  const meeting = {
    create: jest.fn<
      Promise<Record<string, unknown>>,
      [{ data: Record<string, unknown> }]
    >(),
    findUniqueOrThrow: jest.fn(),
    findUnique: jest.fn(),
  };
  const rtcParticipant = {
    findUnique: jest.fn(),
    count: jest.fn(),
    upsert: jest.fn(),
    updateMany: jest.fn(),
  };
  const user = { findUnique: jest.fn() };
  const queryRaw = jest.fn().mockResolvedValue(undefined);

  const prisma: Record<string, unknown> = {
    rtcRoom,
    meeting,
    rtcParticipant,
    user,
  };
  // Interactive $transaction: run the callback with `tx` === the same mock,
  // matching this repo's established Prisma-mock convention (see
  // billing.service.spec.ts) — good enough to prove call sequencing without
  // a real Postgres instance.
  prisma.$transaction = jest.fn((arg: unknown) => {
    if (typeof arg === 'function') {
      const tx = { ...prisma, $queryRaw: queryRaw };
      return (arg as (tx: unknown) => Promise<unknown>)(tx);
    }
    return Promise.all(arg as Promise<unknown>[]);
  });

  const liveKit = { createRoom: jest.fn(), mintToken: jest.fn() };
  const realtime = { broadcastToRoom: jest.fn() };
  const chat = {
    isActiveParticipant: jest.fn(),
    markParticipantLeft: jest.fn(),
  };
  const notifications = { create: jest.fn() };
  const friends = { areFriends: jest.fn(), getFriendIds: jest.fn() };

  const service = new RtcMeetingService(
    prisma as never,
    liveKit as never,
    realtime as never,
    chat as never,
    notifications as never,
    friends as never,
  );

  return {
    service,
    prisma,
    rtcRoom,
    meeting,
    rtcParticipant,
    user,
    liveKit,
    queryRaw,
  };
}

describe('RtcMeetingService', () => {
  describe('createMeeting', () => {
    it('creates RtcRoom + Meeting atomically inside one transaction before ever calling LiveKit — regression for an orphaned-room bug where a crash (or a LiveKit failure) between separate top-level creates could leave an ACTIVE-looking room with no Meeting row ever pointing at it', async () => {
      const { service, prisma, rtcRoom, meeting, user, liveKit } =
        buildService();
      user.findUnique.mockResolvedValue({ subscriptionTier: 'FREE' });
      rtcRoom.create.mockResolvedValue({ id: 'room1' });
      meeting.create.mockResolvedValue({ id: 'm1', roomId: 'room1' });
      meeting.findUniqueOrThrow.mockResolvedValue({
        id: 'm1',
        roomId: 'room1',
        slug: 'abc',
        room: { livekitRoomName: 'meeting-room1' },
        host: {},
      });

      await service.createMeeting('host1', 'Standup');

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(rtcRoom.create.mock.calls[0][0].data).toMatchObject({
        kind: 'MEETING',
        state: 'PENDING',
      });
      expect(meeting.create.mock.calls[0][0].data).toMatchObject({
        roomId: 'room1',
      });
      // LiveKit must only be called AFTER the transaction (and thus after
      // both rows already exist together) — compare Jest's own call-order
      // counters rather than relying on a jest-extended matcher this repo
      // doesn't have installed.
      expect(liveKit.createRoom.mock.invocationCallOrder[0]).toBeGreaterThan(
        meeting.create.mock.invocationCallOrder[0],
      );
    });

    it('propagates a LiveKit failure instead of silently leaving a phantom active room — the Meeting row from the transaction still exists (visibly stuck PENDING) rather than the room being invisibly orphaned', async () => {
      const { service, rtcRoom, meeting, user, liveKit } = buildService();
      user.findUnique.mockResolvedValue({ subscriptionTier: 'FREE' });
      rtcRoom.create.mockResolvedValue({ id: 'room1' });
      meeting.create.mockResolvedValue({ id: 'm1', roomId: 'room1' });
      liveKit.createRoom.mockRejectedValue(new Error('livekit down'));

      await expect(service.createMeeting('host1', 'Standup')).rejects.toThrow(
        'livekit down',
      );
      expect(rtcRoom.update).not.toHaveBeenCalled();
    });
  });

  describe('joinMeeting capacity check', () => {
    function activeMeeting() {
      return {
        id: 'm1',
        roomId: 'room1',
        hostId: 'host1',
        maxParticipants: 2,
        room: { state: 'ACTIVE', livekitRoomName: 'meeting-room1' },
      };
    }

    it('locks the room row and rejects a new joiner once the meeting is at capacity', async () => {
      const { service, meeting, user, rtcParticipant, queryRaw } =
        buildService();
      meeting.findUnique.mockResolvedValue(activeMeeting());
      user.findUnique.mockResolvedValue({
        name: 'Bob',
        email: 'b@x.com',
        avatarUrl: null,
      });
      rtcParticipant.findUnique.mockResolvedValue(null);
      rtcParticipant.count.mockResolvedValue(2); // already at maxParticipants

      await expect(service.joinMeeting('newUser', 'slug1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(queryRaw).toHaveBeenCalled();
      expect(rtcParticipant.upsert).not.toHaveBeenCalled();
    });

    it('allows a rejoin of an already-active participant regardless of capacity (re-checking their own seat, not a new one)', async () => {
      const { service, meeting, user, rtcParticipant } = buildService();
      meeting.findUnique.mockResolvedValue(activeMeeting());
      user.findUnique.mockResolvedValue({
        name: 'Bob',
        email: 'b@x.com',
        avatarUrl: null,
      });
      rtcParticipant.findUnique.mockResolvedValue({ leftAt: null });
      const service2 = service as unknown as {
        liveKit: { mintToken: jest.Mock };
      };
      service2.liveKit.mintToken.mockResolvedValue('token');

      await service.joinMeeting('host1', 'slug1');

      expect(rtcParticipant.count).not.toHaveBeenCalled();
      expect(rtcParticipant.upsert).toHaveBeenCalled();
    });
  });
});
