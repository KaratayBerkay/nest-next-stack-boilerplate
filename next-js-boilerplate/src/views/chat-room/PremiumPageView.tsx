"use client";

import { ChatRoomBaseView } from "@/views/chat-room/ChatRoomBaseView";

const VIP_ROOMS = ["vip-lounge"];

export function PremiumPageView() {
  return (
    <ChatRoomBaseView vipRooms={VIP_ROOMS} useNativeControls showSelfCrown />
  );
}
