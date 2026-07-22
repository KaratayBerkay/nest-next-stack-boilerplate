import { apiFetchJson } from "@/lib/api-client";
import { AUTH_ME_URL } from "@/constants/api/urls";

export type AuthMeResult = {
  authed: boolean;
  session?: string;
};

export async function getMeRawServer(): Promise<AuthMeResult> {
  return apiFetchJson<AuthMeResult>(AUTH_ME_URL);
}
