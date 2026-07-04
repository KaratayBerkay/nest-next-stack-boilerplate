import { cn } from "@/lib/cn";

export function SkeletonLine({
  className,
  width,
}: {
  className?: string;
  width?: string;
}) {
  return (
    <div
      className={cn("bg-surface-hover h-3 animate-pulse rounded", className)}
      style={width ? { width } : undefined}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-border bg-bg flex flex-col gap-3 rounded-xl border p-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="bg-surface-hover h-8 w-8 animate-pulse rounded-full" />
        <SkeletonLine width="40%" className="h-3" />
      </div>
      <SkeletonLine width="100%" />
      <SkeletonLine width="80%" />
      <SkeletonLine width="60%" />
    </div>
  );
}

export function SkeletonMessage({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 px-3 py-2.5", className)}>
      <div className="bg-surface-hover h-10 w-10 animate-pulse rounded-full" />
      <div className="flex flex-1 flex-col gap-1.5">
        <SkeletonLine width="35%" className="h-3" />
        <SkeletonLine width="60%" className="h-2.5" />
      </div>
    </div>
  );
}

export function SkeletonChatMessage({ isMe }: { isMe?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-end gap-1.5",
        isMe ? "justify-end" : "justify-start",
      )}
    >
      {!isMe && (
        <div className="bg-surface-hover mb-0.5 h-6 w-6 animate-pulse rounded-full" />
      )}
      <div
        className={cn(
          "bg-surface-hover h-8 w-1/2 animate-pulse rounded-2xl",
          isMe ? "order-first" : "",
        )}
      />
    </div>
  );
}

export function SkeletonConversationSidebar({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-bg flex max-h-full flex-col gap-4 rounded-xl border p-4",
        className,
      )}
    >
      <div className="flex gap-1">
        <div className="bg-surface-hover h-8 flex-1 animate-pulse rounded-md" />
        <div className="bg-surface-hover h-8 flex-1 animate-pulse rounded-md" />
      </div>
      <div className="bg-surface-hover h-9 animate-pulse rounded-lg" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonMessage key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonFeedList({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
