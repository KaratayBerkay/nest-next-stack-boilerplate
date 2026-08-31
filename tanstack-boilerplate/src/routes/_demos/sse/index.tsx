// Ported from next-js-boilerplate/src/app/(demos)/sse/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import SsePageContent from "@/views/demos/sse/PageContent";

export const metadata: Metadata = {
  title: "SSE",
  description: "Server-Sent Events demo",
};

export const Route = createFileRoute("/_demos/sse/")({
  head: () => metadataToHead(metadata),
  component: SsePage,
});

function SsePage() {
  return <SsePageContent />;
}
