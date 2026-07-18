import { apiFetch } from "@/lib/api-client";
import {
  AUTH_TOKEN_URL,
} from "@/constants/api/urls";

export interface RefreshTokenResult {
  accessToken?: string;
}

export async function refreshTokenServer(): Promise<RefreshTokenResult | null> {
  const res = await apiFetch(AUTH_TOKEN_URL);
  if (!res.ok) return null;
  return res.json() as Promise<RefreshTokenResult>;
}
