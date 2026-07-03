type AuthTokens = {
  accessToken: string;
  rbacToken: string;
  deviceToken: string;
  userToken: string;
};

type AuthFrame = { type: "auth"; tokens: AuthTokens };
type RegisterFrame = { type: "register"; services: string[] };
type WatchFrame = { type: "watch"; topic: string };
type UnwatchFrame = { type: "unwatch"; topic: string };
type PageFrame = {
  type: "page";
  page: string | null;
  params?: Record<string, string>;
};

export type OutgoingFrame =
  | AuthFrame
  | RegisterFrame
  | WatchFrame
  | UnwatchFrame
  | PageFrame;

export type RenewFrame =
  | { renew: "Notifications"; type: "Count"; value: number }
  | { renew: "Notifications"; type: "Item"; item: Record<string, unknown> }
  | { renew: "Notifications"; type: "Read" }
  | { renew: "Messages"; type: "Conversation"; conversation: Record<string, unknown> }
  | { renew: "Feed"; type: "New" }
  | { renew: "Feed"; type: "Post"; id: string }
  | { renew: "Friends"; type: "PendingList" };

export type EventFrame =
  | { type: "direct-message"; message: Record<string, unknown> }
  | { type: "message-read"; readerId: string; senderId: string; readAt: string }
  | { type: "message-delivered"; userId: string; messageId: string; deliveredAt: string }
  | { type: "room-message"; room: string; message: Record<string, unknown>; tempId?: string }
  | { type: "user-joined"; room: string; user: Record<string, unknown>; members: unknown[] }
  | { type: "user-left"; room: string; members: unknown[] }
  | { type: "user-online"; user: { id: string; name?: string; avatar?: string } }
  | { type: "user-offline"; userId: string }
  | { type: "online-users"; users: { id: string }[] }
  | { type: "room-counts"; rooms: Record<string, number> }
  | { type: "authenticated" }
  | { type: "registered"; services: string[] }
  | { type: "error"; message: string };

export type IncomingFrame = RenewFrame | EventFrame;
