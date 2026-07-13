import { cn } from "@/lib/cn";
import type { CardHeaderProps } from "@/types/ui/Card-types";

export function CardHeader({ className, upper, title, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 p-4 @sm:p-6", className)}
      {...props}
    >
      {upper && <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{upper}</div>}
      {title && <div className="text-lg font-semibold">{title}</div>}
      {props.children}
    </div>
  );
}
