import { apiFetchJson } from "@/lib/api-client";
import { API_KEYS_URL } from "@/constants/api/urls";

export interface ApiKeyInfo {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  enabled: boolean;
  role: string;
  tier: string;
}

export async function listApiKeysServer(): Promise<ApiKeyInfo[]> {
  const data = await apiFetchJson<{ apiKeys: ApiKeyInfo[] }>(API_KEYS_URL);
  return data.apiKeys;
}
