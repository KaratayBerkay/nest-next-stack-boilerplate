import { apiFetchJson } from "@/lib/api-client";
import {
  AUTH_LOGIN_MFA_URL,
  AUTH_LOGIN_MFA_RESEND_URL,
  AUTH_MFA_ENROLL_URL,
  AUTH_MFA_VERIFY_URL,
  AUTH_MFA_DISABLE_URL,
} from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { User } from "@/types/auth/User";

export type MfaResult = {
  user: User;
  accessToken?: string;
  deviceToken?: string;
};

export type EnrollMfaResult = {
  otpauthUrl: string;
  secret: string;
};

export type VerifyMfaResult = {
  enabled: boolean;
  backupCodes: string[];
};

export type DisableMfaResult = {
  success: boolean;
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

export async function enrollMfaServer(): Promise<EnrollMfaResult> {
  return apiFetchJson<EnrollMfaResult>(AUTH_MFA_ENROLL_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
  });
}

export async function verifyMfaEnrollmentServer(
  code: string,
): Promise<VerifyMfaResult> {
  return apiFetchJson<VerifyMfaResult>(AUTH_MFA_VERIFY_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ code }),
  });
}

export async function disableMfaServer(
  code: string,
): Promise<DisableMfaResult> {
  return apiFetchJson<DisableMfaResult>(AUTH_MFA_DISABLE_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ code }),
  });
}

export async function resendLoginCodeServer(
  mfaToken: string,
): Promise<{ mfaToken: string }> {
  return apiFetchJson<{ mfaToken: string }>(AUTH_LOGIN_MFA_RESEND_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ mfaToken }),
  });
}
