"use client";

import { cn } from "@/lib/cn";
import { useSelect } from "./select";
import type { SelectTriggerProps, SelectVariant } from "@/types/ui/Select-types";

const variants: Record<SelectVariant, string> = {
  default: "border-border bg-bg text-fg",
  shiny: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg shadow-blue-500/20",
  glass: "bg-white/20 backdrop-blur-md text-white border-white/20 shadow-md",
  neon: "bg-slate-950 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
  gradient: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text border-transparent",
};

export function SelectTrigger({
  className,
  children,
  ...props
}: SelectTriggerProps) {
  const { open, setOpen, triggerRef, variant } = useSelect();
  const variantClass = variants[variant || "default"];

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn(
        "focus-visible:ring-brand flex h-9 w-full items-center justify-between gap-2 rounded border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        variantClass,
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
