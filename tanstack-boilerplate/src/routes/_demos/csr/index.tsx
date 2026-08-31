// Ported from next-js-boilerplate/src/app/(demos)/csr/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import CsrPageContent from "@/views/demos/csr/PageContent";

export const metadata: Metadata = {
  title: "CSR",
  description: "Client-side rendering demo",
};

export const Route = createFileRoute("/_demos/csr/")({
  head: () => metadataToHead(metadata),
  component: CsrPage,
});

function CsrPage() {
  return <CsrPageContent />;
}
