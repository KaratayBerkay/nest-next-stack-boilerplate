import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { requireSessionUser } from "@/lib/auth-ssr";
import { FreePageView } from "@/views/settings/privacy/FreePageView";
import BasicPageView from "@/views/settings/privacy/BasicPageView";
import MediumPageView from "@/views/settings/privacy/MediumPageView";
import PremiumPageView from "@/views/settings/privacy/PremiumPageView";

export const metadata: Metadata = {
  title: "Privacy Settings",
  description: "Manage your privacy settings",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export default async function PrivacyPage() {
  const user = await requireSessionUser();

  return getTierView(user.tier, VIEWS);
}
