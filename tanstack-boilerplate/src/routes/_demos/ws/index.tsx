// Ported from next-js-boilerplate/src/app/(demos)/ws/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import WsPageContent from "@/views/demos/ws/PageContent";

export const metadata: Metadata = {
  title: "WebSocket",
  description: "WebSocket demo",
};

export const Route = createFileRoute("/_demos/ws/")({
  head: () => metadataToHead(metadata),
  component: WsPage,
});

function WsPage() {
  return <WsPageContent />;
}
