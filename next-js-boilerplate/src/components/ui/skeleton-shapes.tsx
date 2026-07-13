import { cn } from "@/lib/cn";

export function SkeletonLine({
  className,
  width,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { width?: string }) {
  return (
    <div
      className={cn(
        "bg-surface-hover h-4 w-full animate-pulse rounded",
        width && `w-[${width}]`,
        className,
      )}
      {...props}
    />
  );
}

export function SkeletonMessage({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 animate-pulse",
        className,
      )}
      {...props}
    >
      <div className="bg-surface-hover h-4 w-3/4 rounded" />
      <div className="bg-surface-hover h-4 w-1/2 rounded" />
    </div>
  );
}

export function SkeletonChatMessage({
  className,
  isMe,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { isMe?: boolean }) {
  return (
    <div
      className={cn(
        "flex gap-3 animate-pulse",
        isMe && "flex-row-reverse",
        className,
      )}
      {...props}
    >
      <div className="bg-surface-hover h-10 w-10 shrink-0 rounded-full" />
      <div className="flex flex-col gap-2">
        <div className="bg-surface-hover h-4 w-48 rounded" />
        <div className="bg-surface-hover h-4 w-32 rounded" />
      </div>
    </div>
  );
}

export function SkeletonConversationSidebar({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 animate-pulse",
        className,
      )}
      {...props}
    >
      <div className="bg-surface-hover h-10 w-full rounded" />
      <div className="bg-surface-hover h-8 w-full rounded" />
      <div className="bg-surface-hover h-8 w-full rounded" />
    </div>
  );
}

export function SkeletonFeedList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 animate-pulse",
        className,
      )}
      {...props}
    >
      <div className="bg-surface-hover h-32 w-full rounded" />
      <div className="bg-surface-hover h-32 w-full rounded" />
      <div className="bg-surface-hover h-32 w-full rounded" />
    </div>
  );
}
