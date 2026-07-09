import { cn } from "@/lib/cn";
import type { CardContentProps } from "@/types/ui/Card-types";

export function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div className={cn("p-4 pt-0 @sm:p-6 @sm:pt-0", className)} {...props} />
  );
}
