import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { getSessionUser } from "@/lib/auth-ssr";
import { FreePageView } from "@/views/notification/FreePageView";
import { BasicPageView } from "@/views/notification/BasicPageView";
import { MediumPageView } from "@/views/notification/MediumPageView";
import { PremiumPageView } from "@/views/notification/PremiumPageView";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your notifications",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export default async function NotificationPage() {
  const user = await getSessionUser();

  return getTierView(user!.tier, VIEWS);
}
