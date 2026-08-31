// Ported from next-js-boilerplate/src/app/(demos)/dynamic/page.tsx
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { metadataToHead } from "@/lib/head";
import { Suspense } from "react";
import { Timestamp } from "@/views/demos/dynamic/Timestamp";
import { DynamicLoadingFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Dynamic",
  description: "Dynamic rendering demo",
};

export const Route = createFileRoute("/_demos/dynamic/")({
  head: () => metadataToHead(metadata),
  component: DynamicPage,
});

function DynamicPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Dynamic rendering</h2>
      <p className="text-muted text-sm">
        This page uses{" "}
        <code className="bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
          connection()
        </code>{" "}
        — a fresh timestamp every request.
      </p>
      <p className="text-xs text-zinc-500">
        Rendered at:{" "}
        <Suspense fallback={<DynamicLoadingFallback />}>
          <Timestamp />
        </Suspense>
      </p>
    </div>
  );
}
