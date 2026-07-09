import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const messagesPageInfo: PageInfoContent = {
  title: "Messages",
  description:
    "Private direct messages with your friends and connections.",
  sections: [
    {
      title: "Conversations",
      description:
        "Your existing conversations appear in the sidebar. Tap one to open the chat.",
    },
    {
      title: "Starting a New Chat",
      description:
        "Use the search bar to find users, or tap the + button to discover new friends to message.",
    },
    {
      title: "Friends Tab",
      description:
        "Switch to the Friends tab to see all your connections and start a conversation with any of them.",
    },
    {
      title: "Read Receipts",
      description:
        "Message status indicators show when your message has been delivered and read by the recipient.",
    },
  ],
  tips: [
    "Swipe left/right to switch between Conversations and Friends tabs",
    "Unread messages show a badge count on the conversation",
  ],
};
