import { apiFetchJson } from "@/lib/api-client";
import { SESSIONS_REVOKE_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function revokeSessionServer(sessionId: string): Promise<void> {
  await apiFetchJson(SESSIONS_REVOKE_URL, {
    method: POST,
    body: JSON.stringify({ sessionId }),
    headers: JSON_CONTENT_TYPE_HEADER,
  });
}
