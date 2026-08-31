// Ported from next-js-boilerplate/src/app/(demos)/caching/page.tsx
// Next's cacheLife/cacheTag demo becomes a TanStack loader-caching demo: the
// timestamp is produced by a server function, kept fresh forever via
// staleTime, and "revalidated" on demand with router.invalidate().
import { createFileRoute, useRouter } from "@tanstack/react-router";
import type { Metadata } from "next";
import { createServerFn } from "@tanstack/react-start";
import { metadataToHead } from "@/lib/head";

export const metadata: Metadata = {
  title: "Caching",
  description: "Caching strategies demo",
};

const getCachedTimestamp = createServerFn().handler(async () => Date.now());

export const Route = createFileRoute("/_demos/caching/")({
  loader: () => getCachedTimestamp(),
  staleTime: Infinity,
  head: () => metadataToHead(metadata),
  component: CachingPage,
});

function RevalidateButtons() {
  const router = useRouter();
  return (
    <div className="flex gap-2">
      <button
        onClick={() => void router.invalidate()}
        className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
        data-testid="revalidate-path"
      >
        Revalidate by path
      </button>
      <button
        onClick={() => void router.invalidate()}
        className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
        data-testid="revalidate-tag"
      >
        Revalidate by tag
      </button>
    </div>
  );
}

function CachingPage() {
  const ts = Route.useLoaderData();
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">
        Caching &amp; Revalidating
      </h2>
      <p className="text-muted text-sm">
        This timestamp comes from a server-function loader cached with{" "}
        <code className="text-brand">staleTime: Infinity</code>. The buttons
        trigger on-demand revalidation via{" "}
        <code className="text-brand">router.invalidate()</code>.
      </p>
      <p className="text-xs text-zinc-500">
        Cached timestamp:{" "}
        <span className="font-mono" data-testid="cached-timestamp">
          {ts}
        </span>
      </p>
      <RevalidateButtons />
    </div>
  );
}
