import { apiFetchJson } from "@/lib/api-client";
import { RTC_MEETINGS_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type {
  RtcReportReason,
  RtcReportView,
} from "@/api/server/rtc/shared-types";

export async function reportMeetingServer(
  slug: string,
  reason: RtcReportReason,
  details?: string,
  reportedUserId?: string,
): Promise<RtcReportView> {
  return apiFetchJson<RtcReportView>(`${RTC_MEETINGS_PREFIX}${slug}/report`, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ reason, details, reportedUserId }),
  });
}
