import { SkeletonLine } from "@/components/ui/skeleton-shapes";

export default function ShareLoading() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4">
      <SkeletonLine width="30%" className="h-5" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <SkeletonLine width="15%" className="h-3" />
          <SkeletonLine width="100%" className="h-9" />
        </div>
        <div className="flex flex-col gap-1">
          <SkeletonLine width="20%" className="h-3" />
          <SkeletonLine width="100%" className="h-32" />
        </div>
        <SkeletonLine width="50%" className="h-8" />
      </div>
    </div>
  );
}
