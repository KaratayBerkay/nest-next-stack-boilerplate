import { cn } from "@/lib/cn";

export function CommandGroup({
  heading,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { heading?: string }) {
  return (
    <div
      className={cn("overflow-hidden p-1", className)}
      role="group"
      {...props}
    >
      {heading && (
        <div className="text-muted px-2 py-1.5 text-xs font-medium">
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}
