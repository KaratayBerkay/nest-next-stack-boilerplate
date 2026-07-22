import { apiFetchJson } from "@/lib/api-client";
import { AUTH_LOGIN_MFA_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { User } from "@/types/auth/User";

export type MfaResult = {
  user: User;
  accessToken?: string;
};

export async function verifyMfaServer(
  mfaToken: string,
  code: string,
): Promise<MfaResult> {
  return apiFetchJson<MfaResult>(AUTH_LOGIN_MFA_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ mfaToken, code }),
  });
}
