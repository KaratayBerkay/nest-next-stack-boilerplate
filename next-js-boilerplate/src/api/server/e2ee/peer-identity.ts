import { apiFetchJson } from "@/lib/api-client";
import { E2EE_KEYS_IDENTITY_PREFIX } from "@/constants/api/urls";
import { GET } from "@/constants/api/methods";

export interface PeerIdentityResponse {
  identitySigningKey: string;
  identityAgreementKey: string;
}

async function fetchPeerIdentityBundle(
  userId: string,
): Promise<PeerIdentityResponse | null> {
  try {
    return await apiFetchJson<PeerIdentityResponse>(
      `${E2EE_KEYS_IDENTITY_PREFIX}${userId}`,
      { method: GET },
    );
  } catch {
    return null;
  }
}

export async function fetchPeerIdentityKey(
  userId: string,
): Promise<string | null> {
  const result = await fetchPeerIdentityBundle(userId);
  return result?.identitySigningKey ?? null;
}

/** Peer's X25519 identity agreement public key — used to derive a
 * per-recipient room sender-key wrapping secret (see lib/crypto/sender-keys.ts). */
export async function fetchPeerAgreementKey(
  userId: string,
): Promise<string | null> {
  const result = await fetchPeerIdentityBundle(userId);
  return result?.identityAgreementKey ?? null;
}
