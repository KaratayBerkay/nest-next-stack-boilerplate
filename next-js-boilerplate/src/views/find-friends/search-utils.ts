export type User = { id: string; name: string };

export type FriendRequest = {
  id: string;
  direction: "incoming" | "outgoing";
  user: User;
};

export const PAGE_SIZE = 10;

// "pending" means "I already sent this person a request" — an incoming
// request (someone else sent *me* one) previously got mixed in here too,
// mislabeling that person as already-requested in search results.
export function getOutgoingPendingIds(
  friendRequests: FriendRequest[],
): Set<string> {
  return new Set(
    friendRequests
      .filter((r) => r.direction === "outgoing")
      .map((r) => r.user.id),
  );
}
