import { apiFetch } from "@/lib/api-client";
import { MESSAGES_CONVERSATIONS_URL } from "@/constants/api/urls";

export interface Conversation {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    online: boolean;
  };
  lastMessage: string | Record<string, unknown>;
  lastTime: string;
  hasAttachments?: boolean;
  unread: number;
}

export async function fetchConversationsServer(): Promise<Conversation[]> {
  const res = await apiFetch(MESSAGES_CONVERSATIONS_URL, undefined, {
    suppressGlobalLogout: true,
  });
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}
