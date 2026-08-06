import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const settingsUsagePageInfo: PageInfoContent = {
  title: "Usage",
  description:
    "Track how much of your message and upload storage you have used.",
  sections: [
    {
      title: "Message Storage",
      description:
        "Your monthly message storage resets each month. Letters stored count toward this limit.",
    },
    {
      title: "Upload Storage",
      description:
        "Attachments you send count toward your upload storage. Uploads stay stored until you remove them.",
    },
    {
      title: "Plan Limits",
      description:
        "Free plans get 250 MB of upload storage. Every plan upgrade doubles your storage.",
    },
  ],
  tips: [
    "Storage limits are shown in real time",
    "Upgrading your plan instantly doubles your upload storage",
  ],
};
