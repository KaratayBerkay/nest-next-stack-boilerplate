import { SkeletonConversationSidebar } from "@/components/ui/skeleton-shapes";

export default function MessagesLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden p-4">
      <div className="flex items-center gap-3">
        <div className="bg-surface-hover h-8 w-8 animate-pulse rounded-full" />
        <div className="bg-surface-hover h-4 w-24 animate-pulse rounded" />
      </div>
      <div className="relative flex min-h-0 flex-1 gap-4">
        <div className="w-80 max-md:hidden">
          <SkeletonConversationSidebar />
        </div>
        <div className="border-border bg-bg flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border">
          <div className="border-border flex items-center gap-3 border-b px-4 py-3">
            <div className="bg-surface-hover h-8 w-8 animate-pulse rounded-full" />
            <div className="bg-surface-hover h-4 w-32 animate-pulse rounded" />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="bg-surface-hover h-10 animate-pulse rounded-2xl"
                  style={{ width: `${35 + (i % 3) * 15}%` }}
                />
              </div>
            ))}
          </div>
          <div className="border-t p-3">
            <div className="bg-surface-hover h-10 w-full animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
