import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Lazy Loading",
  description: "Lazy loading demo",
};

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => (
    <div
      className="rounded border border-zinc-300 p-3 text-sm text-zinc-400"
      data-testid="lazy-loading"
    >
      Loading heavy component...
    </div>
  ),
});

export default function LazyLoadingPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Lazy Loading</h2>
      <p className="text-muted text-sm">
        This component is code-split with{" "}
        <code className="text-brand">next/dynamic</code>. Its chunk is loaded on
        demand.
      </p>
      <Suspense fallback={null}>
        <HeavyComponent message="Loaded lazily via next/dynamic!" />
      </Suspense>
    </div>
  );
}
