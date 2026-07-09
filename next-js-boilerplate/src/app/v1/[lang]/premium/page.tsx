import type { Metadata } from "next";
import { getTierView } from "@/lib/tier-view";
import { getSessionUser } from "@/lib/auth-ssr";
import { getAllMessages } from "@/lib/i18n/get-all-messages";
import { FreePageView } from "@/views/premium/FreePageView";
import { BasicPageView } from "@/views/premium/BasicPageView";
import { MediumPageView } from "@/views/premium/MediumPageView";
import { PremiumPageView } from "@/views/premium/PremiumPageView";
import type { I18nMessages } from "@/generated/i18n-messages";

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
  const user = await getSessionUser();
  const { lang } = await params;
  const messages = getAllMessages<I18nMessages>(lang);
  const t = messages.premium;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold text-brand">{t.heading}</h2>
      {getTierView(user!.tier, VIEWS)}
    </div>
  );
}
