"use client";

import { cn } from "@/lib/cn";
import { usePopover } from "./popover";

export function PopoverTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  const { open, toggle, triggerRef } = usePopover();

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn(
        "focus-visible:ring-brand inline-flex items-center justify-center rounded font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      onClick={toggle}
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      aria-haspopup="dialog"
      {...props}
    />
  );
}
