"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import type { PopupAlertProps } from "@/types/ui/PopupAlert-types";
import { AUTO_DISMISS_SECONDS } from "./PopupAlertsExample";
import { FullWidthModalStyles } from "./FullWidthModalStyles";
import {
  handleBackdropClickModuleLevel,
  handleCancelModuleLevel,
} from "./popupAlertHandlers";

export function FullWidthModalAlert({
  phase,
  remainingMs,
  onDismiss,
}: PopupAlertProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const seconds = Math.ceil(remainingMs / 1000);
  const fraction = Math.min(
    1,
    Math.max(0, remainingMs / (AUTO_DISMISS_SECONDS * 1000)),
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (phase !== "closed" && !dialog.open) dialog.showModal();
  }, [phase]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => handleCancelModuleLevel(e, onDismiss);

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [phase, onDismiss]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) =>
      handleBackdropClickModuleLevel(e, dialogRef, onDismiss),
    [onDismiss],
  );

  if (phase === "closed") return null;

  return createPortal(
    <>
      <FullWidthModalStyles />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        role="alertdialog"
        aria-labelledby="popup-fw-alert-title"
        aria-describedby="popup-fw-alert-desc"
        onClick={handleBackdropClick}
        className={cn(
          "backdrop:bg-overlay/50 border-warning/30 bg-bg m-auto w-full max-w-none border-x-0 border-y p-0 shadow-xl",
          phase === "closing" ? "fw-alert-closing" : "fw-alert-open",
        )}
      >
        <div className="bg-warning/10 text-warning pointer-events-auto flex flex-col">
          <div className="flex items-start gap-3 px-4 py-5 sm:px-6">
            <svg
              className="mt-0.5 size-6 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
            <div className="min-w-0 flex-1">
              <h4 id="popup-fw-alert-title" className="font-semibold">
                Scheduled maintenance tonight
              </h4>
              <p id="popup-fw-alert-desc" className="text-sm opacity-90">
                The platform will be read-only between 02:00 and 02:30 UTC. Save
                your work before the window starts.
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss alert"
              onClick={onDismiss}
              className="hover:bg-warning/20 focus-visible:ring-brand -mt-1 -mr-1 inline-flex size-9 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <svg
                width="20"
                height="20"
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
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={AUTO_DISMISS_SECONDS}
            aria-valuenow={seconds}
            aria-label="Seconds until this alert closes"
            className="border-warning/30 bg-surface relative h-12 w-full overflow-hidden border-t"
          >
            <div
              className="border-warning bg-warning/25 h-full border-r-2 transition-[width] duration-100 ease-linear motion-reduce:transition-none"
              style={{ width: `${fraction * 100}%` }}
            />
            <span className="text-fg pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium tabular-nums">
              Auto-dismisses in {seconds}s
            </span>
          </div>
        </div>
      </dialog>
    </>,
    document.body,
  );
}
