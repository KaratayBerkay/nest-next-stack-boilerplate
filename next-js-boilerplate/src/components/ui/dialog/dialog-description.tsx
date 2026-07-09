import { cn } from "@/lib/cn";
import type { DialogDescriptionProps } from "@/types/ui/Dialog-types";

export function DialogDescription({
  className,
  ...props
}: DialogDescriptionProps) {
  return <p className={cn("text-muted text-sm", className)} {...props} />;
}
