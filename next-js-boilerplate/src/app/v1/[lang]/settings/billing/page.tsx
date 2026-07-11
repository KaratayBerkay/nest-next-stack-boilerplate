import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { getSessionUser } from "@/lib/auth-ssr";
import { FreePageView } from "@/views/settings/billing/FreePageView";
import BasicPageView from "@/views/settings/billing/BasicPageView";
import MediumPageView from "@/views/settings/billing/MediumPageView";
import PremiumPageView from "@/views/settings/billing/PremiumPageView";

export const metadata: Metadata = {
  title: "Billing",
  description: "Manage your billing and subscription",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export default async function BillingPage() {
  const user = await getSessionUser();

  return getTierView(user!.tier, VIEWS);
}
