import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const usersListPageInfo: PageInfoContent = {
  title: "Users",
  description: "Browse and search all registered users on the platform.",
  sections: [
    {
      title: "User Directory",
      description:
        "View a list of all users. Use the search to find specific people by name or email.",
    },
    {
      title: "Viewing Profiles",
      description:
        "Tap on a user to view their profile, see their posts, and send a friend request.",
    },
  ],
};
