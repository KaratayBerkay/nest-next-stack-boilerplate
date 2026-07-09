import { cn } from "@/lib/cn";
import type { DialogTitleProps } from "@/types/ui/Dialog-types";

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <h2
      className={cn(
        "text-lg leading-none font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}
