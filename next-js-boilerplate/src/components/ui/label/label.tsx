import { cn } from "@/lib/cn";
import type { LabelProps } from "@/types/ui/Label-types";

export function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "text-fg text-sm font-medium peer-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-error ml-0.5" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
