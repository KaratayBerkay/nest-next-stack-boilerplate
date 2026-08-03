import { apiFetchJson } from "@/lib/api-client";
import { E2EE_KEYS_BUNDLE_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { DeviceBundle } from "@/lib/crypto/types";

export interface RegisterBundlePayload {
  bundle: DeviceBundle;
  oneTimePrekeys?: Array<{ keyId: string; publicKey: string }>;
}

export interface RegisterBundleResponse {
  deviceId: string;
  superseded: boolean;
}

export async function registerBundleServer(
  payload: RegisterBundlePayload,
): Promise<RegisterBundleResponse> {
  return apiFetchJson<RegisterBundleResponse>(E2EE_KEYS_BUNDLE_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify(payload),
  });
}
