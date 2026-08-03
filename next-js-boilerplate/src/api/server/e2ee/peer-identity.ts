import { apiFetchJson } from "@/lib/api-client";
import { E2EE_KEYS_IDENTITY_PREFIX } from "@/constants/api/urls";
import { GET } from "@/constants/api/methods";

export interface PeerIdentityResponse {
  identitySigningKey: string;
}

export async function fetchPeerIdentityKey(
  userId: string,
): Promise<string | null> {
  try {
    const result = await apiFetchJson<PeerIdentityResponse>(
      `${E2EE_KEYS_IDENTITY_PREFIX}${userId}`,
      { method: GET },
    );
    return result.identitySigningKey;
  } catch {
    return null;
  }
}
