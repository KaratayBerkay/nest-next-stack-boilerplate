import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RtcRecordingStatus } from '@prisma/client';
import { RtcRecordingService } from './rtc-recording.service';

function buildService() {
  const meeting = { findUnique: jest.fn() };
  const liveStream = { findUnique: jest.fn() };
  const rtcParticipant = { findUnique: jest.fn() };
  const rtcRecording = {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  };

  const prisma = { meeting, liveStream, rtcParticipant, rtcRecording };
  const service = new RtcRecordingService(prisma as never);

  return { service, meeting, liveStream, rtcParticipant, rtcRecording };
}

describe('RtcRecordingService', () => {
  describe('recordingForRoom', () => {
    it('returns null when the room does not exist, without checking participation', async () => {
      const { service, meeting, rtcParticipant } = buildService();
      meeting.findUnique.mockResolvedValue(null);

      const result = await service.recordingForRoom(
        'meeting',
        'ghost-slug',
        'u1',
      );

      expect(result).toBeNull();
      expect(rtcParticipant.findUnique).not.toHaveBeenCalled();
    });

    it('rejects a caller who is not a participant of the meeting', async () => {
      const { service, meeting, rtcParticipant, rtcRecording } = buildService();
      meeting.findUnique.mockResolvedValue({ roomId: 'room1' });
      rtcParticipant.findUnique.mockResolvedValue(null);

      await expect(
        service.recordingForRoom('meeting', 'my-meeting', 'stranger'),
      ).rejects.toThrow(ForbiddenException);
      expect(rtcParticipant.findUnique).toHaveBeenCalledWith({
        where: { roomId_userId: { roomId: 'room1', userId: 'stranger' } },
      });
      expect(rtcRecording.findUnique).not.toHaveBeenCalled();
    });

    it('rejects a caller who is not a participant of the stream', async () => {
      const { service, liveStream, rtcParticipant } = buildService();
      liveStream.findUnique.mockResolvedValue({ roomId: 'room2' });
      rtcParticipant.findUnique.mockResolvedValue(null);

      await expect(
        service.recordingForRoom('stream', 'my-stream', 'stranger'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('returns the recording row for a genuine participant', async () => {
      const { service, meeting, rtcParticipant, rtcRecording } = buildService();
      meeting.findUnique.mockResolvedValue({ roomId: 'room1' });
      rtcParticipant.findUnique.mockResolvedValue({ id: 'p1' });
      rtcRecording.findUnique.mockResolvedValue({
        roomId: 'room1',
        status: RtcRecordingStatus.RECORDING,
      });

      const result = await service.recordingForRoom(
        'meeting',
        'my-meeting',
        'member',
      );

      expect(result).toEqual({
        roomId: 'room1',
        status: RtcRecordingStatus.RECORDING,
      });
    });
  });

  describe('startRecording / stopRecording', () => {
    it('lets the meeting host start a recording', async () => {
      const { service, meeting, rtcRecording } = buildService();
      meeting.findUnique.mockResolvedValue({
        roomId: 'room1',
        hostId: 'host1',
      });
      rtcRecording.findUnique.mockResolvedValue(null);
      rtcRecording.upsert.mockResolvedValue({ roomId: 'room1' });

      await service.startRecording('host1', 'meeting', 'my-meeting');

      expect(rtcRecording.upsert).toHaveBeenCalled();
    });

    it('rejects a non-host trying to start a meeting recording', async () => {
      const { service, meeting } = buildService();
      meeting.findUnique.mockResolvedValue({
        roomId: 'room1',
        hostId: 'host1',
      });

      await expect(
        service.startRecording('not-the-host', 'meeting', 'my-meeting'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects a non-broadcaster trying to stop a stream recording', async () => {
      const { service, liveStream } = buildService();
      liveStream.findUnique.mockResolvedValue({
        roomId: 'room2',
        broadcasterId: 'bcaster1',
      });

      await expect(
        service.stopRecording('viewer1', 'stream', 'my-stream'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException for an unknown meeting slug', async () => {
      const { service, meeting } = buildService();
      meeting.findUnique.mockResolvedValue(null);

      await expect(
        service.startRecording('host1', 'meeting', 'ghost-slug'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
