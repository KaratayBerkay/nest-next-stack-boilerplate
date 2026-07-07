import { Suspense } from "react";
import { Skeleton, SkeletonLine, SkeletonMessage, SkeletonFeedList, SkeletonConversationSidebar } from "@/components/ui/Skeleton";

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
        <h3 className="text-lg font-semibold">Base Skeleton</h3>
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
        <h3 className="text-lg font-semibold">Skeleton Line</h3>
        <div className="flex flex-col gap-2">
          <SkeletonLine width="60%" data-testid="skeleton-line-60" />
          <SkeletonLine width="40%" data-testid="skeleton-line-40" />
          <SkeletonLine width="80%" data-testid="skeleton-line-80" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Skeleton Message</h3>
        <SkeletonMessage data-testid="skeleton-message" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Skeleton Feed List</h3>
        <SkeletonFeedList data-testid="skeleton-feed" />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Skeleton Conversation Sidebar</h3>
        <SkeletonConversationSidebar className="max-w-sm" data-testid="skeleton-sidebar" />
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
