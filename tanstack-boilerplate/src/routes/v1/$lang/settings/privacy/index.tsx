// Ported from next-js-boilerplate/src/app/v1/lang/settings/privacy/page.tsx
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { getTierView } from "@/lib/tier-view";
import { FreePageView } from "@/views/settings/privacy/FreePageView";
import BasicPageView from "@/views/settings/privacy/BasicPageView";
import MediumPageView from "@/views/settings/privacy/MediumPageView";
import PremiumPageView from "@/views/settings/privacy/PremiumPageView";

export const metadata: Metadata = {
  title: "Privacy Settings",
  description: "Manage your privacy settings",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

const v1Route = getRouteApi("/v1/$lang");

export const Route = createFileRoute("/v1/$lang/settings/privacy/")({
  head: () => metadataToHead(metadata),
  component: Page,
});

function Page() {
  const { user } = v1Route.useLoaderData();
  return <>{getTierView(user.tier, VIEWS)}</>;
}
