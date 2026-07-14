"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import { useToastContext } from "./toast-provider";
import { Toast } from "./toast";
import type { ToastViewportProps } from "@/types/ui/Toast-types";

const MAX_VISIBLE = 3;

export function ToastViewport({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: ToastViewportProps) {
  const { state } = useToastContext();
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });
  // Mounted guard (same pattern as dialog-content): a bare `typeof window`
  // branch makes the first client render diverge from SSR and fails hydration.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-relevant="additions removals"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-50 flex w-full flex-col-reverse gap-2 p-4 sm:right-4 sm:bottom-4 sm:left-auto sm:w-auto sm:max-w-sm",
        fonts,
        className,
      )}
      {...props}
    >
      {state.slice(0, MAX_VISIBLE).map((t) => (
        <Toast key={t.id} id={t.id} />
      ))}
    </div>,
    document.body,
  );
}
