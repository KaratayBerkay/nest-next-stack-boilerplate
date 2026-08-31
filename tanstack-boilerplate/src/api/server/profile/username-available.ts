import { apiFetchJson } from "@/lib/api-client";
import { PROFILE_USERNAME_AVAILABLE_PREFIX } from "@/constants/api/urls";

export async function checkUsernameAvailableServer(
  username: string,
): Promise<boolean> {
  const data = await apiFetchJson<{ available: boolean }>(
    `${PROFILE_USERNAME_AVAILABLE_PREFIX}?u=${encodeURIComponent(username)}`,
  );
  return data.available;
}
