import { cn } from "@/lib/cn";
import type { LabelProps } from "@/types/ui/Label-types";

export function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-sm font-medium text-fg peer-disabled:opacity-50", className)}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-error" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
