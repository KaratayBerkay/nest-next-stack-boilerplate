"use client";

import { ChatRoomBaseView } from "@/views/chat-room/ChatRoomBaseView";

const VIP_ROOMS = ["vip-lounge"];

export function MediumPageView() {
  return <ChatRoomBaseView vipRooms={VIP_ROOMS} useNativeControls />;
}
