import { cacheLife, cacheTag, revalidatePath, revalidateTag } from "next/cache";
import { Suspense } from "react";
import { CACHE_TAG } from "@/constants/demo";

async function getCachedTimestamp() {
  "use cache";
  cacheLife({ stale: 60, revalidate: 120 });
  cacheTag(CACHE_TAG);
  return Date.now();
}

async function CachedTimestamp() {
  const ts = await getCachedTimestamp();
  return (
    <span className="font-mono" data-testid="cached-timestamp">
      {ts}
    </span>
  );
}

function RevalidateButtons() {
  return (
    <form className="flex gap-2">
      <button
        formAction={async () => {
          "use server";
          revalidatePath("/caching");
        }}
        className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
        data-testid="revalidate-path"
      >
        Revalidate by path
      </button>
      <button
        formAction={async () => {
          "use server";
          revalidateTag(CACHE_TAG, "max");
        }}
        className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
        data-testid="revalidate-tag"
      >
        Revalidate by tag
      </button>
    </form>
  );
}

export default function CachingPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-brand text-sm font-semibold">
        Caching &amp; Revalidating
      </h2>
      <p className="text-muted text-sm">
        This timestamp is cached with{" "}
        <code className="text-brand">cacheLife</code> and tagged with{" "}
        <code className="text-brand">cacheTag</code>. The buttons trigger
        on-demand revalidation.
      </p>
      <p className="text-xs text-zinc-500">
        Cached timestamp:{" "}
        <Suspense
          fallback={<span className="font-mono text-zinc-400">...</span>}
        >
          <CachedTimestamp />
        </Suspense>
      </p>
      <RevalidateButtons />
    </div>
  );
}
