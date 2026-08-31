import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const settingsApiKeysPageInfo: PageInfoContent = {
  title: "API Keys",
  description:
    "Create and manage API keys for programmatic access to your account.",
  sections: [
    {
      title: "Creating Keys",
      description:
        "Generate new API keys to use with external applications or scripts.",
    },
    {
      title: "Managing Keys",
      description:
        "View, rename, or revoke existing API keys. Keep your keys secure and never share them publicly.",
    },
  ],
  tips: [
    "API keys provide full access to your account - treat them like passwords",
    "Rotate keys regularly for better security",
  ],
};
