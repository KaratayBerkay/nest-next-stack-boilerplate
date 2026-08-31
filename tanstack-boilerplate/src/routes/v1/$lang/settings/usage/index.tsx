// Ported from next-js-boilerplate/src/app/v1/lang/settings/usage/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import UsagePageContent from "@/views/settings/usage/PageContent";

export const metadata: Metadata = {
  title: "Usage Settings",
  description: "Track message and upload storage usage",
};

export const Route = createFileRoute("/v1/$lang/settings/usage/")({
  head: () => metadataToHead(metadata),
  component: UsagePage,
});

function UsagePage() {
  return <UsagePageContent />;
}
