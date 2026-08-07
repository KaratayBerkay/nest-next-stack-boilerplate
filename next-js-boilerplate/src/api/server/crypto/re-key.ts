import { apiFetch } from "@/lib/api-client";
import { POST } from "@/constants/api/methods";
import {
  DEVICE_TOKEN_HEADER,
  JSON_CONTENT_TYPE_HEADER,
} from "@/constants/api/headers";
import { CRYPTO_RE_KEY_URL } from "@/constants/api/urls";

export async function cryptoReKeyServer(deviceToken: string): Promise<void> {
  await apiFetch(CRYPTO_RE_KEY_URL, {
    method: POST,
    headers: {
      ...JSON_CONTENT_TYPE_HEADER,
      [DEVICE_TOKEN_HEADER]: deviceToken,
    },
  });
}
