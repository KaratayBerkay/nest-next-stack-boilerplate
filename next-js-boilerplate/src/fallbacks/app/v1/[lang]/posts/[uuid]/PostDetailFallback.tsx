"use client";

import { useYSwipeGesture } from "@/hooks/useYSwipeGesture";

export function PostDetailFallback() {
  const skeletonSwipeRef = useYSwipeGesture<HTMLDivElement>();
  return (
    <div ref={skeletonSwipeRef} className="flex w-full min-h-0 max-h-full flex-col gap-4 overflow-y-auto py-6 max-md:px-1">
      <div className="h-4 w-12 animate-pulse rounded bg-surface-hover" />
      <div className="surface flex flex-col gap-3 rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-surface-hover" />
          <div className="flex flex-col gap-1">
            <div className="h-3 w-24 animate-pulse rounded bg-surface-hover" />
            <div className="h-2 w-16 animate-pulse rounded bg-surface-hover" />
          </div>
        </div>
        <div className="h-6 w-3/4 animate-pulse rounded bg-surface-hover" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full animate-pulse rounded bg-surface-hover" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-surface-hover" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-surface-hover" />
        </div>
      </div>
    </div>
  );
}
