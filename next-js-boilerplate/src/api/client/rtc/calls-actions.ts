import type { RtcReportReason } from "@/api/server/rtc/shared-types";

export function useCallActions() {
  const reportCall = async (
    callId: string,
    reason: RtcReportReason,
    details?: string,
  ) => {
    const { reportCallServer } = await import("@/api/server/rtc/calls/report");
    return reportCallServer(callId, reason, details);
  };

  return { reportCall };
}
