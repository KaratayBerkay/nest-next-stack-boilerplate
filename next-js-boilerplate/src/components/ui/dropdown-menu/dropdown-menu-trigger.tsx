"use client";

import { cn } from "@/lib/cn";
import { useDropdownMenuContext } from "./dropdown-menu";

export function DropdownMenuTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  const { open, setOpen, triggerRef } = useDropdownMenuContext();

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
      onClick={() => setOpen(!open)}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    />
  );
}
