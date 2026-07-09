import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const settingsPrivacyPageInfo: PageInfoContent = {
  title: "Privacy Settings",
  description:
    "Control your privacy and data sharing preferences.",
  sections: [
    {
      title: "Profile Visibility",
      description:
        "Choose who can see your profile information and posts.",
    },
    {
      title: "Data Sharing",
      description:
        "Control how your data is used for analytics and recommendations.",
    },
    {
      title: "Blocked Users",
      description:
        "Manage your block list to prevent specific users from interacting with you.",
    },
  ],
};
