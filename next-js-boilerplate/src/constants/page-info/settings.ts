import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const settingsPageInfo: PageInfoContent = {
  title: "Settings",
  description:
    "Manage your account, billing, and application preferences.",
  sections: [
    {
      title: "Current Plan",
      description:
        "View your current subscription plan and status. Upgrade or manage billing from here.",
    },
    {
      title: "Plan Features",
      description:
        "See what features are included with your current plan tier.",
    },
    {
      title: "Navigation",
      description:
        "Use the sidebar to navigate to specific settings sections like Account, Billing, Privacy, and more.",
    },
  ],
  tips: [
    "Changes are saved automatically in most sections",
  ],
};
