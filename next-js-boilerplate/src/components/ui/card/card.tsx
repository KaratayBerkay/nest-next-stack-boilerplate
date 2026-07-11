import { cn } from "@/lib/cn";
import type { CardProps } from "@/types/ui/Card-types";

export function Card({ className, variant = "default", ...props }: CardProps) {
  const variants = {
    default:
      "border-border bg-bg text-fg rounded-xl border shadow-sm transition-all hover:shadow-md",
    elevated:
      "border-border bg-bg text-fg rounded-xl border shadow-elevated",
    interactive:
      "border-border bg-bg text-fg rounded-xl border transition-all hover:shadow-md hover:border-brand cursor-pointer",
    outline: "border-2 border-border bg-transparent text-fg rounded-xl",
    surface: "surface rounded-xl",
  };

  return (
    <div className={cn(variants[variant], className)} {...props} />
  );
}
