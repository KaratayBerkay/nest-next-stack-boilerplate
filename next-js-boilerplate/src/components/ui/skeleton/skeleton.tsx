import { cn } from "@/lib/cn";

export function Skeleton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("bg-surface-hover animate-pulse rounded", className)}
      {...props}
    />
  );
}
