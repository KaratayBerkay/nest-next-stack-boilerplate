import type { RtcReportReason } from "@/api/server/rtc/shared-types";

export function useMeetingActions() {
  const createMeeting = async (title: string) => {
    const { createMeetingServer } =
      await import("@/api/server/rtc/meetings/create");
    return createMeetingServer(title);
  };

  const joinMeeting = async (slug: string) => {
    const { joinMeetingServer } =
      await import("@/api/server/rtc/meetings/join");
    return joinMeetingServer(slug);
  };

  const leaveMeeting = async (slug: string) => {
    const { leaveMeetingServer } =
      await import("@/api/server/rtc/meetings/leave");
    return leaveMeetingServer(slug);
  };

  const endMeeting = async (slug: string) => {
    const { endMeetingServer } = await import("@/api/server/rtc/meetings/end");
    return endMeetingServer(slug);
  };

  const muteParticipant = async (
    slug: string,
    userId: string,
    muted: boolean,
  ) => {
    const { muteParticipantServer } =
      await import("@/api/server/rtc/meetings/participants");
    return muteParticipantServer(slug, userId, muted);
  };

  const removeParticipant = async (slug: string, userId: string) => {
    const { removeParticipantServer } =
      await import("@/api/server/rtc/meetings/participants");
    return removeParticipantServer(slug, userId);
  };

  const inviteToMeeting = async (slug: string, userId: string) => {
    const { inviteToMeetingServer } =
      await import("@/api/server/rtc/meetings/invite");
    return inviteToMeetingServer(slug, userId);
  };

  const reportMeeting = async (
    slug: string,
    reason: RtcReportReason,
    details?: string,
    reportedUserId?: string,
  ) => {
    const { reportMeetingServer } =
      await import("@/api/server/rtc/meetings/report");
    return reportMeetingServer(slug, reason, details, reportedUserId);
  };

  const startRecording = async (slug: string) => {
    const { startMeetingRecordingServer } =
      await import("@/api/server/rtc/meetings/recording");
    return startMeetingRecordingServer(slug);
  };

  const stopRecording = async (slug: string) => {
    const { stopMeetingRecordingServer } =
      await import("@/api/server/rtc/meetings/recording");
    return stopMeetingRecordingServer(slug);
  };

  return {
    createMeeting,
    joinMeeting,
    leaveMeeting,
    endMeeting,
    muteParticipant,
    removeParticipant,
    inviteToMeeting,
    reportMeeting,
    startRecording,
    stopRecording,
  };
}
