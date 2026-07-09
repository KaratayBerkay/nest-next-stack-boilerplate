import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const settingsGeneralPageInfo: PageInfoContent = {
  title: "General Settings",
  description:
    "Configure general application preferences and display options.",
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
      title: "Theme",
      description:
        "Customize the appearance of the application with light or dark mode.",
    },
  ],
};
