import type { Metadata } from "next";
import { Suspense } from "react";
import { DynamicGreeting } from "./DynamicGreeting";

export const metadata: Metadata = {
  title: "PPR",
  description: "Partial Pre-Rendering demo",
};

export default function PprPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">
        Partial Prerendering (PPR)
      </h2>
      <p className="text-muted text-sm">
        This static shell is served immediately from the cache. The personalized
        greeting below is streamed at request time.
      </p>
      <Suspense
        fallback={
          <p className="text-sm text-zinc-500">Loading personalization...</p>
        }
      >
        <DynamicGreeting />
      </Suspense>
    </div>
  );
}
