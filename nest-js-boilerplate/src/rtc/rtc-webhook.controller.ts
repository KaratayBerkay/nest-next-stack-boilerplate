import { Controller, Logger, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
// Native @prisma/client enums — see rtc-call.service.ts's import comment for why.
import { RtcRoomKind, RtcRoomState } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LiveKitService, fromLivekitIdentity } from './livekit.service';
import { RtcCallService } from './rtc-call.service';
import { RtcMeetingService } from './rtc-meeting.service';
import { RtcStreamService } from './rtc-stream.service';
import { rtcErrorLog, rtcLog } from './rtc-logger';

const MAX_WEBHOOK_BODY_BYTES = 1024 * 1024; // 1 MB

/**
 * Receives LiveKit's room/participant/egress lifecycle events and keeps
 * Postgres in sync with what the SFU actually did. Authenticates via
 * LiveKit's own signed Authorization header (verifyWebhookEvent), not a
 * session — same shape as StripeWebhookController.
 */
@Controller('rtc/webhook')
export class RtcWebhookController {
  private readonly logger = new Logger(RtcWebhookController.name);

  constructor(
    private readonly liveKit: LiveKitService,
    private readonly prisma: PrismaService,
    private readonly rtcCallService: RtcCallService,
    private readonly rtcMeetingService: RtcMeetingService,
    private readonly rtcStreamService: RtcStreamService,
  ) {}

  @Post('livekit')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const rawBody = (req as unknown as { rawBody: Buffer }).rawBody;
    if (rawBody?.length > MAX_WEBHOOK_BODY_BYTES) {
      this.logger.warn(
        rtcLog('webhook.rejected', {
          reason: 'body_too_large',
          bodyBytes: rawBody.length,
        }),
      );
      return res.status(413).json({ error: 'Request body too large' });
    }

    let event: Awaited<ReturnType<LiveKitService['verifyWebhookEvent']>>;
    try {
      event = await this.liveKit.verifyWebhookEvent(
        rawBody?.toString() ?? '',
        req.headers.authorization,
      );
    } catch (error) {
      this.logger.warn(
        rtcErrorLog('webhook.rejected', error, {
          reason: 'invalid_signature',
        }),
      );
      return res.status(400).json({ error: 'Invalid signature' });
    }

    this.logger.log(
      rtcLog('webhook.received', {
        type: event.event,
        roomName: event.room?.name,
      }),
    );

    try {
      switch (event.event) {
        case 'room_started':
          await this.handleRoomStarted(event.room?.name);
          break;
        case 'room_finished':
          await this.handleRoomFinished(event.room?.name);
          break;
        case 'participant_left':
          await this.handleParticipantLeft(
            event.room?.name,
            event.participant?.identity,
          );
          break;
        case 'participant_joined':
          await this.handleParticipantJoined(
            event.room?.name,
            event.participant?.identity,
          );
          break;
        default:
          // egress_*/ingress_*/track_* — no-op until a later phase wires
          // recording/streaming-out.
          break;
      }
    } catch (err) {
      this.logger.error(
        rtcErrorLog('webhook.handler_failed', err, {
          type: event.event,
          roomName: event.room?.name,
        }),
      );
    }

    return res.status(200).json({ received: true });
  }

  private async handleRoomStarted(livekitRoomName?: string) {
    if (!livekitRoomName) return;
    // `state: { not: ENDED }` — a reconnecting client whose join races the
    // room teardown makes LiveKit auto-recreate the room (the token still
    // grants roomJoin for that name), firing a fresh room_started for a
    // call/meeting that is already over. That zombie room dies on its own
    // via empty/departure timeout; it must not resurrect the DB row to
    // ACTIVE (observed live during the participant_left reconnect storm).
    await this.prisma.rtcRoom.updateMany({
      where: { livekitRoomName, state: { not: RtcRoomState.ENDED } },
      data: { state: RtcRoomState.ACTIVE, startedAt: new Date() },
    });
  }

  /** A rejoin (livekit-client's full reconnect creates a brand-new session
   *  for the same identity) must clear the leftAt its own participant_left
   *  just stamped — the row means "currently in the room". */
  private async handleParticipantJoined(
    livekitRoomName?: string,
    identity?: string,
  ) {
    if (!livekitRoomName || !identity) return;
    const room = await this.prisma.rtcRoom.findUnique({
      where: { livekitRoomName },
      select: { id: true, kind: true },
    });
    if (!room) return;
    const userId = fromLivekitIdentity(identity);
    // A host-removed meeting participant reconnecting on their leftover
    // token is kicked again here and must NOT get their row resurrected —
    // this is the one path into the room that bypasses joinMeeting's check.
    if (
      room.kind === RtcRoomKind.MEETING &&
      (await this.rtcMeetingService.enforceRemovalOnRejoin(
        room.id,
        livekitRoomName,
        userId,
      ))
    ) {
      return;
    }
    await this.prisma.rtcParticipant.updateMany({
      where: {
        roomId: room.id,
        livekitIdentity: userId,
        leftAt: { not: null },
      },
      data: { leftAt: null },
    });
    if (room.kind === RtcRoomKind.STREAM) {
      // A viewer only exists in LiveKit's room from this moment — this is
      // the broadcast that settles the watcher count after the REST-join
      // frame and after a full reconnect's left/joined webhook pair (the
      // service itself filters out broadcaster connects).
      this.rtcStreamService.notifyViewerJoinedByLiveKit(room.id, userId);
    }
  }

  private async handleRoomFinished(livekitRoomName?: string) {
    if (!livekitRoomName) return;
    const room = await this.prisma.rtcRoom.findUnique({
      where: { livekitRoomName },
      select: { id: true, kind: true },
    });
    if (!room) return;
    // Deliberately NOT updating RtcRoom.state here — each kind-specific
    // handler below already transitions it to ENDED as part of its own
    // cleanup (endCall/finishMeeting/finishStream), guarded by its own
    // idempotency check. Doing it here too used to race ahead of that:
    // RtcMeetingService.handleRoomEndedByLiveKit guards on this exact same
    // RtcRoom.state field, so its "already ended, nothing to do" check was
    // always true by the time it ran — finishMeeting (participant leftAt
    // backfill + the rtc:meeting-ended broadcast) never fired for a meeting
    // that ended via LiveKit noticing an empty room, only for one ended via
    // an explicit endMeeting() call or the duration sweep. Calls/streams
    // happened to be immune (they guard on CallSession.state/LiveStream
    // .isLive, separate columns this update never touched), which is why
    // this was invisible outside meetings specifically.
    if (room.kind === RtcRoomKind.CALL) {
      // Safety net for whenever handleParticipantLeft's early-close didn't
      // already end the CallSession (e.g. both sides drop near-
      // simultaneously) — no-ops if it's already ENDED.
      await this.rtcCallService.handleRoomEndedByLiveKit(room.id);
    } else if (room.kind === RtcRoomKind.MEETING) {
      // Safety net for whenever nobody called endMeeting explicitly (e.g.
      // every participant's connection just dropped) — no-ops if already
      // ENDED (explicit end / the duration sweep both race this webhook).
      await this.rtcMeetingService.handleRoomEndedByLiveKit(room.id);
    } else if (room.kind === RtcRoomKind.STREAM) {
      // Safety net for whenever nobody called endStream explicitly — no-ops
      // if already !isLive.
      await this.rtcStreamService.handleRoomEndedByLiveKit(room.id);
    }
  }

  private async handleParticipantLeft(
    livekitRoomName?: string,
    identity?: string,
  ) {
    if (!livekitRoomName || !identity) return;
    const room = await this.prisma.rtcRoom.findUnique({
      where: { livekitRoomName },
      select: { id: true, kind: true },
    });
    if (!room) return;
    // LiveKit reports the encrypted identity the token was minted with
    // (see toLivekitIdentity) — map it back to the raw userId that
    // RtcParticipant.livekitIdentity stores and the notify handlers expect.
    const userId = fromLivekitIdentity(identity);
    await this.prisma.rtcParticipant.updateMany({
      where: { roomId: room.id, livekitIdentity: userId, leftAt: null },
      data: { leftAt: new Date() },
    });
    if (room.kind === RtcRoomKind.CALL) {
      // A 1:1 call is over when either side genuinely leaves — but the
      // service first has to rule out livekit-client's leave+rejoin full
      // reconnect, so it gets the room name + identity to probe LiveKit
      // with (see RtcCallService.handlePeerLeft's grace window).
      await this.rtcCallService.handlePeerLeft(
        room.id,
        livekitRoomName,
        userId,
      );
    } else if (room.kind === RtcRoomKind.MEETING) {
      // The DB leftAt update already happened above (kind-agnostic) — this
      // only notifies peers still in the meeting so a hard-crash/dropped
      // connection isn't silent until someone else's join/leave fires.
      this.rtcMeetingService.notifyParticipantLeftByLiveKit(room.id, userId);
    } else if (room.kind === RtcRoomKind.STREAM) {
      this.rtcStreamService.notifyViewerLeftByLiveKit(room.id, userId);
    }
  }
}
