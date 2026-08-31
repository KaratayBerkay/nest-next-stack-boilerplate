import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const feedPageInfo: PageInfoContent = {
  title: "Feed",
  description:
    "Your social feed shows posts from people you follow and communities you belong to.",
  sections: [
    {
      title: "Viewing Posts",
      description:
        "Scroll through posts in your feed. Each post shows the author, content, and engagement options.",
    },
    {
      title: "Sharing",
      description:
        "Tap the Share button to create a new post. You can share text, images, and links with your followers.",
    },
    {
      title: "Search",
      description:
        "Use the search bar to filter posts by keyword or author name.",
    },
    {
      title: "Tier Features",
      description:
        "Free users see a basic feed. Higher tiers unlock advanced filtering, analytics, and priority visibility.",
    },
  ],
  tips: [
    "Swipe left to navigate to Notifications",
    "Posts are sorted by recency by default",
  ],
};
