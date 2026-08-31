// Ported from next-js-boilerplate/src/app/(demos)/csr-cookies/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import CsrCookiesPageContent from "@/views/demos/csr-cookies/PageContent";

export const metadata: Metadata = {
  title: "CSR Cookies",
  description: "Client-side rendering with cookies",
};

export const Route = createFileRoute("/_demos/csr-cookies/")({
  head: () => metadataToHead(metadata),
  component: CsrCookiesPage,
});

function CsrCookiesPage() {
  return <CsrCookiesPageContent />;
}
