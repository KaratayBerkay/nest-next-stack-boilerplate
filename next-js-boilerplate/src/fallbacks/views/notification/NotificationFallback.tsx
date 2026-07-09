import { SkeletonMessage } from "@/components/ui/skeleton-shapes";

export function NotificationFallback() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
      <div className="flex flex-col gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonMessage key={i} />
        ))}
      </div>
    </div>
  );
}
