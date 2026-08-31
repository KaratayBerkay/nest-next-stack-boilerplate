// Ported from next-js-boilerplate/src/app/(marketing)/pricing/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import PricingPageContent from "@/views/pricing/PageContent";

export const metadata: Metadata = {
  title: "Pricing",
  description: "View our pricing plans",
};

export const Route = createFileRoute("/_marketing/pricing/")({
  head: () => metadataToHead(metadata),
  component: PricingPage,
});

function PricingPage() {
  return <PricingPageContent />;
}
