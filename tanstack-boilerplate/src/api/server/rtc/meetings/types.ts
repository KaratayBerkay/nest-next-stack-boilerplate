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

export interface MeetingAttendee {
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: "HOST" | "PARTICIPANT";
  joinedAt: string;
  leftAt: string | null;
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
  /** Everyone who ever joined (leftAt === null means currently in). Only
   *  the meetings-list query selects this — absent elsewhere. */
  participants?: MeetingAttendee[];
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
