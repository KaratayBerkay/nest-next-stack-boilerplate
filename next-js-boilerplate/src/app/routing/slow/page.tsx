import type { Metadata } from "next";
import { Suspense } from "react";
import { StreamingDataFallback } from "@/fallbacks";

export const metadata: Metadata = {
  title: "Slow Page",
  description: "Slow loading demo",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// A slow child. Because it suspends, React streams the <Suspense> fallback
// first and swaps in this content when the promise resolves — without blocking
// the surrounding shell.
async function SlowData() {
  await sleep(1400);
  return (
    <p data-testid="slow-content" className="text-muted text-sm">
      This text was streamed from the server after a 1.4s delay.
    </p>
  );
}

export default async function SlowPage() {
  // A small top-level await so the route's loading.tsx is shown on navigation
  // before the shell appears.
  await sleep(600);
  return (
    <div className="flex flex-col gap-2">
      <h2 data-testid="slow-shell" className="text-brand text-sm font-semibold">
        Loading &amp; streaming
      </h2>
      <p className="text-muted text-sm">
        The shell rendered after the route-level <code>loading.tsx</code>; the
        text below streams in later behind a <code>&lt;Suspense&gt;</code>.
      </p>
      <Suspense fallback={<StreamingDataFallback />}>
        <SlowData />
      </Suspense>
    </div>
  );
}
