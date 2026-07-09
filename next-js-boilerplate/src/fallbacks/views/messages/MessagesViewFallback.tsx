import { SkeletonConversationSidebar } from "@/components/ui/skeleton-shapes";

export function MessagesViewFallback() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden p-4">
      <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
      <div className="relative flex min-h-0 flex-1 gap-4">
        <div className="w-80 max-md:hidden">
          <SkeletonConversationSidebar />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-bg">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-surface-hover" />
            <div className="h-4 w-32 animate-pulse rounded bg-surface-hover" />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="h-10 animate-pulse rounded-2xl bg-surface-hover"
                  style={{ width: `${35 + (i % 3) * 15}%` }}
                />
              </div>
            ))}
          </div>
          <div className="border-t p-3">
            <div className="h-10 w-full animate-pulse rounded-xl bg-surface-hover" />
          </div>
        </div>
      </div>
    </div>
  );
}
