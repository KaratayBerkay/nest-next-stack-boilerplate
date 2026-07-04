import { SkeletonFeedList } from "@/components/ui/skeleton-shapes";

export default function FeedLoading() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-4">
      <div className="bg-surface-hover h-4 w-16 animate-pulse rounded" />
      <div className="bg-surface-hover h-8 animate-pulse rounded-lg" />
      <SkeletonFeedList />
    </div>
  );
}
