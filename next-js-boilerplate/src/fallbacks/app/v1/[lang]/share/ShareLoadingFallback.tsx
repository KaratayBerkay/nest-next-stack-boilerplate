import { SkeletonLine } from "@/components/ui/skeleton-shapes";

export function ShareLoadingFallback() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <SkeletonLine width="30%" className="h-5" />
        <SkeletonLine width="24" className="h-6 w-6 rounded-full" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <SkeletonLine width="12%" className="h-3" />
          <SkeletonLine width="100%" className="h-9 rounded-lg" />
        </div>

        <div className="flex flex-col gap-1.5">
          <SkeletonLine width="16%" className="h-3" />
          <SkeletonLine width="100%" className="h-32 rounded-lg" />
        </div>

        <div className="flex flex-col gap-1.5">
          <SkeletonLine width="20%" className="h-3" />
          <SkeletonLine width="100%" className="h-10 rounded-lg" />
        </div>

        <SkeletonLine width="20%" className="h-9 rounded-lg" />
      </div>
    </div>
  );
}
