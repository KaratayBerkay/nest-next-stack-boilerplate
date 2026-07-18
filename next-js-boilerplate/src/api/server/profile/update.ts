import { apiFetchJson } from "@/lib/api-client";
import { PROFILE_UPDATE_URL } from "@/constants/api/urls";
import { POST } from "@/constants/api/methods";
import { JSON_CONTENT_TYPE_HEADER } from "@/constants/api/headers";

export interface UpdateProfileParams {
  name: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

export async function updateProfileServer(params: UpdateProfileParams): Promise<void> {
  await apiFetchJson(PROFILE_UPDATE_URL, {
    method: POST,
    headers: JSON_CONTENT_TYPE_HEADER,
    body: JSON.stringify(params),
  });
}
