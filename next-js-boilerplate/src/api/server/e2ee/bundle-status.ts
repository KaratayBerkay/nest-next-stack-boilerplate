import { apiFetchJson } from "@/lib/api-client";
import { E2EE_KEYS_STATUS_PREFIX } from "@/constants/api/urls";
import { GET } from "@/constants/api/methods";

export interface BundleStatusResponse {
  registered: boolean;
  deviceId?: string;
}

export async function getBundleStatusServer(
  userId: string,
): Promise<BundleStatusResponse> {
  return apiFetchJson<BundleStatusResponse>(
    `${E2EE_KEYS_STATUS_PREFIX}${userId}`,
    { method: GET },
  );
}
