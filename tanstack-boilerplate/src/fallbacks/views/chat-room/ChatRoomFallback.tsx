import { SkeletonChatMessage } from "@/components/ui/skeleton-shapes";

export function ChatRoomFallback() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <div className="bg-surface-hover h-8 w-8 animate-pulse rounded-full" />
        <div className="bg-surface-hover h-4 w-24 animate-pulse rounded" />
      </div>
      <div className="relative flex min-h-0 flex-1 gap-4">
        <div className="border-border bg-bg hidden w-56 flex-col gap-4 rounded-xl border p-4 md:flex">
          <div className="bg-surface-hover h-8 animate-pulse rounded-md" />
          <div className="flex flex-col gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface-hover h-8 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>
        <div className="border-border bg-bg flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border">
          <div className="border-border flex items-center gap-2 border-b px-4 py-3">
            <div className="bg-surface-hover h-4 w-20 animate-pulse rounded" />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <SkeletonChatMessage />
            <SkeletonChatMessage isMe />
            <SkeletonChatMessage />
          </div>
          <div className="border-t p-2">
            <div className="bg-surface-hover h-10 animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
