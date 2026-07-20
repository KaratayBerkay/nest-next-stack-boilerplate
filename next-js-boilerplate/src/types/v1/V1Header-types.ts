import type { RefObject } from "react";
import type { Conversation } from "@/lib/realtime/useConversations";
import type { User } from "@/hooks/useAuth";

export interface V1HeaderProps {
  toggle: () => void;
  open: () => void;
  loading: boolean;
  user: User | null;
  logout: () => void;
  lang: string;
  conversations: Conversation[];
  sidebarOpen: boolean;
  toggleRef: RefObject<HTMLButtonElement | null>;
}
