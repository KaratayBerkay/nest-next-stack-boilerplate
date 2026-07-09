import { cn } from "@/lib/cn";
import type { CardDescriptionProps } from "@/types/ui/Card-types";

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn("text-muted text-sm", className)} {...props} />;
}
