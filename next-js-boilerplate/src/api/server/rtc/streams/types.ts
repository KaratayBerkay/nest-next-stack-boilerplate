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
  stream: LiveStreamView;
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
