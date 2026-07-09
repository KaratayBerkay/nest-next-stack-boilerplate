import { cn } from "@/lib/cn";
import type { CardTitleProps } from "@/types/ui/Card-types";

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "text-base leading-none font-semibold tracking-tight @sm:text-lg",
        className,
      )}
      {...props}
    />
  );
}
