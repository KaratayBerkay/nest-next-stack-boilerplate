import { ForbiddenException, NotFoundException } from '@nestjs/common';
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
    findMany: jest.fn(),
  };
  const rtcParticipant = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
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
  const mail = { enqueue: jest.fn().mockResolvedValue({ id: 'mail1' }) };
  const config = {
    get: jest.fn((_key: string, fallback?: unknown) => fallback),
  };

  const service = new RtcMeetingService(
    prisma as never,
    liveKit as never,
    realtime as never,
    chat as never,
    notifications as never,
    friends as never,
    mail as never,
    config as never,
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
    chat,
    notifications,
    friends,
    mail,
    config,
  };
}

/** Lets the fire-and-forget invite-email chain settle. */
function flushAsync(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('RtcMeetingService', () => {
  describe('createMeeting', () => {
    // Real uuid: the room id now flows through toLivekitRoomName ->
    // encryptId, which (rightly) refuses anything that isn't one.
    const ROOM_UUID = '018f4c2a-9a01-7000-8000-0000000000ab';
    it('creates RtcRoom + Meeting atomically inside one transaction before ever calling LiveKit — regression for an orphaned-room bug where a crash (or a LiveKit failure) between separate top-level creates could leave an ACTIVE-looking room with no Meeting row ever pointing at it', async () => {
      const { service, prisma, rtcRoom, meeting, user, liveKit } =
        buildService();
      user.findUnique.mockResolvedValue({ subscriptionTier: 'FREE' });
      rtcRoom.create.mockResolvedValue({ id: ROOM_UUID });
      meeting.create.mockResolvedValue({ id: 'm1', roomId: ROOM_UUID });
      meeting.findUniqueOrThrow.mockResolvedValue({
        id: 'm1',
        roomId: ROOM_UUID,
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
        roomId: ROOM_UUID,
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
      rtcRoom.create.mockResolvedValue({ id: ROOM_UUID });
      meeting.create.mockResolvedValue({ id: 'm1', roomId: ROOM_UUID });
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

    it('loads the host relation and returns it on the joined meeting (GraphQL Meeting.host is non-nullable)', async () => {
      const { service, meeting, user, rtcParticipant } = buildService();
      const host = { id: 'host1', name: 'Alice', email: 'a@x.com' };
      meeting.findUnique.mockResolvedValue({ ...activeMeeting(), host });
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

      const result = await service.joinMeeting('user2', 'slug1');

      expect(meeting.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ host: true }) as unknown,
        }),
      );
      expect(result.meeting.host).toEqual(host);
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

  describe('inviteToMeeting guard', () => {
    function activeMeeting() {
      return {
        id: 'm1',
        roomId: 'room1',
        hostId: 'host1',
        title: 'Standup',
        room: { state: 'ACTIVE' },
      };
    }

    it('lets the host invite before joining — the create-meeting flow sends invites before the host has joined', async () => {
      const { service, meeting, user, chat, notifications, friends } =
        buildService();
      meeting.findUnique.mockResolvedValue(activeMeeting());
      friends.areFriends.mockResolvedValue(true);
      user.findUnique.mockResolvedValue({ name: 'Alice', email: 'a@x.com' });

      await service.inviteToMeeting('host1', 'slug1', 'friend1');

      // Host path must not depend on being an active participant.
      expect(chat.isActiveParticipant).not.toHaveBeenCalled();
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'friend1', type: 'MEETING_INVITE' }),
      );
    });

    it('queues an invite email to the target with the join link, inviter, and title', async () => {
      const { service, meeting, user, friends, mail } = buildService();
      meeting.findUnique.mockResolvedValue(activeMeeting());
      friends.areFriends.mockResolvedValue(true);
      user.findUnique
        .mockResolvedValueOnce({ name: 'Alice', email: 'a@x.com' })
        .mockResolvedValueOnce({ email: 'friend@x.com' });

      await service.inviteToMeeting('host1', 'slug1', 'friend1');
      await flushAsync();

      expect(mail.enqueue).toHaveBeenCalledWith({
        to: 'friend@x.com',
        userId: 'friend1',
        subject: 'Alice invited you to a meeting',
        template: 'meeting-invite',
        variables: {
          url: 'http://localhost:3000/v1/en/rtc/meetings/slug1',
          inviterName: 'Alice',
          meetingTitle: 'Standup',
        },
      });
    });

    it('still delivers the invite when the email outbox fails — mail is fire-and-forget', async () => {
      const { service, meeting, user, friends, notifications, mail } =
        buildService();
      meeting.findUnique.mockResolvedValue(activeMeeting());
      friends.areFriends.mockResolvedValue(true);
      user.findUnique.mockResolvedValue({ name: 'Alice', email: 'a@x.com' });
      mail.enqueue.mockRejectedValue(new Error('outbox down'));

      await expect(
        service.inviteToMeeting('host1', 'slug1', 'friend1'),
      ).resolves.toBeUndefined();
      await flushAsync();
      expect(notifications.create).toHaveBeenCalled();
    });

    it('rejects an inviter who is neither host nor an active participant', async () => {
      const { service, meeting, chat, notifications } = buildService();
      meeting.findUnique.mockResolvedValue(activeMeeting());
      chat.isActiveParticipant.mockResolvedValue(false);

      await expect(
        service.inviteToMeeting('outsider', 'slug1', 'friend1'),
      ).rejects.toThrow(NotFoundException);
      expect(notifications.create).not.toHaveBeenCalled();
    });

    it('rejects invites to an ended meeting, even from its host', async () => {
      const { service, meeting, notifications } = buildService();
      meeting.findUnique.mockResolvedValue({
        ...activeMeeting(),
        room: { state: 'ENDED' },
      });

      await expect(
        service.inviteToMeeting('host1', 'slug1', 'friend1'),
      ).rejects.toThrow(NotFoundException);
      expect(notifications.create).not.toHaveBeenCalled();
    });
  });

  describe('myMeetings', () => {
    it('lists meetings the user attended, not only ones they hosted — the history section is useless to non-hosts otherwise', async () => {
      const { service, meeting } = buildService();
      meeting.findMany.mockResolvedValue([]);

      await service.myMeetings('u1');

      const args = (
        meeting.findMany.mock.calls as [
          [
            {
              where: { OR: unknown[] };
              include: { room: { include: { participants: unknown } } };
            },
          ],
        ]
      )[0][0];
      expect(args.where.OR).toEqual([
        { hostId: 'u1' },
        { room: { participants: { some: { userId: 'u1' } } } },
      ]);
      // Participants must come preloaded or the list's GraphQL
      // `participants` field degrades to one query per meeting row.
      expect(args.include.room.include.participants).toBeDefined();
    });

    it('re-keys preloaded rows off room.participants — the generated RtcRoom GraphQL field would otherwise serve co-attendee emails, hidden avatars, and raw livekitIdentity uuids', async () => {
      const { service, meeting } = buildService();
      const rows = [
        {
          userId: 'u2',
          role: 'PARTICIPANT',
          joinedAt: new Date(),
          leftAt: null,
          user: {
            name: 'Ada',
            email: 'ada@example.com',
            avatarUrl: 'https://cdn/a.png',
            hideAvatar: true,
          },
        },
      ];
      meeting.findMany.mockResolvedValue([
        {
          id: 'm1',
          roomId: 'room1',
          room: { id: 'room1', state: 'ACTIVE', participants: rows },
          host: { id: 'h1' },
        },
      ]);

      const [result] = (await service.myMeetings('u1')) as Array<{
        room: Record<string, unknown>;
        participantRows?: unknown[];
      }>;

      // The GraphQL-visible relation key must stay unloaded…
      expect(result.room).not.toHaveProperty('participants');
      // …while the summaries ResolveField still gets the rows N+1-free.
      expect(result.participantRows).toBe(rows);
    });
  });

  describe('participantSummaries', () => {
    const row = (over: Record<string, unknown> = {}) => ({
      userId: 'u2',
      role: 'PARTICIPANT',
      joinedAt: new Date('2026-08-28T10:00:00Z'),
      leftAt: null,
      user: {
        name: 'Ada',
        email: 'ada@example.com',
        avatarUrl: 'https://cdn/a.png',
        hideAvatar: false,
        ...((over.user as Record<string, unknown>) ?? {}),
      },
      ...Object.fromEntries(Object.entries(over).filter(([k]) => k !== 'user')),
    });

    it('maps preloaded rows without touching prisma and applies the hideAvatar contract', async () => {
      const { service, rtcParticipant } = buildService();

      const result = await service.participantSummaries({
        roomId: 'room1',
        participantRows: [
          row(),
          row({
            userId: 'u3',
            user: { name: null, hideAvatar: true },
          }),
        ] as never,
      });

      expect(rtcParticipant.findMany).not.toHaveBeenCalled();
      expect(result[0]).toMatchObject({
        userId: 'u2',
        name: 'Ada',
        avatarUrl: 'https://cdn/a.png',
        role: 'PARTICIPANT',
      });
      // hideAvatar users must never leak their avatarUrl; a null name uses
      // the shared displayName fallback (same as chat sender names and join
      // toasts).
      expect(result[1].avatarUrl).toBeNull();
      expect(result[1].name).toBe('ada@example.com');
    });

    it('falls back to a participant query when the parent was loaded without them', async () => {
      const { service, rtcParticipant } = buildService();
      rtcParticipant.findMany.mockResolvedValue([row()]);

      const result = await service.participantSummaries({ roomId: 'room1' });

      expect(rtcParticipant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { roomId: 'room1' } }),
      );
      expect(result).toHaveLength(1);
    });
  });
});
