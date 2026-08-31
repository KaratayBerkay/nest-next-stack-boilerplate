import { apiFetchJson } from "@/lib/api-client";
import { AUTH_CHANGE_PASSWORD_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface ChangePasswordResult {
  success: boolean;
}

export async function changePasswordServer(
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  return apiFetchJson<ChangePasswordResult>(AUTH_CHANGE_PASSWORD_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
