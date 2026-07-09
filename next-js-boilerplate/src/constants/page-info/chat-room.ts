import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const chatRoomPageInfo: PageInfoContent = {
  title: "Chat Room",
  description:
    "Real-time group chat rooms where you can communicate with other users.",
  sections: [
    {
      title: "Rooms",
      description:
        "Switch between different chat rooms using the sidebar. Each room has its own conversation and member list.",
    },
    {
      title: "Online Status",
      description:
        "See who's currently online in each room. Your connection status is shown in the top-left corner.",
    },
    {
      title: "Sending Messages",
      description:
        "Type your message and press Enter or tap Send. Messages appear in real-time for all room members.",
    },
    {
      title: "Room Members",
      description:
        "View who's currently in the room by switching to the Online tab in the sidebar.",
    },
  ],
  tips: [
    "Green dot means connected, yellow means connecting, red means disconnected",
    "Messages are delivered in real-time when connected",
  ],
};
