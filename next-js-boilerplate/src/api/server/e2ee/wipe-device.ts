import { apiFetchJson } from "@/lib/api-client";
import { E2EE_KEYS_WIPE_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";

export interface WipeDeviceResponse {
  wiped: boolean;
}

export async function wipeDeviceKeys(): Promise<WipeDeviceResponse> {
  return apiFetchJson<WipeDeviceResponse>(E2EE_KEYS_WIPE_URL, {
    method: POST,
  });
}
