import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

async function Content() {
  return (
    <div className="flex flex-col gap-4" data-testid="skeleton-demo">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Skeleton</h2>
        <p className="text-muted text-sm">
          A loading placeholder for content that has not loaded yet.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Text Line</h3>
        <Skeleton className="h-4 w-64" data-testid="skeleton-text" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Circle</h3>
        <Skeleton
          className="size-10 rounded-full"
          data-testid="skeleton-circle"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Card / Rectangle</h3>
        <div className="flex flex-col gap-2" data-testid="skeleton-card">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
      <Content />
    </Suspense>
  );
}
