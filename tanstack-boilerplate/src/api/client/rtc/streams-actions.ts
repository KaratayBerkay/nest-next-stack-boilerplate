import type { RtcReportReason } from "@/api/server/rtc/shared-types";

// Defined at module scope (not inside useStreamActions) deliberately — see
// meetings-actions.ts's comment for why: none of these close over hook-local
// state, so hoisting keeps identity stable across renders instead of
// re-firing join/leave effects on every unrelated re-render.
async function goLive(title: string) {
  const { goLiveServer } = await import("@/api/server/rtc/streams/go-live");
  return goLiveServer(title);
}

async function joinStream(slug: string) {
  const { joinStreamServer } = await import("@/api/server/rtc/streams/join");
  return joinStreamServer(slug);
}

async function leaveStream(slug: string) {
  const { leaveStreamServer } = await import("@/api/server/rtc/streams/leave");
  return leaveStreamServer(slug);
}

async function endStream(slug: string) {
  const { endStreamServer } = await import("@/api/server/rtc/streams/end");
  return endStreamServer(slug);
}

async function reportStream(
  slug: string,
  reason: RtcReportReason,
  details?: string,
  reportedUserId?: string,
) {
  const { reportStreamServer } =
    await import("@/api/server/rtc/streams/report");
  return reportStreamServer(slug, reason, details, reportedUserId);
}

async function startRecording(slug: string) {
  const { startStreamRecordingServer } =
    await import("@/api/server/rtc/streams/recording");
  return startStreamRecordingServer(slug);
}

async function stopRecording(slug: string) {
  const { stopStreamRecordingServer } =
    await import("@/api/server/rtc/streams/recording");
  return stopStreamRecordingServer(slug);
}

export function useStreamActions() {
  return {
    goLive,
    joinStream,
    leaveStream,
    endStream,
    reportStream,
    startRecording,
    stopRecording,
  };
}
