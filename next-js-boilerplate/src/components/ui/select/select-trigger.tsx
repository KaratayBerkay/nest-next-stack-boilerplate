"use client";

import { cn } from "@/lib/cn";
import { useSelect } from "./select";
import type { SelectTriggerProps } from "@/types/ui/Select-types";

export function SelectTrigger({
  className,
  children,
  ...props
}: SelectTriggerProps) {
  const { open, setOpen, triggerRef } = useSelect();

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn(
        "border-border bg-bg text-fg focus-visible:ring-brand flex h-9 w-full items-center justify-between gap-2 rounded border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onClick={() => setOpen(!open)}
      data-state={open ? "open" : "closed"}
      aria-expanded={open}
      aria-haspopup="listbox"
      {...props}
    >
      <span className="pointer-events-none flex-1 truncate">{children}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "text-muted shrink-0 transition-transform",
          open && "rotate-180",
        )}
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}
