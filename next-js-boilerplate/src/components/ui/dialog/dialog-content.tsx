"use client";

import {
  useCallback,
  useRef,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useDialog } from "./dialog";
import type { DialogContentProps } from "@/types/ui/DialogContent-types";

export function DialogContent({ children, className }: DialogContentProps) {
  const { open, onOpenChange } = useDialog();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onOpenChange(false);
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onOpenChange]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      setClosing(false);
      dialog.showModal();
    } else if (!open && dialog.open) {
      setClosing(true);
      const timer = setTimeout(() => {
        dialog.classList.remove("dialog-closing");
        dialog.close();
        setClosing(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onOpenChange(false);
      }
    },
    [onOpenChange],
  );

  const dialog = (
    <>
      <style>{`
        @keyframes dialog-fade-in {
          from { opacity: 0; transform: scale(0.95) translateY(-8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes dialog-fade-out {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to   { opacity: 0; transform: scale(0.95) translateY(-8px); }
        }
        @keyframes backdrop-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes backdrop-fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        dialog.dialog-open {
          animation: dialog-fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        dialog.dialog-closing {
          animation: dialog-fade-out 0.15s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        dialog.dialog-open::backdrop {
          animation: backdrop-fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        dialog.dialog-closing::backdrop {
          animation: backdrop-fade-out 0.15s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
      `}</style>
      <dialog
        ref={dialogRef}
        className={cn(
          "backdrop:bg-black/50",
          "border-border bg-bg text-fg m-auto flex h-dvh w-full flex-col overflow-y-auto border-0 shadow-xl sm:h-fit sm:max-h-[85vh] sm:max-w-lg sm:rounded-xl sm:border sm:p-0",
          !open && !closing && "hidden",
          closing ? "dialog-closing" : "dialog-open",
          className,
        )}
        onClick={handleBackdropClick}
      >
        <div className="relative flex flex-col gap-4 p-6 sm:p-6">
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className={cn(
              "text-muted absolute top-4 right-4 inline-flex size-6 items-center justify-center rounded-sm transition-colors",
              "hover:bg-surface-hover hover:text-fg",
              "focus-visible:ring-brand focus-visible:ring-2 focus-visible:outline-none",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
          {children}
        </div>
      </dialog>
    </>
  );

  return mounted ? createPortal(dialog, document.body) : null;
}
