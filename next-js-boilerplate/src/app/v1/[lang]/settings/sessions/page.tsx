"use client";

import { useAuth } from "@/hooks/useAuth";
import { LoadingAuth } from "@/components/LoadingAuth";
import { UnauthenticatedMessage } from "@/components/UnauthenticatedMessage";
import { getTierView } from "@/lib/tier-view";
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

export default function SessionsPage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingAuth />;
  if (!user) return <UnauthenticatedMessage message="Sign in to manage sessions" />;

  const PageView = getTierView(user.tier, VIEWS);

  return <PageView />;
}
