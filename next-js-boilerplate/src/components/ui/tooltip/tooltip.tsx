"use client";

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useBreakpoint } from "@/hooks";
import type { TooltipProps, TooltipVariant } from "@/types/ui/Tooltip-types";

type Side = "top" | "bottom" | "left" | "right";

interface TooltipContextType {
  open: boolean;
  side: Side;
  triggerRect: DOMRect | null;
  show: () => void;
  hide: () => void;
  setTriggerRect: (rect: DOMRect) => void;
  toggle: () => void;
  isDesktop: boolean;
  variant?: TooltipVariant;
}

const TooltipContext = createContext<TooltipContextType | null>(null);

export function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be used within <Tooltip>");
  return ctx;
}

const variants: Record<TooltipVariant, string> = {
  default: "bg-surface text-fg",
  shiny: "bg-gradient-to-br from-blue-500 to-purple-500 text-white border-transparent shadow-lg shadow-blue-500/20",
  glass: "bg-white/10 backdrop-blur-md text-white border-white/20 shadow-xl",
  neon: "bg-slate-950/90 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950 text-transparent bg-clip-text border-transparent shadow-2xl",
};

export function Tooltip({ children, delay = 200, side = "top", variant = "default" }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isDesktop = useBreakpoint("sm");
  const variantClass = variants[variant];

  const show = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (open) {
      hide();
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setOpen(true);
    }
  }, [open, hide]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <TooltipContext.Provider
      value={{
        open,
        side,
        triggerRect,
        show,
        hide,
        toggle,
        setTriggerRect,
        isDesktop,
        variant,
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}
