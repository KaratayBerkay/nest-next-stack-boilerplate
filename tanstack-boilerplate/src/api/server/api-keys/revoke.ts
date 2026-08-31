import { apiFetchJson } from "@/lib/api-client";
import { API_KEYS_PREFIX } from "@/constants/api/urls";
import { DELETE } from "@/constants/api/methods";

export async function revokeApiKeyServer(id: string): Promise<void> {
  await apiFetchJson(API_KEYS_PREFIX + id, { method: DELETE });
}
