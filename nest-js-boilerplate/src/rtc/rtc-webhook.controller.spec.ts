import { RtcWebhookController } from './rtc-webhook.controller';
import { encryptId, _resetKeysForTests } from '../common/id-codec/id-codec';

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
    enforceRemovalOnRejoin: jest.fn().mockResolvedValue(false),
  };
  const rtcStreamService = {
    handleRoomEndedByLiveKit: jest.fn(),
    notifyViewerLeftByLiveKit: jest.fn(),
    notifyViewerJoinedByLiveKit: jest.fn(),
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

  // Regression for the LiveKit identity codec: tokens are minted with the
  // encryptId() form of the userId (raw db uuids must never reach a client,
  // and both frontends match LiveKit identities against ids they got from
  // GraphQL — which are encrypted). The webhook therefore reports the
  // ENCRYPTED identity, and this controller must map it back to the raw
  // userId that RtcParticipant.livekitIdentity stores.
  it('participant_left decrypts the LiveKit identity back to the raw userId before touching the DB or notifying', async () => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-rtc-webhook-specs';
    _resetKeysForTests();
    const rawUserId = '01890a5d-ac96-774b-bcce-b302099a8061';

    const { controller, rtcRoom, rtcParticipant, rtcMeetingService, liveKit } =
      buildController();
    liveKit.verifyWebhookEvent.mockResolvedValue({
      event: 'participant_left',
      room: { name: 'meeting-r4' },
      participant: { identity: encryptId(rawUserId) },
    });
    rtcRoom.findUnique.mockResolvedValue({ id: 'r4', kind: 'MEETING' });
    rtcParticipant.updateMany.mockResolvedValue({ count: 1 });

    const { req, res } = fakeReqRes('{}');
    await controller.handleWebhook(req, res);

    expect(rtcParticipant.updateMany).toHaveBeenCalledWith({
      where: { roomId: 'r4', livekitIdentity: rawUserId, leftAt: null },
      data: { leftAt: expect.any(Date) as Date },
    });
    expect(
      rtcMeetingService.notifyParticipantLeftByLiveKit,
    ).toHaveBeenCalledWith('r4', rawUserId);
  });

  it('participant_left tolerates a pre-codec raw identity (sessions live through a deploy)', async () => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-rtc-webhook-specs';
    _resetKeysForTests();
    const rawUserId = '01890a5d-ac96-774b-bcce-b302099a8061';

    const { controller, rtcRoom, rtcParticipant, rtcCallService, liveKit } =
      buildController();
    liveKit.verifyWebhookEvent.mockResolvedValue({
      event: 'participant_left',
      room: { name: 'call-r5' },
      participant: { identity: rawUserId },
    });
    rtcRoom.findUnique.mockResolvedValue({ id: 'r5', kind: 'CALL' });
    rtcParticipant.updateMany.mockResolvedValue({ count: 1 });

    const { req, res } = fakeReqRes('{}');
    await controller.handleWebhook(req, res);

    expect(rtcParticipant.updateMany).toHaveBeenCalledWith({
      where: { roomId: 'r5', livekitIdentity: rawUserId, leftAt: null },
      data: { leftAt: expect.any(Date) as Date },
    });
    // handlePeerLeft needs the LiveKit room name + identity so it can probe
    // whether the "departed" participant already rejoined (full reconnect)
    // before ruling the call over.
    expect(rtcCallService.handlePeerLeft).toHaveBeenCalledWith(
      'r5',
      'call-r5',
      rawUserId,
    );
  });

  // Regression: livekit-client's full reconnect rejoins the same room as a
  // brand-new session right after its own participant_left stamped leftAt.
  // The row means "currently in the room" — a rejoin must clear it.
  it('participant_joined clears a previously stamped leftAt for the rejoining identity', async () => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-rtc-webhook-specs';
    _resetKeysForTests();
    const rawUserId = '01890a5d-ac96-774b-bcce-b302099a8061';

    const { controller, rtcRoom, rtcParticipant, liveKit } = buildController();
    liveKit.verifyWebhookEvent.mockResolvedValue({
      event: 'participant_joined',
      room: { name: 'call-r7' },
      participant: { identity: encryptId(rawUserId) },
    });
    rtcRoom.findUnique.mockResolvedValue({ id: 'r7' });
    rtcParticipant.updateMany.mockResolvedValue({ count: 1 });

    const { req, res, status } = fakeReqRes('{}');
    await controller.handleWebhook(req, res);

    expect(rtcParticipant.updateMany).toHaveBeenCalledWith({
      where: {
        roomId: 'r7',
        livekitIdentity: rawUserId,
        leftAt: { not: null },
      },
      data: { leftAt: null },
    });
    expect(status).toHaveBeenCalledWith(200);
  });

  // BE-031: a host-removed participant's token stays valid for a while, so a
  // direct LiveKit reconnect (never touching joinMeeting) is the one way
  // back in — the webhook is where that gets refused.
  it('participant_joined on a MEETING room asks the meeting service to enforce a removal first, and does not resurrect a removed participant row', async () => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-rtc-webhook-specs';
    _resetKeysForTests();
    const rawUserId = '01890a5d-ac96-774b-bcce-b302099a8061';

    const { controller, rtcRoom, rtcParticipant, rtcMeetingService, liveKit } =
      buildController();
    liveKit.verifyWebhookEvent.mockResolvedValue({
      event: 'participant_joined',
      room: { name: 'meeting-r3' },
      participant: { identity: encryptId(rawUserId) },
    });
    rtcRoom.findUnique.mockResolvedValue({ id: 'r3', kind: 'MEETING' });
    rtcMeetingService.enforceRemovalOnRejoin.mockResolvedValue(true);

    const { req, res, status } = fakeReqRes('{}');
    await controller.handleWebhook(req, res);

    expect(rtcMeetingService.enforceRemovalOnRejoin).toHaveBeenCalledWith(
      'r3',
      'meeting-r3',
      rawUserId,
    );
    expect(rtcParticipant.updateMany).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
  });

  it('participant_joined on a MEETING room still clears leftAt for a participant who was not removed', async () => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-rtc-webhook-specs';
    _resetKeysForTests();
    const rawUserId = '01890a5d-ac96-774b-bcce-b302099a8061';

    const { controller, rtcRoom, rtcParticipant, rtcMeetingService, liveKit } =
      buildController();
    liveKit.verifyWebhookEvent.mockResolvedValue({
      event: 'participant_joined',
      room: { name: 'meeting-r3' },
      participant: { identity: encryptId(rawUserId) },
    });
    rtcRoom.findUnique.mockResolvedValue({ id: 'r3', kind: 'MEETING' });
    rtcMeetingService.enforceRemovalOnRejoin.mockResolvedValue(false);
    rtcParticipant.updateMany.mockResolvedValue({ count: 1 });

    const { req, res } = fakeReqRes('{}');
    await controller.handleWebhook(req, res);

    expect(rtcParticipant.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { leftAt: null } }),
    );
  });

  // Regression for the "watching" counter never leaving 0: the join mutation
  // broadcasts before the viewer's WebRTC connection exists, so this webhook
  // is the only moment the audience count can be settled from a connection
  // that actually happened.
  it('participant_joined on a STREAM room notifies the stream service with the decrypted userId (other kinds stay quiet)', async () => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-rtc-webhook-specs';
    _resetKeysForTests();
    const rawUserId = '01890a5d-ac96-774b-bcce-b302099a8061';

    const { controller, rtcRoom, rtcParticipant, rtcStreamService, liveKit } =
      buildController();
    liveKit.verifyWebhookEvent.mockResolvedValue({
      event: 'participant_joined',
      room: { name: 'stream-r9' },
      participant: { identity: encryptId(rawUserId) },
    });
    rtcRoom.findUnique.mockResolvedValue({ id: 'r9', kind: 'STREAM' });
    rtcParticipant.updateMany.mockResolvedValue({ count: 0 });

    const { req, res } = fakeReqRes('{}');
    await controller.handleWebhook(req, res);

    expect(rtcStreamService.notifyViewerJoinedByLiveKit).toHaveBeenCalledWith(
      'r9',
      rawUserId,
    );
  });

  // Regression: a reconnecting client whose join races the call teardown
  // makes LiveKit auto-recreate the just-deleted room and fire a fresh
  // room_started — observed live flipping an ENDED room's DB row back to
  // ACTIVE forever (the zombie room itself dies via empty timeout, which
  // deliberately doesn't touch RtcRoom.state).
  it('room_started never resurrects an ENDED room row', async () => {
    const { controller, rtcRoom, liveKit } = buildController();
    liveKit.verifyWebhookEvent.mockResolvedValue({
      event: 'room_started',
      room: { name: 'call-r8' },
    });

    const { req, res } = fakeReqRes('{}');
    await controller.handleWebhook(req, res);

    expect(rtcRoom.updateMany).toHaveBeenCalledWith({
      where: { livekitRoomName: 'call-r8', state: { not: 'ENDED' } },
      data: {
        state: 'ACTIVE',
        startedAt: expect.any(Date) as Date,
      },
    });
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
