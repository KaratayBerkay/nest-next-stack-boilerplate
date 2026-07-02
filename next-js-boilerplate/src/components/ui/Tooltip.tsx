"use client";

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useBreakpoint } from "@/hooks";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const TooltipContext = createContext<TooltipContextType | null>(null);

function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be used within <Tooltip>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GAP = 8;

function getPosition(rect: DOMRect, side: Side): { left: number; top: number } {
  switch (side) {
    case "top":
      return {
        left: rect.left + rect.width / 2,
        top: rect.top - GAP,
      };
    case "bottom":
      return {
        left: rect.left + rect.width / 2,
        top: rect.bottom + GAP,
      };
    case "left":
      return {
        left: rect.left - GAP,
        top: rect.top + rect.height / 2,
      };
    case "right":
      return {
        left: rect.right + GAP,
        top: rect.top + rect.height / 2,
      };
  }
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// TooltipTrigger
// ---------------------------------------------------------------------------

interface TooltipTriggerProps extends React.ComponentPropsWithoutRef<"span"> {
  asChild?: boolean;
  children: ReactNode;
}

export function TooltipTrigger({
  asChild,
  children,
  className,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onClick,
  ...props
}: TooltipTriggerProps) {
  const ref = useRef<HTMLElement>(null);
  const { show, hide, toggle, setTriggerRect, isDesktop } = useTooltip();

  const updateRect = useCallback(() => {
    if (ref.current) {
      setTriggerRect(ref.current.getBoundingClientRect());
    }
  }, [setTriggerRect]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (!isDesktop) return;
      updateRect();
      show();
      onMouseEnter?.(e);
    },
    [updateRect, show, onMouseEnter, isDesktop],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (!isDesktop) return;
      hide();
      onMouseLeave?.(e);
    },
    [hide, onMouseLeave, isDesktop],
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLSpanElement>) => {
      if (!isDesktop) return;
      updateRect();
      show();
      onFocus?.(e);
    },
    [updateRect, show, onFocus, isDesktop],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLSpanElement>) => {
      if (!isDesktop) return;
      hide();
      onBlur?.(e);
    },
    [hide, onBlur, isDesktop],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (!isDesktop) {
        updateRect();
        toggle();
      }
      onClick?.(e);
    },
    [updateRect, toggle, onClick, isDesktop],
  );

  if (asChild) {
    return (
      <span
        ref={ref}
        className={cn("inline-flex", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={cn("inline-flex cursor-pointer", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      {...props}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// TooltipContent
// ---------------------------------------------------------------------------

interface TooltipContentProps {
  children: ReactNode;
  className?: string;
}

export function TooltipContent({ children, className }: TooltipContentProps) {
  const { open, side, triggerRect, hide, isDesktop } = useTooltip();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const hasEscapeRef = useRef(false);
  useEffect(() => {
    if (!open || isDesktop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        hasEscapeRef.current = true;
        hide();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, hide, isDesktop]);

  if (!open || !triggerRect) return null;

  const { left, top } = getPosition(triggerRect, side);

  const translate: Record<Side, string> = {
    top: "-50% -100%",
    bottom: "-50% 0%",
    left: "-100% -50%",
    right: "0% -50%",
  };

  const arrowClass: Record<Side, string> = {
    top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-4 border-r-4 border-t-4 border-transparent border-t-surface",
    bottom:
      "top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-4 border-r-4 border-b-4 border-transparent border-b-surface",
    left: "right-0 top-1/2 translate-x-full -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-surface",
    right:
      "left-0 top-1/2 -translate-x-full -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-surface",
  };

  const positionStyle: CSSProperties = {
    position: "fixed",
    left: left,
    top: top,
    transform: `translate(${translate[side]})`,
    zIndex: 50,
  };

  const desktopTooltip = (
    <>
      <style>{`
        @keyframes tooltip-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .tooltip-open {
          animation: tooltip-in 0.15s ease-out;
        }
      `}</style>
      <div style={positionStyle}>
        <div
          role="tooltip"
          className={cn(
            "tooltip-open relative",
            "bg-surface text-fg rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-lg",
            className,
          )}
        >
          {children}
          <span
            className={cn("absolute size-0", arrowClass[side])}
            aria-hidden="true"
          />
        </div>
      </div>
    </>
  );

  const mobileTooltip = (
    <>
      <div
        className="animate-fade-in fixed inset-0 z-40 bg-black/50"
        onClick={hide}
      />
      <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          role="tooltip"
          className={cn(
            "bg-surface text-fg w-full max-w-sm rounded-xl px-5 py-4 text-sm shadow-lg",
            className,
          )}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-semibold">Info</span>
            <button
              onClick={hide}
              className="text-muted hover:bg-surface-hover rounded-lg p-1"
              aria-label="Close"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );

  return mounted
    ? createPortal(isDesktop ? desktopTooltip : mobileTooltip, document.body)
    : null;
}
