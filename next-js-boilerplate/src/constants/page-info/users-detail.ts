import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const usersDetailPageInfo: PageInfoContent = {
  title: "User Profile",
  description:
    "View details about a specific user.",
  sections: [
    {
      title: "Profile Information",
      description:
        "See the user's name, email, and other public profile details.",
    },
    {
      title: "Actions",
      description:
        "Send a friend request, view their posts, or start a conversation if you're already friends.",
    },
  ],
};
