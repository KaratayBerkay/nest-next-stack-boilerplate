// Ported from next-js-boilerplate/src/app/(demos)/lazy-loading/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LazyLoadingFallback } from "@/fallbacks";
import { metadataToHead } from "@/lib/head";

export const metadata: Metadata = {
  title: "Lazy Loading",
  description: "Lazy loading demo",
};

const HeavyComponent = dynamic(
  () => import("@/views/demos/lazy-loading/HeavyComponent"),
  { loading: () => <LazyLoadingFallback /> },
);

export const Route = createFileRoute("/_demos/lazy-loading/")({
  head: () => metadataToHead(metadata),
  component: LazyLoadingPage,
});

function LazyLoadingPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Lazy Loading</h2>
      <p className="text-muted text-sm">
        This component is code-split with a dynamic import. Its chunk is loaded
        on demand.
      </p>
      <Suspense fallback={null}>
        <HeavyComponent message="Loaded lazily via a dynamic import!" />
      </Suspense>
    </div>
  );
}
