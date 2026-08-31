export interface ChatRoomHeaderProps {
  user: { id: string; name?: string | null; email?: string | null };
  connectionState: string;
  showPageInfo: boolean;
  t: Record<string, string>;
}
