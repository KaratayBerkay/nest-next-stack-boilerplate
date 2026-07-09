import { cn } from "@/lib/cn";
import type { CardHeaderProps } from "@/types/ui/Card-types";

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-4 @sm:p-6", className)}
      {...props}
    />
  );
}
