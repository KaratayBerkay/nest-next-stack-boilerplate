// Ported from next-js-boilerplate/src/app/v1/[lang]/premium/page.tsx
// User and the locale's messages both come from the v1 layout loader.
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { getTierView } from "@/lib/tier-view";
import { FreePageView } from "@/views/premium/FreePageView";
import { BasicPageView } from "@/views/premium/BasicPageView";
import { MediumPageView } from "@/views/premium/MediumPageView";
import { PremiumPageView } from "@/views/premium/PremiumPageView";
import { PremiumLoadingFallback } from "@/fallbacks";

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

const v1Route = getRouteApi("/v1/$lang");

export const Route = createFileRoute("/v1/$lang/premium/")({
  head: () => metadataToHead(metadata),
  pendingComponent: PremiumLoadingFallback,
  component: PremiumPage,
});

function PremiumPage() {
  const { user, messages } = v1Route.useLoaderData();
  const t = messages.premium;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-brand text-sm font-semibold">{t.heading}</h2>
      {getTierView(user.tier, VIEWS)}
    </div>
  );
}
