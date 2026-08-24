export interface MeetingHost {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface MeetingRoomInfo {
  id: string;
  state: "PENDING" | "ACTIVE" | "ENDED";
  startedAt: string | null;
  endedAt: string | null;
}

export interface MeetingView {
  id: string;
  title: string;
  slug: string;
  maxParticipants: number;
  maxDurationMinutes: number;
  createdAt: string;
  room: MeetingRoomInfo;
  host: MeetingHost;
}

export interface JoinMeetingResult {
  token: string;
  roomName: string;
  role: string;
  meeting: MeetingView;
}

export interface MeetingChatMessageView {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  text: string;
  createdAt: string;
}

export interface MeetingChatMessagesPage {
  messages: MeetingChatMessageView[];
  hasMore: boolean;
}
