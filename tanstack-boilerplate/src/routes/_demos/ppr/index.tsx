// Ported from next-js-boilerplate/src/app/(demos)/ppr/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { Suspense } from "react";
import { DynamicGreeting } from "@/views/demos/ppr/DynamicGreeting";
import { PprFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "PPR",
  description: "Partial Pre-Rendering demo",
};

export const Route = createFileRoute("/_demos/ppr/")({
  head: () => metadataToHead(metadata),
  component: PprPage,
});

function PprPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">
        Partial Prerendering (PPR)
      </h2>
      <p className="text-muted text-sm">
        This static shell is served immediately from the cache. The personalized
        greeting below is streamed at request time.
      </p>
      <Suspense fallback={<PprFallback />}>
        <DynamicGreeting />
      </Suspense>
    </div>
  );
}
