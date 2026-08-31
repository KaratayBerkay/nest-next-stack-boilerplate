import { apiFetch } from "@/lib/api-client";
import { ADMIN_SET_TIER_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface SetTierResult {
  success: boolean;
  error?: string;
  notPermitted?: boolean;
}

export async function setTierServer(
  userId: string,
  tier: string,
): Promise<SetTierResult> {
  try {
    const res = await apiFetch(ADMIN_SET_TIER_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({ userId, tier }),
    });
    if (res.ok) {
      // The route's 200 body is `{ ok: boolean }` — the mutation itself
      // returns false (not an HTTP error) when the backend's role-hierarchy
      // check silently denies the change (e.g. an ADMIN targeting another
      // ADMIN). Only checking res.ok here previously reported "success" for
      // a denied change.
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
