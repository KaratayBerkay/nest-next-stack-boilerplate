import { RtcMeetingSweepService } from './rtc-meeting-sweep.service';

function buildService() {
  const rtcRoom = { findMany: jest.fn() };
  const prisma = { rtcRoom };
  const meetings = {
    forceEndExpiredMeeting: jest.fn().mockResolvedValue(undefined),
    sendDurationWarning: jest.fn(),
  };
  const service = new RtcMeetingSweepService(
    prisma as never,
    meetings as never,
  );
  return { service, rtcRoom, meetings };
}

function activeRoom(slug: string, minutesElapsed: number, capMinutes = 40) {
  return {
    id: `room-${slug}`,
    startedAt: new Date(Date.now() - minutesElapsed * 60_000),
    meeting: { slug, maxDurationMinutes: capMinutes },
  };
}

describe('RtcMeetingSweepService', () => {
  it('warns once inside the lead window, not again on the next tick', async () => {
    const { service, rtcRoom, meetings } = buildService();
    // 39.5 minutes into a 40-minute cap => inside the 60s lead window.
    rtcRoom.findMany.mockResolvedValue([activeRoom('m1', 39.5)]);

    await service.sweep();
    await service.sweep();

    expect(meetings.sendDurationWarning).toHaveBeenCalledTimes(1);
    expect(meetings.forceEndExpiredMeeting).not.toHaveBeenCalled();
  });

  it('prunes the warned entry once the meeting leaves the active scan — regression for slugs of meetings that ended inside their warning window (host ended it / room_finished beat the expiry tick) accumulating in the set forever', async () => {
    const { service, rtcRoom, meetings } = buildService();
    rtcRoom.findMany.mockResolvedValue([activeRoom('m1', 39.5)]);
    await service.sweep();
    expect(meetings.sendDurationWarning).toHaveBeenCalledTimes(1);

    // The meeting ended by other means: no longer in the ACTIVE scan.
    rtcRoom.findMany.mockResolvedValue([]);
    await service.sweep();

    const warned = (service as unknown as { warned: Set<string> }).warned;
    expect(warned.size).toBe(0);
  });

  it('force-ends a meeting past its cap', async () => {
    const { service, rtcRoom, meetings } = buildService();
    rtcRoom.findMany.mockResolvedValue([activeRoom('m2', 41)]);

    await service.sweep();

    expect(meetings.forceEndExpiredMeeting).toHaveBeenCalledWith('m2');
    expect(meetings.sendDurationWarning).not.toHaveBeenCalled();
  });
});
