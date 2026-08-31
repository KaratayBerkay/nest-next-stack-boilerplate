// Ported from next-js-boilerplate/src/app/(demos)/client-data/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import ClientDataPageContent from "@/views/demos/client-data/PageContent";

export const metadata: Metadata = {
  title: "Client Data",
  description: "Client-side data fetching",
};

export const Route = createFileRoute("/_demos/client-data/")({
  head: () => metadataToHead(metadata),
  component: ClientDataPage,
});

function ClientDataPage() {
  return <ClientDataPageContent />;
}
