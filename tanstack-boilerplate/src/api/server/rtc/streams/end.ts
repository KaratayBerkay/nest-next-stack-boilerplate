import { apiFetchJson } from "@/lib/api-client";
import { RTC_STREAMS_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

export async function endStreamServer(slug: string): Promise<void> {
  await apiFetchJson(`${RTC_STREAMS_PREFIX}${slug}/end`, { method: POST });
}
