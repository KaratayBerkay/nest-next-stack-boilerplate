// Ported from next-js-boilerplate/src/app/routing/slow/page.tsx
// loading.tsx → pendingComponent; the streamed <Suspense> child becomes a
// deferred (un-awaited) promise in loader data rendered through <Await>.
import { Suspense } from "react";
import { Await, createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { createServerFn } from "@tanstack/react-start";
import { metadataToHead } from "@/lib/head";
import { StreamingDataFallback } from "@/fallbacks";
import { LoadingPage } from "@/features/statics";

export const metadata: Metadata = {
  title: "Slow Page",
  description: "Slow loading demo",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const getShell = createServerFn().handler(async () => {
  // Small delay so the route-level pendingComponent is shown on navigation
  // before the shell appears.
  await sleep(600);
  return true;
});

const getSlowData = createServerFn().handler(async () => {
  await sleep(1400);
  return "This text was streamed from the server after a 1.4s delay.";
});

export const Route = createFileRoute("/routing/slow/")({
  loader: async () => {
    await getShell();
    // Deliberately NOT awaited: the promise streams to the client and
    // resolves behind the <Suspense> boundary below.
    return { slowText: getSlowData() };
  },
  head: () => metadataToHead(metadata),
  pendingComponent: SlowLoading,
  pendingMs: 0,
  component: SlowPage,
});

function SlowLoading() {
  return (
    <p data-testid="route-loading">
      <LoadingPage />
    </p>
  );
}

function SlowPage() {
  const { slowText } = Route.useLoaderData();
  return (
    <div className="flex flex-col gap-2">
      <h2 data-testid="slow-shell" className="text-brand text-sm font-semibold">
        Loading &amp; streaming
      </h2>
      <p className="text-muted text-sm">
        The shell rendered after the route-level pending component; the text
        below streams in later behind a <code>&lt;Suspense&gt;</code>.
      </p>
      <Suspense fallback={<StreamingDataFallback />}>
        <Await promise={slowText}>
          {(text) => (
            <p data-testid="slow-content" className="text-muted text-sm">
              {text}
            </p>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
