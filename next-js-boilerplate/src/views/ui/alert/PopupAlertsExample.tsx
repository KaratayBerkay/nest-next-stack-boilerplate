"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { PopupAlertProps, PopupPhase } from "@/types/ui/PopupAlert-types";

const AUTO_DISMISS_SECONDS = 30;
const CLOSE_ANIMATION_MS = 300;

function useAutoDismiss(totalSeconds: number) {
  const [phase, setPhase] = useState<PopupPhase>("closed");
  const [remainingMs, setRemainingMs] = useState(totalSeconds * 1000);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deadlineRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimers();
    setPhase("closing");
    closeTimerRef.current = setTimeout(() => setPhase("closed"), CLOSE_ANIMATION_MS);
  }, [clearTimers]);

  const show = useCallback(() => {
    clearTimers();
    deadlineRef.current = Date.now() + totalSeconds * 1000;
    setRemainingMs(totalSeconds * 1000);
    setPhase("open");
    tickTimerRef.current = setInterval(() => {
      const remaining = Math.max(0, deadlineRef.current - Date.now());
      setRemainingMs(remaining);
      if (remaining <= 0) dismiss();
    }, 100);
  }, [clearTimers, dismiss, totalSeconds]);

  useEffect(() => clearTimers, [clearTimers]);

  return { phase, remainingMs, show, dismiss };
}

const RING_RADIUS = 20;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function CountdownRing({
  remainingMs,
  totalSeconds,
}: {
  remainingMs: number;
  totalSeconds: number;
}) {
  const fraction = Math.min(1, Math.max(0, remainingMs / (totalSeconds * 1000)));
  const seconds = Math.ceil(remainingMs / 1000);

  return (
    <div
      className="relative size-12 shrink-0"
      role="timer"
      aria-label={`Closes in ${seconds} seconds`}
    >
      <svg viewBox="0 0 48 48" className="size-12 -rotate-90" aria-hidden="true">
        <circle
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="opacity-20"
        />
        <circle
          cx="24"
          cy="24"
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - fraction)}
          className="transition-[stroke-dashoffset] duration-100 ease-linear motion-reduce:transition-none"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums">
        {seconds}
      </span>
    </div>
  );
}

function handleKeyDownModuleLevel(e: KeyboardEvent, onDismiss: () => void) {
  if (e.key === "Escape") onDismiss();
}

function handleCancelModuleLevel(e: Event, onDismiss: () => void) {
  e.preventDefault();
  onDismiss();
}

function handleBackdropClickModuleLevel(
  e: MouseEvent<HTMLDialogElement>,
  dialogRef: RefObject<HTMLDialogElement | null>,
  onDismiss: () => void,
) {
  if (e.target === dialogRef.current) {
    onDismiss();
  }
}

function TopBannerAlert({ phase, remainingMs, onDismiss }: PopupAlertProps) {
  useEffect(() => {
    if (phase !== "open") return;
    const handleKeyDown = (e: KeyboardEvent) => handleKeyDownModuleLevel(e, onDismiss);
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

function FullWidthModalAlert({ phase, remainingMs, onDismiss }: PopupAlertProps) {
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
    (e: MouseEvent<HTMLDialogElement>) =>
      handleBackdropClickModuleLevel(e, dialogRef, onDismiss),
    [onDismiss],
  );

  if (phase === "closed") return null;

  return createPortal(
    <>
      <style>{`
        @keyframes fw-alert-in {
          from { opacity: 0; transform: translateY(-16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fw-alert-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes fw-alert-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fw-alert-backdrop-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        dialog.fw-alert-open {
          animation: fw-alert-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        dialog.fw-alert-closing {
          animation: fw-alert-out 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        dialog.fw-alert-open::backdrop {
          animation: fw-alert-backdrop-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        dialog.fw-alert-closing::backdrop {
          animation: fw-alert-backdrop-out 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          dialog.fw-alert-open,
          dialog.fw-alert-closing,
          dialog.fw-alert-open::backdrop,
          dialog.fw-alert-closing::backdrop {
            animation: none;
          }
        }
      `}</style>
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
        <div className="pointer-events-auto bg-warning/10 text-warning flex flex-col">
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
                The platform will be read-only between 02:00 and 02:30 UTC.
                Save your work before the window starts.
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

export function PopupAlertsExample() {
  const banner = useAutoDismiss(AUTO_DISMISS_SECONDS);
  const modal = useAutoDismiss(AUTO_DISMISS_SECONDS);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Top Banner Alert</h3>
        <p className="text-muted text-sm">
          Slides down from the top of the page like a top sheet. Dismiss it
          with the big X button, or let the circular 30-second countdown close
          it for you.
        </p>
        <Button onClick={banner.show} className="w-fit">
          Show top banner alert
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Full-Width Modal Alert</h3>
        <p className="text-muted text-sm">
          A blocking, full-width alert with a backdrop. The horizontal bar
          under the message drains as the 30-second auto-dismiss approaches.
          Close it with the X button, the Escape key, or a click on the
          backdrop.
        </p>
        <Button onClick={modal.show} className="w-fit">
          Show full-width modal alert
        </Button>
      </section>

      <TopBannerAlert
        phase={banner.phase}
        remainingMs={banner.remainingMs}
        onDismiss={banner.dismiss}
      />
      <FullWidthModalAlert
        phase={modal.phase}
        remainingMs={modal.remainingMs}
        onDismiss={modal.dismiss}
      />
    </div>
  );
}
