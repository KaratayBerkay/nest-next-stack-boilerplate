import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { getSessionUser } from "@/lib/auth-ssr";
import { FreePageView } from "@/views/find-friends/FreePageView";
import { BasicPageView } from "@/views/find-friends/BasicPageView";
import { MediumPageView } from "@/views/find-friends/MediumPageView";
import { PremiumPageView } from "@/views/find-friends/PremiumPageView";

export const metadata: Metadata = {
  title: "Friend Requests",
  description: "Manage friend requests",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export default async function RequestsPage() {
  const user = await getSessionUser();

  return getTierView(user!.tier, VIEWS);
}
