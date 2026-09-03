export interface StreamBroadcaster {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface StreamRoomInfo {
  id: string;
  state: "PENDING" | "ACTIVE" | "ENDED";
  startedAt: string | null;
  endedAt: string | null;
}

export interface LiveStreamView {
  id: string;
  title: string;
  slug: string;
  isLive: boolean;
  peakViewerCount: number;
  viewerCount: number;
  startedAt: string;
  endedAt: string | null;
  room: StreamRoomInfo;
  broadcaster: StreamBroadcaster;
}

export interface LiveStreamJoinResult {
  token: string;
  roomName: string;
  /** Client-facing LiveKit URL from the server; null when it has none
   *  configured (the client then uses NEXT_PUBLIC_LIVEKIT_URL). */
  livekitUrl?: string | null;
  stream: LiveStreamView;
}

/** One live watcher — the backend's StreamViewerSummary (VIEWER-role
 *  participants only; the broadcaster is never in the list). */
export interface StreamViewerView {
  userId: string;
  name: string;
  avatarUrl: string | null;
  joinedAt: string;
}

export interface StreamChatMessageView {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  text: string;
  createdAt: string;
}

export interface StreamChatMessagesPage {
  messages: StreamChatMessageView[];
  hasMore: boolean;
}
