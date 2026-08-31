import { SkeletonLine } from "@/components/ui/skeleton-shapes";

export function PremiumLoadingFallback() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonLine width="40%" className="h-6" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface flex flex-col gap-2 rounded-lg p-4">
            <SkeletonLine width="60%" className="h-3" />
            <SkeletonLine width="40%" className="h-8" />
          </div>
        ))}
      </div>
      <div className="surface flex flex-col gap-3 rounded-lg p-4">
        <SkeletonLine width="30%" className="h-4" />
        <SkeletonLine width="100%" className="h-3" />
        <SkeletonLine width="80%" className="h-3" />
      </div>
    </div>
  );
}
