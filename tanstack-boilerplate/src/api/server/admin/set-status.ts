import { apiFetch } from "@/lib/api-client";
import { ADMIN_SET_STATUS_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface SetStatusResult {
  success: boolean;
  error?: string;
  notPermitted?: boolean;
}

export async function setStatusServer(
  userId: string,
  status: string,
  reason?: string,
): Promise<SetStatusResult> {
  try {
    const res = await apiFetch(ADMIN_SET_STATUS_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({ userId, status, reason }),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.ok === false) {
        return { success: false, notPermitted: true };
      }
      return { success: true };
    }
    // The route's error body is graphqlErrorBody()'s shape ({statusCode,
    // exc, msg, key}) — it has never had an `.error` field, so this always
    // fell through to the hardcoded English default regardless of what the
    // backend actually reported.
    const data = await res.json().catch(() => ({}));
    return { success: false, error: data.msg };
  } catch {
    return { success: false };
  }
}
