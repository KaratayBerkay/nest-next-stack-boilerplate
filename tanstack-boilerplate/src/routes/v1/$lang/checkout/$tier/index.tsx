// Ported from next-js-boilerplate/src/app/v1/[lang]/checkout/[tier]/page.tsx
// CheckoutContent consumes `params` with React use(), so the route hands it a
// stable resolved promise built from the router params.
import { Suspense, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import CheckoutContent from "@/views/checkout/CheckoutContent";
import { CheckoutLoadingFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your purchase",
};

export const Route = createFileRoute("/v1/$lang/checkout/$tier/")({
  head: () => metadataToHead(metadata),
  pendingComponent: CheckoutLoadingFallback,
  component: CheckoutPage,
});

function CheckoutPage() {
  const { lang, tier } = Route.useParams();
  const params = useMemo(() => Promise.resolve({ lang, tier }), [lang, tier]);
  return (
    <Suspense fallback={<CheckoutLoadingFallback />}>
      <CheckoutContent params={params} />
    </Suspense>
  );
}
