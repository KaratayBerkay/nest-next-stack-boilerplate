import type { ClassNameProps } from "@/types/ui/ClassName-types";
import { cn } from "@/lib/cn";

export function SessionSkeleton({ className }: ClassNameProps) {
  return (
    <div className={cn("text-muted flex items-center justify-center py-12 text-sm", className)}>
      Loading sessions...
    </div>
  );
}
