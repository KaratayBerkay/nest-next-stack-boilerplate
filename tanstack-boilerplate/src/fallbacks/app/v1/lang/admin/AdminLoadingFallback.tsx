import { SkeletonLine } from "@/components/ui/skeleton-shapes";

export function AdminLoadingFallback() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <SkeletonLine width="20%" className="h-5" />
      <SkeletonLine width="100%" className="h-9" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border-border flex items-center gap-3 rounded-lg border p-3"
          >
            <div className="bg-surface-hover h-8 w-8 animate-pulse rounded-full" />
            <div className="flex flex-1 flex-col gap-1">
              <SkeletonLine width="40%" className="h-3" />
              <SkeletonLine width="60%" className="h-2.5" />
            </div>
            <SkeletonLine width="20" className="h-6" />
          </div>
        ))}
      </div>
    </div>
  );
}
