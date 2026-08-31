// Ported from next-js-boilerplate/src/app/v1/[lang]/settings/page.tsx
import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import PageContent from "@/views/settings/PageContent";
import { SettingsLoadingFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account settings",
};

export const Route = createFileRoute("/v1/$lang/settings/")({
  head: () => metadataToHead(metadata),
  pendingComponent: SettingsLoadingFallback,
  component: SettingsPage,
});

function SettingsPage() {
  const { lang } = Route.useParams();
  const params = useMemo(() => Promise.resolve({ lang }), [lang]);
  return <PageContent params={params} />;
}
