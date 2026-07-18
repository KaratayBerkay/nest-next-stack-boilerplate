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
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { useDialog } from "./dialog";
import type { DialogContentProps, DialogSize } from "@/types/ui/Dialog-types";

const sizeStyles: Record<DialogSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  full: "sm:max-w-[90vw]",
};

const dialogVariants = {
  ...globalStyleVariants,
  default: "bg-bg border-border text-fg shadow-xl sm:border sm:rounded-xl",
};

export function DialogContent({
  children,
  className,
  size = "md",
  variant,
  closeLabel = "Close",
}: DialogContentProps) {
  const effectiveVariant = useComponentVariant(variant);
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
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialogRef}
        className={cn(
          "backdrop:bg-overlay/50 m-auto flex h-dvh w-full flex-col overflow-hidden border-0 sm:h-fit sm:max-h-[85vh] sm:p-0",
          resolveVariant(dialogVariants, effectiveVariant),
          sizeStyles[size],
          !open && !closing && "hidden",
          closing ? "dialog-closing" : "dialog-open",
          className,
        )}
        onClick={handleBackdropClick}
      >
        <button
          type="button"
          aria-label={closeLabel}
          onClick={() => onOpenChange(false)}
          className={cn(
            "text-muted absolute top-4 right-4 z-10 inline-flex size-7 items-center justify-center rounded-md transition-colors",
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
