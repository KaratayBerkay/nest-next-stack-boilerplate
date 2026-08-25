import type { RtcReportReason } from "@/api/server/rtc/shared-types";

export function useStreamActions() {
  const goLive = async (title: string) => {
    const { goLiveServer } = await import("@/api/server/rtc/streams/go-live");
    return goLiveServer(title);
  };

  const joinStream = async (slug: string) => {
    const { joinStreamServer } = await import("@/api/server/rtc/streams/join");
    return joinStreamServer(slug);
  };

  const leaveStream = async (slug: string) => {
    const { leaveStreamServer } =
      await import("@/api/server/rtc/streams/leave");
    return leaveStreamServer(slug);
  };

  const endStream = async (slug: string) => {
    const { endStreamServer } = await import("@/api/server/rtc/streams/end");
    return endStreamServer(slug);
  };

  const reportStream = async (
    slug: string,
    reason: RtcReportReason,
    details?: string,
    reportedUserId?: string,
  ) => {
    const { reportStreamServer } =
      await import("@/api/server/rtc/streams/report");
    return reportStreamServer(slug, reason, details, reportedUserId);
  };

  const startRecording = async (slug: string) => {
    const { startStreamRecordingServer } =
      await import("@/api/server/rtc/streams/recording");
    return startStreamRecordingServer(slug);
  };

  const stopRecording = async (slug: string) => {
    const { stopStreamRecordingServer } =
      await import("@/api/server/rtc/streams/recording");
    return stopStreamRecordingServer(slug);
  };

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
