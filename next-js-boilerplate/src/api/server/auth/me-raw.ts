import { apiFetchJson } from "@/lib/api-client";
import { AUTH_ME_URL } from "@/constants/api/urls";
import type { User } from "@/features/auth/hooks/useAuth";

export type AuthMeResult =
  { user: User; accessToken: string } | { user: null } | { error: string };

export async function getMeRawServer(): Promise<AuthMeResult> {
  return apiFetchJson<AuthMeResult>(AUTH_ME_URL);
}
