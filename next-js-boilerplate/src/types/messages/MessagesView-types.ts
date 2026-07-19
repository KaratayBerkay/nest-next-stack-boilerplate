export interface MessagesViewProps {
  initialUser?: string | null;
  initialFriends?: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  }>;
}
