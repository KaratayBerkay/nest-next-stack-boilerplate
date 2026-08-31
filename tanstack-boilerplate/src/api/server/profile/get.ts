import { apiFetchJson } from "@/lib/api-client";
import { PROFILE_URL } from "@/constants/api/urls";

export interface ProfileData {
  user: {
    name?: string;
    username?: string;
    bio?: string;
    avatarUrl?: string;
  };
}

export async function getProfileServer(): Promise<ProfileData> {
  return apiFetchJson<ProfileData>(PROFILE_URL);
}
