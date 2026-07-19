import { apiFetchJson } from "@/lib/api-client";
import { API_KEYS_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface CreateApiKeyResult {
  fullKey: string;
  key: { id: string; name: string; keyPrefix: string };
}

export async function createApiKeyServer(
  name: string,
  expiresInDays: number | null,
): Promise<CreateApiKeyResult> {
  return apiFetchJson<CreateApiKeyResult>(API_KEYS_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ name: name.trim(), expiresInDays }),
  });
}
