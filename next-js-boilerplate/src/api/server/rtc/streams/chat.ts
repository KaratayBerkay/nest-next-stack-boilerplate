import { apiFetchJson } from "@/lib/api-client";
import { RTC_STREAMS_PREFIX } from "@/constants/api/urls";
import type { StreamChatMessagesPage } from "./types";

export async function getStreamChatServer(
  slug: string,
  before?: string,
  take?: number,
): Promise<StreamChatMessagesPage> {
  const params = new URLSearchParams();
  if (before) params.set("before", before);
  if (take) params.set("take", String(take));
  const qs = params.toString();
  return apiFetchJson<StreamChatMessagesPage>(
    `${RTC_STREAMS_PREFIX}${slug}/chat${qs ? `?${qs}` : ""}`,
  );
}
