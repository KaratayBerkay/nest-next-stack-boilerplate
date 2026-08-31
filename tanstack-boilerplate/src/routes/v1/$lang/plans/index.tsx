// Ported from next-js-boilerplate/src/app/v1/[lang]/plans/page.tsx
// PageContent consumes `params` with React use(), so the route hands it a
// stable resolved promise derived from the router params.
import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import PageContent from "@/views/plans/PageContent";
import { PlansLoadingFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Plans",
  description: "View available plans",
};

export const Route = createFileRoute("/v1/$lang/plans/")({
  head: () => metadataToHead(metadata),
  pendingComponent: PlansLoadingFallback,
  component: PlansPage,
});

function PlansPage() {
  const { lang } = Route.useParams();
  const params = useMemo(() => Promise.resolve({ lang }), [lang]);
  return <PageContent params={params} />;
}
