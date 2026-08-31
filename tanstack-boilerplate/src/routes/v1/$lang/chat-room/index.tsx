// Ported from next-js-boilerplate/src/app/v1/[lang]/chat-room/page.tsx
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { getTierView } from "@/lib/tier-view";
import { FreePageView } from "@/views/chat-room/FreePageView";
import { BasicPageView } from "@/views/chat-room/BasicPageView";
import { MediumPageView } from "@/views/chat-room/MediumPageView";
import { PremiumPageView } from "@/views/chat-room/PremiumPageView";

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

const v1Route = getRouteApi("/v1/$lang");

export const Route = createFileRoute("/v1/$lang/chat-room/")({
  validateSearch: (search: Record<string, unknown>): { room?: string } => ({
    room: typeof search.room === "string" ? search.room : undefined,
  }),
  head: () => metadataToHead(metadata),
  component: ChatRoomPage,
});

function ChatRoomPage() {
  const { user } = v1Route.useLoaderData();
  const { room } = Route.useSearch();
  return (
    <>{getTierView(user.tier, VIEWS, { initialRoom: room || "general" })}</>
  );
}
