import { SkeletonLine } from "@/components/ui/skeleton-shapes";

export function PlansLoadingFallback() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonLine width="30%" className="h-6" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="surface flex flex-col gap-3 rounded-lg p-5">
            <SkeletonLine width="50%" className="h-5" />
            <SkeletonLine width="30%" className="h-8" />
            <SkeletonLine width="100%" className="h-3" />
            <SkeletonLine width="100%" className="h-3" />
            <SkeletonLine width="100%" className="h-3" />
            <SkeletonLine width="60%" className="h-9 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
