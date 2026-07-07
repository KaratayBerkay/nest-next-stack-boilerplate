"use client";

import { cn } from "@/lib/cn";
import { useCommandContext } from "./command";

export function CommandEmpty({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { filteredItems } = useCommandContext();
  if (filteredItems.length > 0) return null;

  return (
    <div
      className={cn("text-muted py-6 text-center text-sm", className)}
      {...props}
    >
      {children ?? "No results found."}
    </div>
  );
}
