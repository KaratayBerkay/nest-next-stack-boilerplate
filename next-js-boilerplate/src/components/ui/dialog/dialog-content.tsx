"use client";

import {
  useCallback,
  useRef,
  useEffect,
  useState,
  useSyncExternalStore,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useDialog } from "./dialog";
import type { DialogContentProps, DialogSize } from "@/types/ui/Dialog-types";

const sizeStyles: Record<DialogSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  full: "sm:max-w-[90vw] sm:max-h-[90vh]",
};

export function DialogContent({ children, className, size = "md" }: DialogContentProps) {
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
        @media (prefers-reduced-motion: reduce) {
          dialog.dialog-open,
          dialog.dialog-closing,
          dialog.dialog-open::backdrop,
          dialog.dialog-closing::backdrop {
            animation: none;
          }
        }
      `}</style>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        className={cn(
          "backdrop:bg-overlay/50",
          "text-fg m-auto flex h-dvh w-full flex-col overflow-hidden border-0 shadow-xl sm:h-fit sm:max-h-[85vh] sm:rounded-xl sm:border sm:p-0",
          sizeStyles[size],
          !open && !closing && "hidden",
          closing ? "dialog-closing" : "dialog-open",
          className,
        )}
        onClick={handleBackdropClick}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className={cn(
            "text-muted absolute top-3 right-3 z-10 inline-flex size-7 items-center justify-center rounded-md transition-colors",
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
        <div className="pointer-events-auto flex min-h-0 flex-1 flex-col">
          {children}
        </div>
      </dialog>
    </>
  );

  return mounted ? createPortal(dialog, document.body) : null;
}
