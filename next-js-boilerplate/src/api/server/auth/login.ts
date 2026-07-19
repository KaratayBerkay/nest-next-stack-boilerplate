import { apiFetch } from "@/lib/api-client";
import { AUTH_LOGIN_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { User } from "@/types/auth/User";

export interface LoginResult {
  user: User;
  accessToken?: string;
  mfaRequired?: boolean;
  mfaToken?: string;
}

export async function loginServer(
  email: string,
  password: string,
  timezone?: string,
): Promise<LoginResult> {
  const res = await apiFetch(AUTH_LOGIN_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ email, password, timezone }),
  });

  const data = (await res.json()) as LoginResult & {
    mfaRequired?: boolean;
    mfaToken?: string;
  };

  if ((res.status === 202 || !res.ok) && data.mfaRequired) {
    const err = new Error("MFA required") as Error & {
      mfaRequired: boolean;
      mfaToken: string;
      user: User;
    };
    err.mfaRequired = true;
    err.mfaToken = data.mfaToken!;
    err.user = data.user;
    throw err;
  }

  if (!res.ok) {
    throw new Error(
      (data as unknown as { msg?: string }).msg ?? "Login failed",
    );
  }

  return data;
}
