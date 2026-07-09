import { SkeletonLine } from "@/components/ui/skeleton-shapes";

export function SettingsLoadingFallback() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonLine width="25%" className="h-6" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <SkeletonLine width="15%" className="h-3" />
          <SkeletonLine width="100%" className="h-9 rounded-lg" />
        </div>
        <div className="flex flex-col gap-1.5">
          <SkeletonLine width="20%" className="h-3" />
          <SkeletonLine width="100%" className="h-9 rounded-lg" />
        </div>
        <div className="flex flex-col gap-1.5">
          <SkeletonLine width="12%" className="h-3" />
          <SkeletonLine width="100%" className="h-20 rounded-lg" />
        </div>
        <SkeletonLine width="25%" className="h-9 rounded-lg" />
      </div>
    </div>
  );
}
