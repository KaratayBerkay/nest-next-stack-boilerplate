import { apiFetch } from "@/lib/api-client";
import { AUTH_TOKEN_URL } from "@/constants/api/urls";

export async function refreshTokenServer(
  token: string,
): Promise<Record<string, string> | null> {
  try {
    const res = await apiFetch(AUTH_TOKEN_URL);
    if (!res.ok) return null;
    const json = await res.json();
    return {
      accessToken: json.accessToken ?? token,
      rbacToken: json.rbacToken ?? "",
      deviceToken: json.deviceToken ?? "",
      userToken: json.userToken ?? "",
    };
  } catch {
    return null;
  }
}
