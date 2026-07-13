"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { PopoverProps, PopoverVariant } from "@/types/ui/Popover-types";

interface PopoverContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  variant?: PopoverVariant;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopover() {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within a Popover");
  }
  return context;
}

const variants: Record<PopoverVariant, string> = {
  default: "",
  shiny: "bg-gradient-to-br from-slate-900 to-slate-950",
  glass: "bg-white/5 backdrop-blur-md",
  neon: "bg-slate-950/80 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950",
};

export function Popover({ children, defaultOpen = false, variant }: PopoverProps) {
  const effectiveVariant = useComponentVariant(variant);
  const [open, setOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const variantClass = variants[effectiveVariant as keyof typeof variants];

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <PopoverContext.Provider value={{ open, toggle, close, triggerRef, variant: effectiveVariant }}>
      <div className={cn(variantClass)}>{children}</div>
    </PopoverContext.Provider>
  );
}
