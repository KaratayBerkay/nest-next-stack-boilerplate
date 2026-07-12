import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const settingsAccountPageInfo: PageInfoContent = {
  title: "Account Settings",
  description: "Manage your personal account information and preferences.",
  sections: [
    {
      title: "Profile",
      description:
        "Update your name, email, and other profile details visible to other users.",
    },
    {
      title: "Password",
      description: "Change your password to keep your account secure.",
    },
    {
      title: "Language",
      description: "Set your preferred language for the application interface.",
    },
  ],
};
