// Ported from next-js-boilerplate/src/app/(demos)/observability/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import ObservabilityPageContent from "@/views/demos/observability/PageContent";

export const metadata: Metadata = {
  title: "Observability",
  description: "Observability and monitoring demo",
};

export const Route = createFileRoute("/_demos/observability/")({
  head: () => metadataToHead(metadata),
  component: ObservabilityPage,
});

function ObservabilityPage() {
  return <ObservabilityPageContent />;
}
