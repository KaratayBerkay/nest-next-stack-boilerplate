import { SkeletonLine } from "@/components/ui/skeleton-shapes";

export function AuditLogsLoadingFallback() {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonLine width="25%" className="h-5" />
      <div className="flex gap-3">
        <SkeletonLine width="120px" className="h-8 rounded-lg" />
        <SkeletonLine width="100px" className="h-8 rounded-lg" />
        <SkeletonLine width="140px" className="h-8 rounded-lg" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-border py-2">
            <SkeletonLine width="100px" className="h-3" />
            <SkeletonLine width="80px" className="h-3" />
            <SkeletonLine width="50px" className="h-3" />
            <SkeletonLine width="80px" className="h-3" />
            <SkeletonLine width="60px" className="h-3" />
            <SkeletonLine width="120px" className="h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
