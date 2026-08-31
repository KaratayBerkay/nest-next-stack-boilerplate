import { queryOptions } from "@tanstack/react-query";
import type { FriendUser } from "@/api/server/messages/friends";
import type { FriendRequest } from "@/api/server/messages/friend-requests";

async function fetchFriends(): Promise<FriendUser[]> {
  const { fetchFriendsServer } = await import("@/api/server/messages/friends");
  return fetchFriendsServer();
}

async function fetchFriendRequests(): Promise<FriendRequest[]> {
  const { fetchFriendRequestsServer } =
    await import("@/api/server/messages/friend-requests");
  return fetchFriendRequestsServer();
}

export function friendsQueryOptions() {
  return queryOptions({
    queryKey: ["friends", "list"],
    queryFn: fetchFriends,
  });
}

export function friendRequestsQueryOptions() {
  return queryOptions({
    queryKey: ["friends", "requests"],
    queryFn: fetchFriendRequests,
  });
}
