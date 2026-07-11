import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { getSessionUser } from "@/lib/auth-ssr";
import { FreePageView } from "@/views/settings/account/FreePageView";
import BasicPageView from "@/views/settings/account/BasicPageView";
import MediumPageView from "@/views/settings/account/MediumPageView";
import PremiumPageView from "@/views/settings/account/PremiumPageView";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export default async function AccountPage() {
  const user = await getSessionUser();

  return getTierView(user!.tier, VIEWS);
}
