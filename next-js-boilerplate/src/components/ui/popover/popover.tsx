"use client";

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/cn";
import type { PopoverProps } from "@/types/ui/Popover-types";

interface PopoverContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentId: string;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopover() {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within a Popover");
  }
  return context;
}

export function Popover({ children, defaultOpen = false }: PopoverProps) {
  const [open, setOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentId = useId();

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <PopoverContext.Provider value={{ open, toggle, close, triggerRef, contentId }}>
      {children}
    </PopoverContext.Provider>
  );
}
