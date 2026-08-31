import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const notificationPageInfo: PageInfoContent = {
  title: "Notifications",
  description:
    "Stay updated with notifications about activity that matters to you.",
  sections: [
    {
      title: "Notification List",
      description:
        "All your notifications appear here, sorted by most recent. Unread notifications are highlighted.",
    },
    {
      title: "Push Notifications",
      description:
        "Enable push notifications to receive alerts even when you're not using the app. Tap the bell icon to manage.",
    },
    {
      title: "Mark as Read",
      description:
        "Notifications are automatically marked as read when you view them. Use 'Mark all read' to clear everything.",
    },
    {
      title: "Navigation",
      description:
        "Tap any notification to navigate to the relevant page or content.",
    },
  ],
  tips: [
    "Swipe right to go back to Feed",
    "Unread notifications show a blue dot indicator",
  ],
};
