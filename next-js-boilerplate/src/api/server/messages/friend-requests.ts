import { apiFetch } from "@/lib/api-client";
import { MESSAGES_FRIENDS_REQUESTS_URL } from "@/constants/api/urls";

export interface FriendRequest {
  id: string;
  user: { id: string; name: string; email: string };
  direction: "incoming" | "outgoing";
}

export async function fetchFriendRequestsServer(): Promise<FriendRequest[]> {
  const res = await apiFetch(MESSAGES_FRIENDS_REQUESTS_URL);
  if (!res.ok) throw new Error("Failed to fetch friend requests");
  return res.json();
}
