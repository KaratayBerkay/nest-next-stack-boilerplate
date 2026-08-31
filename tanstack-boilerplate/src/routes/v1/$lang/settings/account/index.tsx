// Ported from next-js-boilerplate/src/app/v1/lang/settings/account/page.tsx
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { getTierView } from "@/lib/tier-view";
import { FreePageView } from "@/views/settings/account/FreePageView";
import BasicPageView from "@/views/settings/account/BasicPageView";
import MediumPageView from "@/views/settings/account/MediumPageView";
import PremiumPageView from "@/views/settings/account/PremiumPageView";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

const v1Route = getRouteApi("/v1/$lang");

export const Route = createFileRoute("/v1/$lang/settings/account/")({
  head: () => metadataToHead(metadata),
  component: Page,
});

function Page() {
  const { user } = v1Route.useLoaderData();
  return <>{getTierView(user.tier, VIEWS)}</>;
}
