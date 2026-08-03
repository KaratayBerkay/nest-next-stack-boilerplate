import { apiFetchJson } from "@/lib/api-client";
import { E2EE_ROOMS_PREFIX } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface PublishSenderKeysBody {
  senderDeviceId: string;
  epoch: number;
  keys: Array<{
    recipientDeviceId: string;
    wrappedKey: string; // base64
    wrapNonce: string; // base64
  }>;
}

export async function publishSenderKeysServer(
  roomSlug: string,
  body: PublishSenderKeysBody,
): Promise<{ count: number }> {
  return apiFetchJson<{ count: number }>(
    `${E2EE_ROOMS_PREFIX}${roomSlug}/sender-keys`,
    {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify(body),
    },
  );
}
