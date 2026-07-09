import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { getSessionUser } from "@/lib/auth-ssr";
import { FreePageView } from "@/views/feed/FreePageView";
import { BasicPageView } from "@/views/feed/BasicPageView";
import { MediumPageView } from "@/views/feed/MediumPageView";
import { PremiumPageView } from "@/views/feed/PremiumPageView";

export const metadata: Metadata = {
  title: "Feed",
  description: "Your social feed",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export default async function FeedPage() {
  const user = await getSessionUser();

  return getTierView(user!.tier, VIEWS);
}
