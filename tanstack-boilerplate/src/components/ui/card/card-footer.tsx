import { cn } from "@/lib/cn";
import type { CardFooterProps } from "@/types/ui/Card-types";

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-2 p-4 pt-0 @sm:flex-row @sm:items-center @sm:p-6 @sm:pt-0",
        className,
      )}
      {...props}
    />
  );
}
