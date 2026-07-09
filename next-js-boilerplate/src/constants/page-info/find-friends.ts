import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const findFriendsPageInfo: PageInfoContent = {
  title: "Find Friends",
  description:
    "Discover and connect with other users on the platform.",
  sections: [
    {
      title: "Search Users",
      description:
        "Use the search bar to find users by name or email. Results update as you type.",
    },
    {
      title: "Send Friend Requests",
      description:
        "Tap the Add button next to a user to send a friend request. They'll be notified and can accept or decline.",
    },
    {
      title: "Pending Requests",
      description:
        "View incoming friend requests in the Requests tab. Accept or decline requests from other users.",
    },
  ],
  tips: [
    "You need to be friends with someone to send them direct messages",
    "Check the Requests tab for pending incoming requests",
  ],
};
