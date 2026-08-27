import { apiFetchJson } from "@/lib/api-client";
import { API_KEYS_PREFIX } from "@/constants/api/urls";
import { PATCH } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { ApiKeyInfo } from "./list";

export async function updateApiKeyServer(
  id: string,
  changes: { name?: string; enabled?: boolean },
): Promise<ApiKeyInfo> {
  return apiFetchJson<ApiKeyInfo>(API_KEYS_PREFIX + id, {
    method: PATCH,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify(changes),
  });
}
