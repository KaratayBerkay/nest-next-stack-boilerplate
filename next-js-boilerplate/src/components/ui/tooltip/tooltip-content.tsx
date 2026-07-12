"use client";

import { cn } from "@/lib/cn";
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useTooltip } from "./tooltip";
import type { TooltipContentProps } from "@/types/ui/TooltipContent-types";

const GAP = 8;

function getPosition(rect: DOMRect, side: string) {
  switch (side) {
    case "top":
      return { left: rect.left + rect.width / 2, top: rect.top - GAP };
    case "bottom":
      return { left: rect.left + rect.width / 2, top: rect.bottom + GAP };
    case "left":
      return { left: rect.left - GAP, top: rect.top + rect.height / 2 };
    case "right":
      return { left: rect.right + GAP, top: rect.top + rect.height / 2 };
    default:
      return { left: rect.left + rect.width / 2, top: rect.top - GAP };
  }
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

  const translate: Record<string, string> = {
    top: "-50% -100%",
    bottom: "-50% 0%",
    left: "-100% -50%",
    right: "0% -50%",
  };

  const arrowClass: Record<string, string> = {
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
      {/* Decorative dismiss backdrop, not a control: Escape is handled by the document
          keydown listener above and the visible close button is a real <button>, so this
          scrim doesn't need its own focus/keyboard target. */}
      <div
        className="animate-fade-in fixed inset-0 z-40 bg-black/50"
        onClick={hide}
        aria-hidden="true"
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
