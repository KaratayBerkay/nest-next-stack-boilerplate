export type User = { id: string; name: string };

export type FriendRequest = {
  id: string;
  direction: "incoming" | "outgoing";
  user: User;
};

export const PAGE_SIZE = 10;
