import { apiFetchJson } from "@/lib/api-client";
import { E2EE_KEYS_OTPK_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function replenishPrekeysServer(
  oneTimePrekeys: Array<{ keyId: string; publicKey: string }>,
): Promise<{ count: number }> {
  return apiFetchJson<{ count: number }>(E2EE_KEYS_OTPK_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ oneTimePrekeys }),
  });
}
