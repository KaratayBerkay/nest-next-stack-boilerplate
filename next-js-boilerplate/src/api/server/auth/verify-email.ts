import { apiFetchJson } from "@/lib/api-client";
import {
  AUTH_VERIFY_EMAIL_URL,
} from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface VerifyEmailResult {
  msg?: string;
}

export async function verifyEmailServer(
  token: string,
): Promise<VerifyEmailResult> {
  return apiFetchJson<VerifyEmailResult>(AUTH_VERIFY_EMAIL_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ token }),
  });
}
