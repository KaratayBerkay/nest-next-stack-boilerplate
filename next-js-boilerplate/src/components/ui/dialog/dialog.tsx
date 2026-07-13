"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import type { DialogProps, DialogVariant } from "@/types/ui/Dialog-types";

interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: DialogVariant;
}

const DialogContext = createContext<DialogContextType | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog components must be used within <Dialog>");
  return ctx;
}

const variants: Record<DialogVariant, string> = {
  default: "",
  shiny: "bg-gradient-to-br from-slate-900 to-slate-950",
  glass: "bg-white/5 backdrop-blur-md",
  neon: "bg-slate-950/80 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950",
};

export function Dialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
  variant = "default",
}: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const variantClass = variants[variant];

  const onOpenChange = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      controlledOnOpenChange?.(value);
    },
    [isControlled, controlledOnOpenChange],
  );

  return (
    <DialogContext.Provider value={{ open, onOpenChange, variant }}>
      <div className={cn(variantClass)}>{children}</div>
    </DialogContext.Provider>
  );
}
