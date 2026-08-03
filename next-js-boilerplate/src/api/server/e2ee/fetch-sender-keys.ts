import { apiFetchJson } from "@/lib/api-client";
import { E2EE_ROOMS_PREFIX } from "@/constants/api/urls";
import { GET } from "@/constants/api/methods";

export interface WrappedSenderKeyEntry {
  senderDeviceId: string;
  epoch: number;
  wrappedKey: string; // base64
  wrapNonce: string; // base64
  createdAt: string;
}

export async function fetchSenderKeysServer(
  roomSlug: string,
): Promise<WrappedSenderKeyEntry[]> {
  return apiFetchJson<WrappedSenderKeyEntry[]>(
    `${E2EE_ROOMS_PREFIX}${roomSlug}/sender-keys`,
    { method: GET },
  );
}
