import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const settingsSessionsPageInfo: PageInfoContent = {
  title: "Sessions",
  description:
    "View and manage your active sessions across devices.",
  sections: [
    {
      title: "Active Sessions",
      description:
        "See all devices where you're currently logged in, including device type and last active time.",
    },
    {
      title: "Revoke Sessions",
      description:
        "Remotely log out from any device by revoking its session. This is useful if you lost access to a device.",
    },
  ],
  tips: [
    "Revoke any session you don't recognize immediately",
  ],
};
