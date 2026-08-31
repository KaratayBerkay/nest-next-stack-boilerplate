import type { RtcReportReason } from "@/api/server/rtc/shared-types";

// Defined at module scope (not inside useMeetingActions) deliberately: none of
// these close over any hook-local state, so hoisting keeps every function's
// identity stable across renders. Callers put these directly in useEffect dep
// arrays (join-on-mount/leave-on-unmount) — a fresh closure per render (the
// previous shape, all defined inside the hook body) made those deps look
// changed on every re-render, re-firing leave-then-join on every unrelated
// state update (e.g. an incoming chat message) while still in the room.
async function createMeeting(title: string) {
  const { createMeetingServer } =
    await import("@/api/server/rtc/meetings/create");
  return createMeetingServer(title);
}

async function joinMeeting(slug: string) {
  const { joinMeetingServer } = await import("@/api/server/rtc/meetings/join");
  return joinMeetingServer(slug);
}

async function leaveMeeting(slug: string) {
  const { leaveMeetingServer } =
    await import("@/api/server/rtc/meetings/leave");
  return leaveMeetingServer(slug);
}

async function endMeeting(slug: string) {
  const { endMeetingServer } = await import("@/api/server/rtc/meetings/end");
  return endMeetingServer(slug);
}

async function muteParticipant(slug: string, userId: string, muted: boolean) {
  const { muteParticipantServer } =
    await import("@/api/server/rtc/meetings/participants");
  return muteParticipantServer(slug, userId, muted);
}

async function removeParticipant(slug: string, userId: string) {
  const { removeParticipantServer } =
    await import("@/api/server/rtc/meetings/participants");
  return removeParticipantServer(slug, userId);
}

async function inviteToMeeting(slug: string, userId: string) {
  const { inviteToMeetingServer } =
    await import("@/api/server/rtc/meetings/invite");
  return inviteToMeetingServer(slug, userId);
}

async function reportMeeting(
  slug: string,
  reason: RtcReportReason,
  details?: string,
  reportedUserId?: string,
) {
  const { reportMeetingServer } =
    await import("@/api/server/rtc/meetings/report");
  return reportMeetingServer(slug, reason, details, reportedUserId);
}

async function startRecording(slug: string) {
  const { startMeetingRecordingServer } =
    await import("@/api/server/rtc/meetings/recording");
  return startMeetingRecordingServer(slug);
}

async function stopRecording(slug: string) {
  const { stopMeetingRecordingServer } =
    await import("@/api/server/rtc/meetings/recording");
  return stopMeetingRecordingServer(slug);
}

export function useMeetingActions() {
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
