import { SkeletonLine } from "@/components/ui/skeleton-shapes";

export function CheckoutLoadingFallback() {
  return (
    <div className="flex flex-col gap-6">
      <SkeletonLine width="35%" className="h-6" />
      <div className="surface flex flex-col gap-4 rounded-lg p-5">
        <SkeletonLine width="50%" className="h-4" />
        <SkeletonLine width="100%" className="h-9 rounded-lg" />
        <SkeletonLine width="100%" className="h-9 rounded-lg" />
        <SkeletonLine width="100%" className="h-9 rounded-lg" />
        <SkeletonLine width="30%" className="h-9 rounded-lg" />
      </div>
    </div>
  );
}
