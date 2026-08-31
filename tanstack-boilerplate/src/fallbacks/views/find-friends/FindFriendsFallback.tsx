import { SkeletonLine, SkeletonMessage } from "@/components/ui/skeleton-shapes";

export function FindFriendsFallback() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <SkeletonLine width="30%" className="h-5" />
      <div className="flex gap-1">
        <SkeletonLine className="h-8 flex-1" />
        <SkeletonLine className="h-8 flex-1" />
      </div>
      <SkeletonLine width="100%" className="h-9" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonMessage key={i} />
        ))}
      </div>
    </div>
  );
}
