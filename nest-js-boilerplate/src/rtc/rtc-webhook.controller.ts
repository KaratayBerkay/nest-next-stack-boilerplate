import { Controller, Logger, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
// Native @prisma/client enums — see rtc-call.service.ts's import comment for why.
import { RtcRoomKind, RtcRoomState } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LiveKitService } from './livekit.service';
import { RtcCallService } from './rtc-call.service';
import { RtcMeetingService } from './rtc-meeting.service';
import { RtcStreamService } from './rtc-stream.service';

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
      return res.status(413).json({ error: 'Request body too large' });
    }

    let event: Awaited<ReturnType<LiveKitService['verifyWebhookEvent']>>;
    try {
      event = await this.liveKit.verifyWebhookEvent(
        rawBody?.toString() ?? '',
        req.headers.authorization,
      );
    } catch {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    this.logger.log({
      category: 'rtc',
      event: 'webhook.received',
      type: event.event,
      room: event.room?.name,
    });

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
        default:
          // participant_joined/egress_*/ingress_*/track_* — no-op until a
          // later phase creates RtcParticipant rows to update (call/meeting/
          // stream services do that at invite/join time, not this webhook)
          // and wires recording/streaming-out.
          break;
      }
    } catch (err) {
      this.logger.error('RTC webhook handler error', err as Error);
    }

    return res.status(200).json({ received: true });
  }

  private async handleRoomStarted(livekitRoomName?: string) {
    if (!livekitRoomName) return;
    await this.prisma.rtcRoom.updateMany({
      where: { livekitRoomName },
      data: { state: RtcRoomState.ACTIVE, startedAt: new Date() },
    });
  }

  private async handleRoomFinished(livekitRoomName?: string) {
    if (!livekitRoomName) return;
    const room = await this.prisma.rtcRoom.findUnique({
      where: { livekitRoomName },
      select: { id: true, kind: true },
    });
    if (!room) return;
    await this.prisma.rtcRoom.update({
      where: { id: room.id },
      data: { state: RtcRoomState.ENDED, endedAt: new Date() },
    });
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
    await this.prisma.rtcParticipant.updateMany({
      where: { roomId: room.id, livekitIdentity: identity, leftAt: null },
      data: { leftAt: new Date() },
    });
    if (room.kind === RtcRoomKind.CALL) {
      // A 1:1 call is over the moment either side leaves — don't wait for
      // LiveKit's own ~60s departureTimeout to notice via room_finished.
      await this.rtcCallService.handlePeerLeft(room.id);
    } else if (room.kind === RtcRoomKind.MEETING) {
      // The DB leftAt update already happened above (kind-agnostic) — this
      // only notifies peers still in the meeting so a hard-crash/dropped
      // connection isn't silent until someone else's join/leave fires.
      this.rtcMeetingService.notifyParticipantLeftByLiveKit(room.id, identity);
    } else if (room.kind === RtcRoomKind.STREAM) {
      this.rtcStreamService.notifyViewerLeftByLiveKit(room.id, identity);
    }
  }
}
