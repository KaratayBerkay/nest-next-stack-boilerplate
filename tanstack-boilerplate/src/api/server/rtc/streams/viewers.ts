import { apiFetchJson } from "@/lib/api-client";
import { RTC_STREAMS_PREFIX } from "@/constants/api/urls";
import type { StreamViewerView } from "./types";

export async function getStreamViewersServer(
  slug: string,
): Promise<StreamViewerView[]> {
  return apiFetchJson<StreamViewerView[]>(
    `${RTC_STREAMS_PREFIX}${slug}/viewers`,
  );
}
