import { apiFetchJson } from "@/lib/api-client";
import {
  AUTH_VERIFY_EMAIL_URL,
  AUTH_VERIFY_EMAIL_CODE_URL,
  AUTH_RESEND_EMAIL_CODE_URL,
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

export async function verifyEmailCodeServer(
  userId: string,
  code: string,
): Promise<VerifyEmailResult> {
  return apiFetchJson<VerifyEmailResult>(AUTH_VERIFY_EMAIL_CODE_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ userId, code }),
  });
}

export async function resendEmailCodeServer(
  userId: string,
  email: string,
): Promise<VerifyEmailResult> {
  return apiFetchJson<VerifyEmailResult>(AUTH_RESEND_EMAIL_CODE_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ userId, email }),
  });
}
