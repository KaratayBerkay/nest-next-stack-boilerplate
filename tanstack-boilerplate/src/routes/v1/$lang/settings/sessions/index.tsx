// Ported from next-js-boilerplate/src/app/v1/lang/settings/sessions/page.tsx
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { getTierView } from "@/lib/tier-view";
import { FreePageView } from "@/views/settings/sessions/FreePageView";
import { BasicPageView } from "@/views/settings/sessions/BasicPageView";
import { MediumPageView } from "@/views/settings/sessions/MediumPageView";
import { PremiumPageView } from "@/views/settings/sessions/PremiumPageView";

export const metadata: Metadata = {
  title: "Sessions",
  description: "Manage your active sessions",
};

const VIEWS = {
  FREE: FreePageView,
  BASIC: BasicPageView,
  MEDIUM: MediumPageView,
  PREMIUM: PremiumPageView,
};

const v1Route = getRouteApi("/v1/$lang");

export const Route = createFileRoute("/v1/$lang/settings/sessions/")({
  head: () => metadataToHead(metadata),
  component: Page,
});

function Page() {
  const { user } = v1Route.useLoaderData();
  return <>{getTierView(user.tier, VIEWS)}</>;
}
