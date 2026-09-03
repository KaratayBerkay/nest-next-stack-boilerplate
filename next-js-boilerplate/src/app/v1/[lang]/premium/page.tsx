import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { requireSessionUser } from "@/lib/auth-ssr";
import { getAllMessages } from "@/lib/i18n/get-all-messages";
import { FreePageView } from "@/views/premium/FreePageView";
import { BasicPageView } from "@/views/premium/BasicPageView";
import { MediumPageView } from "@/views/premium/MediumPageView";
import { PremiumPageView } from "@/views/premium/PremiumPageView";
import type { I18nMessages } from "@/generated/i18n-messages";
import { isAdminRole } from "@/lib/auth/admin-role";
import { AccessDeniedPage } from "@/features/statics";

export const metadata: Metadata = {
  title: "Premium",
  description: "Premium features",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export default async function PremiumPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const user = await requireSessionUser();
  const { lang } = await params;
  const messages = getAllMessages<I18nMessages>(lang);
  const t = messages.premium;

  // CROSS-035: this is the tier-gate tech demo and its premiumStats /
  // growthStats queries are admin-only aggregates now — deny non-admins here
  // instead of serving a page of failing queries.
  if (!isAdminRole(user.role)) {
    return <AccessDeniedPage message={messages.admin.accessDenied} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-brand text-sm font-semibold">{t.heading}</h2>
      {getTierView(user.tier, VIEWS)}
    </div>
  );
}
