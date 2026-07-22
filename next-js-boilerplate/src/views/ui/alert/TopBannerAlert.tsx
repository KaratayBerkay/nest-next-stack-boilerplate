"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import type { PopupAlertProps } from "@/types/ui/PopupAlert-types";
import { AUTO_DISMISS_SECONDS } from "./PopupAlertsExample";
import { CountdownRing } from "./CountdownRing";
import { handleKeyDownModuleLevel } from "./popupAlertHandlers";

export function TopBannerAlert({ phase, remainingMs, onDismiss }: PopupAlertProps) {
  useEffect(() => {
    if (phase !== "open") return;
    const handleKeyDown = (e: KeyboardEvent) =>
      handleKeyDownModuleLevel(e, onDismiss);
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, onDismiss]);

  if (phase === "closed") return null;

  return createPortal(
    <div
      className={cn(
        "pointer-events-auto fixed inset-x-0 top-0 z-50 motion-reduce:animate-none",
        phase === "open" ? "animate-fade-in-down" : "animate-fade-out",
      )}
    >
      <div className="bg-bg shadow-xl">
        <div
          role="alert"
          className="border-info/30 bg-info/10 text-info flex items-center gap-3 border-b px-4 py-3 sm:gap-4 sm:px-6"
        >
          <svg
            className="size-6 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <div className="min-w-0 flex-1">
            <div className="font-semibold">New version available</div>
            <div className="text-sm opacity-90">
              A new build was deployed. Refresh when convenient — this notice
              closes itself in 30 seconds.
            </div>
          </div>
          <CountdownRing
            remainingMs={remainingMs}
            totalSeconds={AUTO_DISMISS_SECONDS}
          />
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={onDismiss}
            className="hover:bg-info/20 focus-visible:ring-brand inline-flex size-12 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
