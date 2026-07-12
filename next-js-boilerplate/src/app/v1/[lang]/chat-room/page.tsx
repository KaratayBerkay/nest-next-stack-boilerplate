import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { getSessionUser } from "@/lib/auth-ssr";
import { FreePageView } from "@/views/chat-room/FreePageView";
import { BasicPageView } from "@/views/chat-room/BasicPageView";
import { MediumPageView } from "@/views/chat-room/MediumPageView";
import { PremiumPageView } from "@/views/chat-room/PremiumPageView";
import type { ChatRoomPageProps } from "@/types/chat-room/ChatRoomPage-types";

export const metadata: Metadata = {
  title: "Chat Room",
  description: "Real-time chat room",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export default async function ChatRoomPage({
  searchParams,
}: ChatRoomPageProps) {
  const [user, sp] = await Promise.all([getSessionUser(), searchParams]);
  const room = (sp.room as string) || "general";

  return getTierView(user!.tier, VIEWS, { initialRoom: room });
}
