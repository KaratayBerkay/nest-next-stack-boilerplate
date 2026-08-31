// Ported from next-js-boilerplate/src/app/v1/lang/notification/page.tsx
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { getTierView } from "@/lib/tier-view";
import { FreePageView } from "@/views/notification/FreePageView";
import { BasicPageView } from "@/views/notification/BasicPageView";
import { MediumPageView } from "@/views/notification/MediumPageView";
import { PremiumPageView } from "@/views/notification/PremiumPageView";

export const metadata: Metadata = {
  title: "Notifications",
  description: "Your notifications",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

const v1Route = getRouteApi("/v1/$lang");

export const Route = createFileRoute("/v1/$lang/notification/")({
  head: () => metadataToHead(metadata),
  component: Page,
});

function Page() {
  const { user } = v1Route.useLoaderData();
  return <>{getTierView(user.tier, VIEWS)}</>;
}
