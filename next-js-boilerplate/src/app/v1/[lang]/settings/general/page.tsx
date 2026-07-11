import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { getSessionUser } from "@/lib/auth-ssr";
import { FreePageView } from "@/views/settings/general/FreePageView";
import BasicPageView from "@/views/settings/general/BasicPageView";
import MediumPageView from "@/views/settings/general/MediumPageView";
import PremiumPageView from "@/views/settings/general/PremiumPageView";

export const metadata: Metadata = {
  title: "General Settings",
  description: "General preferences",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export default async function GeneralPage() {
  const user = await getSessionUser();

  return getTierView(user!.tier, VIEWS);
}
