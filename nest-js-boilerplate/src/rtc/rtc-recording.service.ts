import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RtcRecordingStatus } from '@prisma/client';

export type RtcRecordingRoomKind = 'meeting' | 'stream';

/**
 * Scaffolding only (Phase 5, deliberately deferred live-wiring — see the
 * RtcRecording model's schema doc). Persists host/broadcaster intent and
 * timestamps so the start/stop-recording seam exists end-to-end (DB, API,
 * UI), but never actually starts a LiveKit Egress process: `egressId` and
 * `fileUrl` stay null forever in this phase. A future phase wires a real
 * `livekit/egress` container + S3-compatible output here — swap the no-op
 * bodies below for real `EgressClient` calls without touching callers.
 */
@Injectable()
export class RtcRecordingService {
  constructor(private readonly prisma: PrismaService) {}

  async startRecording(
    userId: string,
    kind: RtcRecordingRoomKind,
    slug: string,
  ) {
    const roomId = await this.resolveRoomIdAsController(kind, slug, userId);
    const existing = await this.prisma.rtcRecording.findUnique({
      where: { roomId },
    });
    if (existing?.status === RtcRecordingStatus.RECORDING) return existing;
    return this.prisma.rtcRecording.upsert({
      where: { roomId },
      create: {
        roomId,
        requestedById: userId,
        status: RtcRecordingStatus.RECORDING,
        startedAt: new Date(),
      },
      update: {
        requestedById: userId,
        status: RtcRecordingStatus.RECORDING,
        startedAt: new Date(),
        endedAt: null,
      },
    });
  }

  async stopRecording(
    userId: string,
    kind: RtcRecordingRoomKind,
    slug: string,
  ) {
    const roomId = await this.resolveRoomIdAsController(kind, slug, userId);
    const existing = await this.prisma.rtcRecording.findUnique({
      where: { roomId },
    });
    if (existing?.status !== RtcRecordingStatus.RECORDING) {
      throw new NotFoundException('No recording in progress');
    }
    return this.prisma.rtcRecording.update({
      where: { roomId },
      data: { status: RtcRecordingStatus.STOPPED, endedAt: new Date() },
    });
  }

  async recordingForRoom(kind: RtcRecordingRoomKind, slug: string) {
    const roomId = await this.resolveRoomId(kind, slug);
    if (!roomId) return null;
    return this.prisma.rtcRecording.findUnique({ where: { roomId } });
  }

  private async resolveRoomId(
    kind: RtcRecordingRoomKind,
    slug: string,
  ): Promise<string | null> {
    if (kind === 'meeting') {
      const meeting = await this.prisma.meeting.findUnique({
        where: { slug },
        select: { roomId: true },
      });
      return meeting?.roomId ?? null;
    }
    const stream = await this.prisma.liveStream.findUnique({
      where: { slug },
      select: { roomId: true },
    });
    return stream?.roomId ?? null;
  }

  private async resolveRoomIdAsController(
    kind: RtcRecordingRoomKind,
    slug: string,
    userId: string,
  ): Promise<string> {
    if (kind === 'meeting') {
      const meeting = await this.prisma.meeting.findUnique({
        where: { slug },
        select: { roomId: true, hostId: true },
      });
      if (!meeting) throw new NotFoundException('Meeting not found');
      if (meeting.hostId !== userId) {
        throw new ForbiddenException('Only the host can control recording');
      }
      return meeting.roomId;
    }
    const stream = await this.prisma.liveStream.findUnique({
      where: { slug },
      select: { roomId: true, broadcasterId: true },
    });
    if (!stream) throw new NotFoundException('Stream not found');
    if (stream.broadcasterId !== userId) {
      throw new ForbiddenException(
        'Only the broadcaster can control recording',
      );
    }
    return stream.roomId;
  }
}
