import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { getSessionUser } from "@/lib/auth-ssr";
import { FreePageView } from "@/views/messages/FreePageView";
import { BasicPageView } from "@/views/messages/BasicPageView";
import { MediumPageView } from "@/views/messages/MediumPageView";
import { PremiumPageView } from "@/views/messages/PremiumPageView";

export const metadata: Metadata = {
  title: "Messages",
  description: "Your messages",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export default async function MessagesPage() {
  const user = await getSessionUser();

  return getTierView(user!.tier, VIEWS);
}
