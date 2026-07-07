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
}

const TooltipContext = createContext<TooltipContextType | null>(null);

export function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be used within <Tooltip>");
  return ctx;
}

interface TooltipProps {
  children: ReactNode;
  delay?: number;
  side?: Side;
}

export function Tooltip({ children, delay = 200, side = "top" }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isDesktop = useBreakpoint("sm");

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
      }}
    >
      {children}
    </TooltipContext.Provider>
  );
}
