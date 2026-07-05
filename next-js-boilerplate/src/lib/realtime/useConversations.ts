import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface Conversation {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string;
    online: boolean;
  };
  lastMessage: string;
  lastTime: string;
  unread: number;
}

async function fetchConversations(): Promise<Conversation[]> {
  const res = await apiFetch("/api/messages/conversations");
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}
