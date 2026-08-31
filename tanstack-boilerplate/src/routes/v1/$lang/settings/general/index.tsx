// Ported from next-js-boilerplate/src/app/v1/lang/settings/general/page.tsx
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { getTierView } from "@/lib/tier-view";
import { FreePageView } from "@/views/settings/general/FreePageView";
import BasicPageView from "@/views/settings/general/BasicPageView";
import MediumPageView from "@/views/settings/general/MediumPageView";
import PremiumPageView from "@/views/settings/general/PremiumPageView";

export const metadata: Metadata = {
  title: "General Settings",
  description: "General preferences",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

const v1Route = getRouteApi("/v1/$lang");

export const Route = createFileRoute("/v1/$lang/settings/general/")({
  head: () => metadataToHead(metadata),
  component: Page,
});

function Page() {
  const { user } = v1Route.useLoaderData();
  return <>{getTierView(user.tier, VIEWS)}</>;
}
