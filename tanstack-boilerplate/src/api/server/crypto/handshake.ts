import { apiFetchJson } from "@/lib/api-client";
import { POST } from "@/constants/api/methods";
import {
  DEVICE_TOKEN_HEADER,
  JSON_CONTENT_TYPE_HEADER,
} from "@/constants/api/headers";
import { CRYPTO_HANDSHAKE_URL } from "@/constants/api/urls";

export interface CryptoHandshakeResult {
  serverPublicKey: string;
  c2sSeq?: number;
  s2cSeq?: number;
}

export async function cryptoHandshakeServer(
  publicKey: string,
  deviceToken: string,
): Promise<CryptoHandshakeResult> {
  return apiFetchJson<CryptoHandshakeResult>(CRYPTO_HANDSHAKE_URL, {
    method: POST,
    headers: {
      ...JSON_CONTENT_TYPE_HEADER,
      [DEVICE_TOKEN_HEADER]: deviceToken,
    },
    body: JSON.stringify({ publicKey }),
  });
}
