import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const findFriendsRequestsPageInfo: PageInfoContent = {
  title: "Friend Requests",
  description: "Manage incoming friend requests from other users.",
  sections: [
    {
      title: "Incoming Requests",
      description:
        "See all pending friend requests sent to you. Each request shows the sender's name and when it was sent.",
    },
    {
      title: "Accept or Decline",
      description:
        "Tap Accept to add the person as a friend, or Decline to reject the request. You can always send a request later.",
    },
  ],
  tips: ["Accepted friends appear in your Messages and Friends list"],
};
