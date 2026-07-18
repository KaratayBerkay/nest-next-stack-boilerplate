import { apiFetch } from "@/lib/api-client";
import { ADMIN_SET_TIER_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface SetTierResult {
  success: boolean;
  error?: string;
}

export async function setTierServer(userId: string, tier: string): Promise<SetTierResult> {
  try {
    const res = await apiFetch(ADMIN_SET_TIER_URL, {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({ userId, tier }),
    });
    if (res.ok) return { success: true };
    const data = await res.json().catch(() => ({}));
    return { success: false, error: data.error ?? "Failed to update tier" };
  } catch {
    return { success: false, error: "Network error" };
  }
}
