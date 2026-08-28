import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RtcRoomKind, RtcRoomState } from '@prisma/client';
import {
  MEETING_LIMIT_WARNING_LEAD_SECONDS,
  RtcMeetingService,
} from './rtc-meeting.service';
import { rtcErrorLog } from './rtc-logger';

const SWEEP_INTERVAL_MS = 30_000;

/**
 * Cross-replica-safe duration cap for meetings — a periodic full scan of
 * active MEETING rooms rather than a per-meeting in-process setTimeout (the
 * mechanism 1:1 calls use, and explicitly accept the risk of for calls: a
 * timer stranded on a replica that restarts mid-call). Meetings can't take
 * that same risk — they're long enough-lived, and a mis-fired participant
 * cap matters enough, that "any replica catches it up to SWEEP_INTERVAL_MS
 * late" beats "the one replica that started the timer must survive."
 * Ending an already-ended meeting is a no-op (RtcMeetingService guards on
 * RtcRoom.state), so every replica racing the same tick is harmless.
 *
 * The warning-sent dedup is a plain in-memory Set — not persisted, so a
 * multi-replica deployment can send the warning more than once (one per
 * replica whose tick lands in the window) or, if every replica restarts
 * mid-window, not at all. Same class of accepted gap as 1:1 calls' own
 * per-replica timers; a duplicated or missed warning banner is low-stakes
 * next to the (idempotent, always-correct) forced end itself.
 */
@Injectable()
export class RtcMeetingSweepService {
  private readonly logger = new Logger(RtcMeetingSweepService.name);
  private readonly warned = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly meetings: RtcMeetingService,
  ) {}

  @Interval(SWEEP_INTERVAL_MS)
  async sweep(): Promise<void> {
    const loadRooms = () =>
      this.prisma.rtcRoom.findMany({
        where: {
          kind: RtcRoomKind.MEETING,
          state: RtcRoomState.ACTIVE,
          startedAt: { not: null },
        },
        include: { meeting: true },
      });
    let rooms: Awaited<ReturnType<typeof loadRooms>>;
    try {
      rooms = await loadRooms();
    } catch (error) {
      this.logger.error(
        rtcErrorLog('meeting.expiry_sweep_failed', error, {
          reason: 'room_scan_failed',
        }),
      );
      return;
    }

    // Prune warned entries whose meeting is no longer in the active scan —
    // a meeting that ended inside its warning window (host ended it, or the
    // room_finished webhook beat the expiry tick) otherwise left its slug in
    // the set forever.
    const activeSlugs = new Set(
      rooms.flatMap((r) => (r.meeting ? [r.meeting.slug] : [])),
    );
    for (const slug of this.warned) {
      if (!activeSlugs.has(slug)) this.warned.delete(slug);
    }

    const now = Date.now();
    for (const room of rooms) {
      if (!room.meeting || !room.startedAt) continue;
      const capMs = room.meeting.maxDurationMinutes * 60_000;
      const elapsedMs = now - room.startedAt.getTime();
      const remainingMs = capMs - elapsedMs;

      if (remainingMs <= 0) {
        this.warned.delete(room.meeting.slug);
        try {
          await this.meetings.forceEndExpiredMeeting(room.meeting.slug);
        } catch (err) {
          this.logger.error(
            rtcErrorLog('meeting.expiry_sweep_failed', err, {
              slug: room.meeting.slug,
              roomId: room.id,
            }),
          );
        }
        continue;
      }

      if (
        remainingMs <= MEETING_LIMIT_WARNING_LEAD_SECONDS * 1000 &&
        !this.warned.has(room.meeting.slug)
      ) {
        this.warned.add(room.meeting.slug);
        this.meetings.sendDurationWarning(
          room.meeting.slug,
          Math.round(remainingMs / 1000),
        );
      }
    }
  }
}
