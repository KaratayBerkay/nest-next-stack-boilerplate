import { cn } from "@/lib/cn";

interface LabelProps extends React.ComponentPropsWithoutRef<"label"> {
  required?: boolean;
}

export function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-muted text-xs font-medium", className)}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
