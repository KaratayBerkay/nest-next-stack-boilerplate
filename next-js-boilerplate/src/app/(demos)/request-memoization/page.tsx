import { Suspense } from "react";
import { fetchUncached, fetchCached } from "@/lib/dedup";

async function UncachedResults() {
  const [a, b] = await Promise.all([
    fetchUncached("same-key"),
    fetchUncached("same-key"),
  ]);
  return (
    <div className="flex flex-col gap-1 rounded border border-red-300 p-3 text-sm">
      <span className="font-semibold text-red-600">Without React.cache</span>
      <span>
        call 1:{" "}
        <span className="font-mono" data-testid="uncached-a">
          {a.callCount}
        </span>
      </span>
      <span>
        call 2:{" "}
        <span className="font-mono" data-testid="uncached-b">
          {b.callCount}
        </span>
      </span>
      <span className="text-xs text-zinc-500">
        Each call runs the function body separately, so counters differ.
      </span>
    </div>
  );
}

async function CachedResults() {
  const [a, b] = await Promise.all([
    fetchCached("same-key"),
    fetchCached("same-key"),
  ]);
  return (
    <div className="flex flex-col gap-1 rounded border border-green-300 p-3 text-sm">
      <span className="font-semibold text-green-600">With React.cache</span>
      <span>
        call 1:{" "}
        <span className="font-mono" data-testid="cached-a">
          {a.callCount}
        </span>
      </span>
      <span>
        call 2:{" "}
        <span className="font-mono" data-testid="cached-b">
          {b.callCount}
        </span>
      </span>
      <span className="text-xs text-zinc-500">
        React.cache deduplicates identical arguments within the same request.
      </span>
    </div>
  );
}

export default function RequestMemoizationPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Request Memoization</h2>
      <p className="text-muted text-sm">
        <code className="text-brand">React.cache</code> wraps an async function
        so that calls with the same arguments share a single promise within one
        render pass.
      </p>
      <Suspense
        fallback={
          <div className="text-sm text-zinc-400">Loading results...</div>
        }
      >
        <div className="mt-1 flex flex-col gap-3">
          <UncachedResults />
          <CachedResults />
        </div>
      </Suspense>
    </div>
  );
}
