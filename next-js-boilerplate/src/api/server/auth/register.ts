import { apiFetchJson } from "@/lib/api-client";
import { AUTH_REGISTER_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";
import type { User } from "@/types/auth/User";

export interface RegisterResult {
  user: User;
  accessToken?: string;
}

export async function registerServer(
  email: string,
  password: string,
  name?: string,
  timezone?: string,
): Promise<RegisterResult> {
  return apiFetchJson<RegisterResult>(AUTH_REGISTER_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({
      email,
      password,
      name,
      timezone,
    }),
  });
}
