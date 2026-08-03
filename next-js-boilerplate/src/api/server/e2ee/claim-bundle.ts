import { apiFetchJson } from "@/lib/api-client";
import { E2EE_KEYS_BUNDLE_CLAIM_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { DeviceBundle } from "@/lib/crypto/types";

export interface ClaimBundleResponse {
  deviceId: string;
  bundle: DeviceBundle;
  oneTimePrekey?: { keyId: string; publicKey: string };
}

export async function claimBundleServer(
  targetUserId: string,
): Promise<ClaimBundleResponse> {
  return apiFetchJson<ClaimBundleResponse>(
    `${E2EE_KEYS_BUNDLE_CLAIM_PREFIX}${targetUserId}/claim`,
    {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({}),
    },
  );
}
