import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { getSessionUser } from "@/lib/auth-ssr";
import { FreePageView } from "@/views/settings/sessions/FreePageView";
import { BasicPageView } from "@/views/settings/sessions/BasicPageView";
import { MediumPageView } from "@/views/settings/sessions/MediumPageView";
import { PremiumPageView } from "@/views/settings/sessions/PremiumPageView";

export const metadata: Metadata = {
  title: "Sessions",
  description: "Manage your active sessions",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export default async function SessionsPage() {
  const user = await getSessionUser();

  return getTierView(user!.tier, VIEWS);
}
