"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/cn";
import type { DropdownMenuVariant } from "@/types/ui/DropdownMenu-types";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  variant?: DropdownMenuVariant;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(
  null,
);

export function useDropdownMenuContext() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error(
      "DropdownMenu components must be used within <DropdownMenu>",
    );
  }
  return ctx;
}

const variants: Record<DropdownMenuVariant, string> = {
  default: "",
  shiny: "bg-gradient-to-br from-slate-900 to-slate-950",
  glass: "bg-white/5 backdrop-blur-md",
  neon: "bg-slate-950/80 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950",
};

export function DropdownMenu({
  children,
  variant = "default",
}: React.ComponentPropsWithoutRef<"div"> & { variant?: DropdownMenuVariant }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const variantClass = variants[variant];

  const setOpenSafe = useCallback((v: boolean) => {
    setOpen(v);
  }, []);

  return (
    <DropdownMenuContext.Provider
      value={{ open, setOpen: setOpenSafe, triggerRef, variant }}
    >
      <div className={cn("relative inline-flex", variantClass)}>{children}</div>
    </DropdownMenuContext.Provider>
  );
}
