import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { requireSessionUser } from "@/lib/auth-ssr";
import { FreePageView } from "@/views/friends/FreePageView";
import { BasicPageView } from "@/views/friends/BasicPageView";
import { MediumPageView } from "@/views/friends/MediumPageView";
import { PremiumPageView } from "@/views/friends/PremiumPageView";

export const metadata: Metadata = {
  title: "Friends",
  description: "Your friends list",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export default async function FriendsPage() {
  const user = await requireSessionUser();

  return getTierView(user.tier, VIEWS);
}
