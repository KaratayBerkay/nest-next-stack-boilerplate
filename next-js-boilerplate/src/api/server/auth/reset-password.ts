import { apiFetchJson } from "@/lib/api-client";
import {
  AUTH_RESET_PASSWORD_URL,
} from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface ResetPasswordResult {
  msg?: string;
}

export async function resetPasswordServer(
  token: string,
  newPassword: string,
): Promise<ResetPasswordResult> {
  return apiFetchJson<ResetPasswordResult>(AUTH_RESET_PASSWORD_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ token, newPassword }),
  });
}
