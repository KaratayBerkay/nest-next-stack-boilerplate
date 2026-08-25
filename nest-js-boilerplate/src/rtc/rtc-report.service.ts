import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { RtcReportReason } from '@prisma/client';

/**
 * Minimal, real reporting for RTC content (Phase 5) — a report is a
 * persisted row, nothing more: no review queue, no moderation action, no
 * auto-suspension. That tooling is a separate future initiative; this only
 * guarantees abuse reports are captured and queryable rather than lost.
 *
 * Every report is anchored to an RtcRoom (the kind-agnostic parent shared by
 * calls/meetings/streams — see RtcRoom's schema doc), so one model and one
 * service cover all three domains instead of three near-identical ones.
 * `reporterId` must have actually been a participant of the room at some
 * point (RtcParticipant existed, not necessarily still active) — proves
 * genuine engagement without blocking a report filed right as the reporter
 * leaves, which is often exactly when something worth reporting happened.
 */
@Injectable()
export class RtcReportService {
  constructor(private readonly prisma: PrismaService) {}

  async reportMeeting(
    reporterId: string,
    slug: string,
    reason: RtcReportReason,
    details: string | undefined,
    reportedUserId: string | undefined,
  ) {
    const meeting = await this.prisma.meeting.findUnique({ where: { slug } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    return this.createReport(
      meeting.roomId,
      reporterId,
      reason,
      details,
      reportedUserId,
    );
  }

  async reportStream(
    reporterId: string,
    slug: string,
    reason: RtcReportReason,
    details: string | undefined,
    reportedUserId: string | undefined,
  ) {
    const stream = await this.prisma.liveStream.findUnique({
      where: { slug },
    });
    if (!stream) throw new NotFoundException('Stream not found');
    return this.createReport(
      stream.roomId,
      reporterId,
      reason,
      details,
      reportedUserId,
    );
  }

  async reportCall(
    reporterId: string,
    callId: string,
    reason: RtcReportReason,
    details: string | undefined,
  ) {
    const call = await this.prisma.callSession.findUnique({
      where: { id: callId },
    });
    if (!call) throw new NotFoundException('Call not found');
    if (call.callerId !== reporterId && call.calleeId !== reporterId) {
      throw new ForbiddenException('Not a participant of this call');
    }
    const reportedUserId =
      call.callerId === reporterId ? call.calleeId : call.callerId;
    return this.createReport(
      call.roomId,
      reporterId,
      reason,
      details,
      reportedUserId,
    );
  }

  private async createReport(
    roomId: string,
    reporterId: string,
    reason: RtcReportReason,
    details: string | undefined,
    reportedUserId: string | undefined,
  ) {
    const wasParticipant = await this.prisma.rtcParticipant.findUnique({
      where: { roomId_userId: { roomId, userId: reporterId } },
    });
    if (!wasParticipant) {
      throw new ForbiddenException('Not a participant of this room');
    }
    if (reportedUserId) {
      const targetWasParticipant = await this.prisma.rtcParticipant.findUnique({
        where: { roomId_userId: { roomId, userId: reportedUserId } },
      });
      if (!targetWasParticipant) {
        throw new NotFoundException('Reported user was not in this room');
      }
    }
    return this.prisma.rtcReport.create({
      data: {
        roomId,
        reporterId,
        reportedUserId: reportedUserId ?? null,
        reason,
        details: details?.trim().slice(0, 1000) || null,
      },
    });
  }
}
