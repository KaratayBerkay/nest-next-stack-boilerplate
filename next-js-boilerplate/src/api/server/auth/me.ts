import { apiFetch } from "@/lib/api-client";
import {
  AUTH_ME_URL,
} from "@/constants/api/urls";
import type { User } from "@/types/auth/User";

export interface GetMeResult {
  user: User | null;
  accessToken?: string;
}

export async function getMeServer(): Promise<GetMeResult> {
  const res = await apiFetch(AUTH_ME_URL);
  if (!res.ok) {
    return { user: null };
  }
  return res.json() as Promise<GetMeResult>;
}
