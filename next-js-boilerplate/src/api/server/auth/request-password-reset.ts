import { apiFetchJson } from "@/lib/api-client";
import { AUTH_REQUEST_PASSWORD_RESET_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface RequestPasswordResetResult {
  msg?: string;
}

export async function requestPasswordResetServer(
  email: string,
): Promise<RequestPasswordResetResult> {
  return apiFetchJson<RequestPasswordResetResult>(
    AUTH_REQUEST_PASSWORD_RESET_URL,
    {
      method: POST,
      headers: JSON_CONTENT_TYPE_HEADER,
      body: JSON.stringify({ email }),
    },
  );
}
