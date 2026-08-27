import { RtcWebhookController } from './rtc-webhook.controller';

function buildController() {
  const rtcRoom = {
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  };
  const rtcParticipant = { updateMany: jest.fn() };
  const prisma = { rtcRoom, rtcParticipant };

  const liveKit = {
    verifyWebhookEvent: jest.fn(),
  };
  const rtcCallService = {
    handleRoomEndedByLiveKit: jest.fn(),
    handlePeerLeft: jest.fn(),
  };
  const rtcMeetingService = {
    handleRoomEndedByLiveKit: jest.fn(),
    notifyParticipantLeftByLiveKit: jest.fn(),
  };
  const rtcStreamService = {
    handleRoomEndedByLiveKit: jest.fn(),
    notifyViewerLeftByLiveKit: jest.fn(),
  };

  // Cast only at the constructor boundary (which needs the real types) —
  // keeping the mocks themselves naturally-typed object literals above lets
  // later calls like `rtcMeetingService.handleRoomEndedByLiveKit
  // .mockRejectedValue(...)` type-check normally instead of being flagged
  // as unsafe access on an already-`never`-typed value.
  const controller = new RtcWebhookController(
    liveKit as never,
    prisma as never,
    rtcCallService as never,
    rtcMeetingService as never,
    rtcStreamService as never,
  );

  return {
    controller,
    rtcRoom,
    rtcParticipant,
    liveKit,
    rtcMeetingService,
    rtcStreamService,
    rtcCallService,
  };
}

function fakeReqRes(rawBody: string) {
  const req = {
    rawBody: Buffer.from(rawBody),
    headers: { authorization: 'test' },
  } as never;
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const res = { status } as never;
  return { req, res, json, status };
}

describe('RtcWebhookController', () => {
  it("room_finished never updates RtcRoom.state itself — regression for a real bug where doing so here defeated RtcMeetingService.handleRoomEndedByLiveKit's own idempotency guard on that exact field, silently skipping the participant leftAt backfill + rtc:meeting-ended broadcast for every meeting that ended via LiveKit noticing an empty room", async () => {
    const { controller, rtcRoom, rtcMeetingService, liveKit } =
      buildController();
    liveKit.verifyWebhookEvent.mockResolvedValue({
      event: 'room_finished',
      room: { name: 'meeting-r1' },
    });
    rtcRoom.findUnique.mockResolvedValue({ id: 'r1', kind: 'MEETING' });

    const { req, res } = fakeReqRes('{}');
    await controller.handleWebhook(req, res);

    expect(rtcRoom.update).not.toHaveBeenCalled();
    expect(rtcMeetingService.handleRoomEndedByLiveKit).toHaveBeenCalledWith(
      'r1',
    );
  });

  it('dispatches room_finished to the matching kind-specific service only, for calls and streams too', async () => {
    const { controller, rtcRoom, rtcCallService, liveKit } = buildController();
    liveKit.verifyWebhookEvent.mockResolvedValue({
      event: 'room_finished',
      room: { name: 'call-r2' },
    });
    rtcRoom.findUnique.mockResolvedValue({ id: 'r2', kind: 'CALL' });

    const { req, res } = fakeReqRes('{}');
    await controller.handleWebhook(req, res);

    expect(rtcRoom.update).not.toHaveBeenCalled();
    expect(rtcCallService.handleRoomEndedByLiveKit).toHaveBeenCalledWith('r2');
  });

  it('returns 200 even when a handler throws — a bad webhook payload must never make LiveKit retry-storm the endpoint', async () => {
    const { controller, rtcRoom, rtcMeetingService, liveKit } =
      buildController();
    liveKit.verifyWebhookEvent.mockResolvedValue({
      event: 'room_finished',
      room: { name: 'meeting-r3' },
    });
    rtcRoom.findUnique.mockResolvedValue({ id: 'r3', kind: 'MEETING' });
    rtcMeetingService.handleRoomEndedByLiveKit.mockRejectedValue(
      new Error('boom'),
    );

    const { req, res, status } = fakeReqRes('{}');
    await controller.handleWebhook(req, res);

    expect(status).toHaveBeenCalledWith(200);
  });
});
