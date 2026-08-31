import { apiFetchJson } from "@/lib/api-client";
import { AUTH_TRUST_DEVICE_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export async function trustDeviceServer(): Promise<{ success: boolean }> {
  return apiFetchJson<{ success: boolean }>(AUTH_TRUST_DEVICE_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
  });
}
