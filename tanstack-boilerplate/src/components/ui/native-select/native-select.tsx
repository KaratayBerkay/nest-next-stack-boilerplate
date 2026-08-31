import { forwardRef } from "react";
import { cn } from "@/lib/cn";
export const NativeSelect = forwardRef<
  HTMLSelectElement,
  React.ComponentPropsWithoutRef<"select">
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "border-border bg-bg focus-visible:ring-brand flex h-9 w-full appearance-none rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <svg
      className="text-muted pointer-events-none absolute top-0 right-0 mr-3 h-full rtl:left-0 rtl:mr-0 rtl:ml-3"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </div>
));
NativeSelect.displayName = "NativeSelect";
