import { cn } from "@/lib/cn";
import type { CardHeaderProps } from "@/types/ui/Card-types";

export function CardHeader({
  className,
  upper,
  title,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-4 @sm:p-6", className)}
      {...props}
    >
      {upper && (
        <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          {upper}
        </div>
      )}
      {title && <div className="text-lg font-semibold">{title}</div>}
      {props.children}
    </div>
  );
}
