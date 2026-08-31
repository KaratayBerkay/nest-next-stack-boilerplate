// Ported from next-js-boilerplate/src/app/v1/lang/find-friends/requests/page.tsx
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { getTierView } from "@/lib/tier-view";
import { FreePageView } from "@/views/find-friends/FreePageView";
import { BasicPageView } from "@/views/find-friends/BasicPageView";
import { MediumPageView } from "@/views/find-friends/MediumPageView";
import { PremiumPageView } from "@/views/find-friends/PremiumPageView";

export const metadata: Metadata = {
  title: "Friend Requests",
  description: "Manage friend requests",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

const v1Route = getRouteApi("/v1/$lang");

export const Route = createFileRoute("/v1/$lang/find-friends/requests/")({
  head: () => metadataToHead(metadata),
  component: Page,
});

function Page() {
  const { user } = v1Route.useLoaderData();
  return <>{getTierView(user.tier, VIEWS)}</>;
}
