// Ported from next-js-boilerplate/src/app/v1/lang/share/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import PageContent from "@/views/share/PageContent";

export const metadata: Metadata = {
  title: "Share",
  description: "Share a post",
};

export const Route = createFileRoute("/v1/$lang/share/")({
  head: () => metadataToHead(metadata),
  component: SharePage,
});

function SharePage() {
  return <PageContent />;
}
