import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const settingsGeneralPageInfo: PageInfoContent = {
  title: "General Settings",
  description: "Configure general application preferences and display options.",
  sections: [
    {
      title: "Timezone",
      description:
        "Set your local timezone for accurate date and time display throughout the app.",
    },
    {
      title: "Currency",
      description:
        "Choose your preferred currency for displaying prices and billing information.",
    },
    {
      title: "Date Display",
      description:
        "Choose how dates are shown throughout the app: long form, ISO timestamp, or short numeric.",
    },
  ],
  tips: [
    "Save your preferences after making changes - they persist in your profile",
    "Timezone and date display apply everywhere dates are shown",
  ],
};
