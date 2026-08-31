import { apiFetch } from "@/lib/api-client";
import { MESSAGES_FRIENDS_URL } from "@/constants/api/urls";

export interface FriendUser {
  id: string;
  name: string;
  email: string;
}

export async function fetchFriendsServer(): Promise<FriendUser[]> {
  const res = await apiFetch(MESSAGES_FRIENDS_URL);
  if (!res.ok) throw new Error("Failed to fetch friends");
  return res.json();
}
