"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { getTierView } from "@/lib/tier-view";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { FreePageView } from "./views/FreePageView";
import { BasicPageView } from "./views/BasicPageView";
import { MediumPageView } from "./views/MediumPageView";
import { PremiumPageView } from "./views/PremiumPageView";

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

export default function PremiumPage() {
  const { user, loading } = useAuth();
  const t = useMessages("premium");

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message={t.signInToView} />;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold text-brand">{t.heading}</h2>
      {getTierView(user.tier, VIEWS)}
    </div>
  );
}
