import type { PageInfoContent } from "@/types/ui/PageInfo-types";

export const settingsSecurityPageInfo: PageInfoContent = {
  title: "Security Settings",
  description: "Manage two-factor authentication and account security.",
  sections: [
    {
      title: "Two-Factor Authentication",
      description:
        "Add an extra layer of security to your account using an authenticator app.",
    },
    {
      title: "Backup Codes",
      description:
        "Save your backup codes in a safe place - they are the only way in if you lose access to your authenticator app.",
    },
  ],
  tips: [
    "Two-factor authentication protects you even if your password is compromised",
    "Store backup codes offline, never in a cloud note",
    "Regenerate backup codes if you lose your authenticator device",
  ],
};
