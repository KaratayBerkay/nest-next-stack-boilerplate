import { RtcStreamService } from './rtc-stream.service';

function buildService() {
  const liveStream = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  };
  const rtcRoom = { create: jest.fn(), update: jest.fn() };
  const rtcParticipant = {
    create: jest.fn(),
    upsert: jest.fn(),
    updateMany: jest.fn(),
    findUnique: jest.fn(),
  };
  const user = { findUnique: jest.fn() };

  const prisma: Record<string, unknown> = {
    liveStream,
    rtcRoom,
    rtcParticipant,
    user,
  };
  prisma.$transaction = jest.fn((arg: unknown) => {
    if (typeof arg === 'function') {
      return (arg as (tx: unknown) => Promise<unknown>)(prisma);
    }
    return Promise.all(arg as Promise<unknown>[]);
  });

  const liveKit = {
    createRoom: jest.fn(),
    mintToken: jest.fn().mockResolvedValue('tok'),
    deleteRoom: jest.fn(),
    listParticipantCount: jest.fn().mockResolvedValue(0),
  };
  const realtime = { broadcastToRoom: jest.fn() };
  const chat = {
    isActiveParticipant: jest.fn(),
    markParticipantLeft: jest.fn(),
  };
  const notifications = { create: jest.fn() };
  const friends = { areFriends: jest.fn(), getFriendIds: jest.fn() };

  const service = new RtcStreamService(
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
    liveStream,
    rtcParticipant,
    user,
    liveKit,
    realtime,
    chat,
  };
}

/** Lets a fire-and-forget void chain settle. */
function flushAsync(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

const LIVE_STREAM = {
  id: 's1',
  roomId: 'room1',
  slug: 'slug1',
  broadcasterId: 'bcast1',
  isLive: true,
  peakViewerCount: 5,
  room: { livekitRoomName: 'stream-x', state: 'ACTIVE' },
};

describe('RtcStreamService', () => {
  describe('notifyViewerLeftByLiveKit', () => {
    it('broadcasts rtc:stream-viewer-left WITH the live viewerCount — regression for the webhook-driven frame omitting it, which made the web hook (Number(viewerCount ?? 0)) zero the visible count for everyone whenever a viewer hard-dropped', async () => {
      const { service, liveStream, liveKit, realtime } = buildService();
      liveStream.findUnique.mockResolvedValue(LIVE_STREAM);
      // 4 LiveKit participants incl. the broadcaster => 3 viewers.
      liveKit.listParticipantCount.mockResolvedValue(4);

      service.notifyViewerLeftByLiveKit('room1', 'viewer9');
      await flushAsync();

      expect(realtime.broadcastToRoom).toHaveBeenCalledWith(
        'rtc-stream:slug1',
        {
          type: 'rtc:stream-viewer-left',
          slug: 'slug1',
          userId: 'viewer9',
          viewerCount: 3,
        },
      );
    });
  });

  describe('joinStreamAsViewer', () => {
    it('as the broadcaster: mints a token but runs NO viewer side effects — regression for the self-view flow overwriting the BROADCASTER row (upsert reset joinedAt) and announcing the broadcaster as their own viewer', async () => {
      const { service, liveStream, user, rtcParticipant, realtime } =
        buildService();
      liveStream.findUnique.mockResolvedValue(LIVE_STREAM);
      user.findUnique.mockResolvedValue({
        name: 'Cast',
        email: 'c@example.com',
        avatarUrl: null,
      });

      const result = await service.joinStreamAsViewer('bcast1', 'slug1');

      expect(result.token).toBe('tok');
      expect(result.roomName).toBe('stream-x');
      expect(rtcParticipant.upsert).not.toHaveBeenCalled();
      expect(realtime.broadcastToRoom).not.toHaveBeenCalled();
      expect(liveStream.update).not.toHaveBeenCalled();
    });

    it('as an ordinary viewer: still upserts the VIEWER row and broadcasts viewer-joined with a count (the broadcaster guard must not leak onto the normal path)', async () => {
      const { service, liveStream, user, rtcParticipant, liveKit, realtime } =
        buildService();
      liveStream.findUnique.mockResolvedValue(LIVE_STREAM);
      user.findUnique.mockResolvedValue({
        name: 'Viewer',
        email: 'v@example.com',
        avatarUrl: null,
      });
      liveKit.listParticipantCount.mockResolvedValue(3);

      await service.joinStreamAsViewer('viewer1', 'slug1');

      expect(rtcParticipant.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { roomId_userId: { roomId: 'room1', userId: 'viewer1' } },
        }),
      );
      expect(realtime.broadcastToRoom).toHaveBeenCalledWith(
        'rtc-stream:slug1',
        expect.objectContaining({
          type: 'rtc:stream-viewer-joined',
          userId: 'viewer1',
          viewerCount: 2,
        }),
      );
    });
  });

  describe('leaveStreamAsViewer', () => {
    it('as the broadcaster: a complete no-op — regression for the own-stream page unmount stamping leftAt on the broadcaster row, which silently cut them off from their own chat (isActiveParticipant guards on leftAt)', async () => {
      const { service, liveStream, chat, realtime } = buildService();
      liveStream.findUnique.mockResolvedValue(LIVE_STREAM);

      await service.leaveStreamAsViewer('bcast1', 'slug1');

      expect(chat.markParticipantLeft).not.toHaveBeenCalled();
      expect(realtime.broadcastToRoom).not.toHaveBeenCalled();
    });

    it('as an ordinary viewer: still marks them left and broadcasts', async () => {
      const { service, liveStream, chat, realtime } = buildService();
      liveStream.findUnique.mockResolvedValue(LIVE_STREAM);

      await service.leaveStreamAsViewer('viewer1', 'slug1');

      expect(chat.markParticipantLeft).toHaveBeenCalledWith('room1', 'viewer1');
      expect(realtime.broadcastToRoom).toHaveBeenCalledWith(
        'rtc-stream:slug1',
        expect.objectContaining({ type: 'rtc:stream-viewer-left' }),
      );
    });
  });

  describe('endStream', () => {
    it('on an already-ended stream: succeeds silently without re-running finishStream — a double end (LiveKit room_finished racing the button) used to re-broadcast rtc:stream-ended', async () => {
      const { service, prisma, liveStream, realtime } = buildService();
      liveStream.findUnique.mockResolvedValue({
        ...LIVE_STREAM,
        isLive: false,
      });

      await service.endStream('bcast1', 'slug1');

      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(realtime.broadcastToRoom).not.toHaveBeenCalled();
    });
  });
});
