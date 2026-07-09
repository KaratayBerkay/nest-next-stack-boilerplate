import { cn } from "@/lib/cn";
import type { CardProps } from "@/types/ui/Card-types";

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "@container",
        "border-border bg-bg text-fg rounded-xl border shadow-sm transition-all hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}
