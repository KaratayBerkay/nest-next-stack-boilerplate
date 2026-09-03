import { apiFetch } from "@/lib/api-client";
import { MESSAGES_FRIENDS_REQUESTS_URL } from "@/constants/api/urls";

export interface FriendRequest {
  // No `email`: the backend deliberately stops returning a counterparty's
  // address on GET /api/friends/requests (it was a harvesting channel — the
  // list can include strangers). Nothing in the UI ever read it.
  id: string;
  user: { id: string; name: string };
  direction: "incoming" | "outgoing";
}

export async function fetchFriendRequestsServer(): Promise<FriendRequest[]> {
  const res = await apiFetch(MESSAGES_FRIENDS_REQUESTS_URL);
  if (!res.ok) throw new Error("Failed to fetch friend requests");
  return res.json();
}
