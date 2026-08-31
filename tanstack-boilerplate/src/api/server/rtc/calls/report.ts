import { apiFetchJson } from "@/lib/api-client";
import { RTC_CALLS_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type {
  RtcReportReason,
  RtcReportView,
} from "@/api/server/rtc/shared-types";

export async function reportCallServer(
  callId: string,
  reason: RtcReportReason,
  details?: string,
): Promise<RtcReportView> {
  return apiFetchJson<RtcReportView>(`${RTC_CALLS_PREFIX}${callId}/report`, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ reason, details }),
  });
}
