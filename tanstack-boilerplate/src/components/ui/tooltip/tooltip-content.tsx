"use client";

import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useTooltip } from "./tooltip";
import type { TooltipContentProps } from "@/types/ui/Tooltip-types";

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

const tooltipVariants = {
  ...globalStyleVariants,
  default: "bg-fg text-bg",
};

export function TooltipContent({
  children,
  className,
  variant,
}: TooltipContentProps) {
  const effectiveVariant = useComponentVariant(variant);
  const { open, side, triggerRect, hide, isDesktop, tooltipId } = useTooltip();
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
    top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-4 border-r-4 border-t-4 border-transparent border-t-fg",
    bottom:
      "top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-4 border-r-4 border-b-4 border-transparent border-b-fg",
    left: "right-0 top-1/2 translate-x-full -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-fg",
    right:
      "left-0 top-1/2 -translate-x-full -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-fg",
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
        @media (prefers-reduced-motion: reduce) {
          .tooltip-open {
            animation: none;
          }
        }
      `}</style>
      <div style={positionStyle}>
        <div
          role="tooltip"
          id={tooltipId}
          className={cn(
            "tooltip-open relative",
            "rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-md",
            resolveVariant(tooltipVariants, effectiveVariant),
            className,
          )}
        >
          <div className="pointer-events-auto">{children}</div>
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
        className="animate-fade-in bg-overlay/50 fixed inset-0 z-40"
        onClick={hide}
        aria-hidden="true"
      />
      <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          role="tooltip"
          id={tooltipId}
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
          <div className="pointer-events-auto">{children}</div>
        </div>
      </div>
    </>
  );

  return mounted
    ? createPortal(isDesktop ? desktopTooltip : mobileTooltip, document.body)
    : null;
}
