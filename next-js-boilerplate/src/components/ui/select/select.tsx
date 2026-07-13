"use client";

import { createContext, useContext, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { SelectProps, SelectVariant } from "@/types/ui/Select-types";

interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string | undefined;
  onValueChange: (value: string) => void;
  labelMap: React.MutableRefObject<Map<string, string>>;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  variant?: SelectVariant;
}

const SelectContext = createContext<SelectContextValue | null>(null);

export function useSelect() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
}

export function Select({
  children,
  value,
  onValueChange,
  defaultOpen = false,
  variant,
}: SelectProps) {
  const effectiveVariant = useComponentVariant(variant);
  const [open, setOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const labelMap = useRef(new Map<string, string>());

  const variants = {
    default: "",
    shiny: "bg-gradient-to-br from-slate-900 to-slate-950",
    glass: "bg-white/5 backdrop-blur-md",
    neon: "bg-slate-950/80 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
    gradient: "bg-gradient-to-br from-slate-900 to-slate-950",
  };

  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        value,
        onValueChange,
        labelMap,
        triggerRef,
        contentRef,
        variant: effectiveVariant,
      }}
    >
      <div className={cn(variants[effectiveVariant as keyof typeof variants])}>{children}</div>
    </SelectContext.Provider>
  );
}
