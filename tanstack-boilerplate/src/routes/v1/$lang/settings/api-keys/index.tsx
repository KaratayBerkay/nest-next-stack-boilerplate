// Ported from next-js-boilerplate/src/app/v1/lang/settings/api-keys/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import PageContent from "@/views/settings/api-keys/PageContent";

export const metadata: Metadata = {
  title: "API Keys",
  description: "Manage your API keys",
};

export const Route = createFileRoute("/v1/$lang/settings/api-keys/")({
  head: () => metadataToHead(metadata),
  component: ApiKeysPage,
});

function ApiKeysPage() {
  return <PageContent />;
}
