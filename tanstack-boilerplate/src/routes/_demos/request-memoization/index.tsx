// Ported from next-js-boilerplate/src/app/(demos)/request-memoization/page.tsx
// React.cache-per-request becomes promise-sharing inside a single loader
// invocation: identical keys reuse one in-flight promise, so the "deduped"
// pair reports the same call count while the naive pair differs.
import { createFileRoute } from "@tanstack/react-router";
import type { Metadata } from "next";
import { createServerFn } from "@tanstack/react-start";
import { metadataToHead } from "@/lib/head";

export const metadata: Metadata = {
  title: "Request Memoization",
  description: "Request memoization demo",
};

const getMemoizationDemo = createServerFn().handler(async () => {
  const { fetchUncached } = await import("@/lib/dedup");

  const [ua, ub] = await Promise.all([
    fetchUncached("same-key"),
    fetchUncached("same-key"),
  ]);

  // Loader-scoped dedupe: one promise per key for this invocation.
  const memo = new Map<string, ReturnType<typeof fetchUncached>>();
  const fetchDeduped = (key: string) => {
    let promise = memo.get(key);
    if (!promise) {
      promise = fetchUncached(key);
      memo.set(key, promise);
    }
    return promise;
  };
  const [ca, cb] = await Promise.all([
    fetchDeduped("same-key"),
    fetchDeduped("same-key"),
  ]);

  return {
    uncached: { a: ua.callCount, b: ub.callCount },
    cached: { a: ca.callCount, b: cb.callCount },
  };
});

export const Route = createFileRoute("/_demos/request-memoization/")({
  loader: () => getMemoizationDemo(),
  head: () => metadataToHead(metadata),
  component: RequestMemoizationPage,
});

function RequestMemoizationPage() {
  const { uncached, cached } = Route.useLoaderData();
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">Request Memoization</h2>
      <p className="text-muted text-sm">
        Sharing one promise per key inside a loader means calls with the same
        arguments run the underlying fetch once per request.
      </p>
      <div className="mt-1 flex flex-col gap-3">
        <div className="flex flex-col gap-1 rounded border border-red-300 p-3 text-sm">
          <span className="font-semibold text-red-600">Without dedupe</span>
          <span>
            call 1:{" "}
            <span className="font-mono" data-testid="uncached-a">
              {uncached.a}
            </span>
          </span>
          <span>
            call 2:{" "}
            <span className="font-mono" data-testid="uncached-b">
              {uncached.b}
            </span>
          </span>
          <span className="text-xs text-zinc-500">
            Each call runs the function body separately, so counters differ.
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded border border-green-300 p-3 text-sm">
          <span className="font-semibold text-green-600">With dedupe</span>
          <span>
            call 1:{" "}
            <span className="font-mono" data-testid="cached-a">
              {cached.a}
            </span>
          </span>
          <span>
            call 2:{" "}
            <span className="font-mono" data-testid="cached-b">
              {cached.b}
            </span>
          </span>
          <span className="text-xs text-zinc-500">
            Identical arguments share a single promise within one request.
          </span>
        </div>
      </div>
    </div>
  );
}
