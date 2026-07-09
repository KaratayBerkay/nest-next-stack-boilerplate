import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const adminPageInfo: PageInfoContent = {
  title: "Admin Dashboard",
  description:
    "Administrative tools for managing users and monitoring system activity.",
  sections: [
    {
      title: "User Management",
      description:
        "View all registered users, manage their tiers, and perform administrative actions.",
    },
    {
      title: "Statistics",
      description:
        "Monitor key metrics like user signups, active users, and subscription conversions.",
    },
    {
      title: "Quick Actions",
      description:
        "Access common administrative tasks from the dashboard.",
    },
  ],
};
