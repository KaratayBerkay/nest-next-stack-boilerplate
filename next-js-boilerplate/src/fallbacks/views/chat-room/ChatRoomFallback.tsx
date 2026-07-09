import { SkeletonChatMessage } from "@/components/ui/skeleton-shapes";

export function ChatRoomFallback() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-surface-hover" />
        <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
      </div>
      <div className="relative flex min-h-0 flex-1 gap-4">
        <div className="hidden w-56 flex-col gap-4 rounded-xl border border-border bg-bg p-4 md:flex">
          <div className="h-8 animate-pulse rounded-md bg-surface-hover" />
          <div className="flex flex-col gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-surface-hover" />
            ))}
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-bg">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            <SkeletonChatMessage />
            <SkeletonChatMessage isMe />
            <SkeletonChatMessage />
          </div>
          <div className="border-t p-2">
            <div className="h-10 animate-pulse rounded bg-surface-hover" />
          </div>
        </div>
      </div>
    </div>
  );
}
