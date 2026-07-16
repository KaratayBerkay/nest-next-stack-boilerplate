"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef, useCallback, useState } from "react";
import { useToastContext } from "./toast-provider";
import { ToastTitle } from "./toast-title";
import { ToastDescription } from "./toast-description";
import { ToastClose } from "./toast-close";
import { fontClasses } from "@/lib/font-classes";
import type { ToastProps } from "@/types/ui/Toast-types";

const EXIT_DURATION = 200;

const variantClasses = {
  default: "",
  destructive: "bg-error/10 border-error/30 text-error",
  success: "bg-success/10 border-success/30 text-success",
  warning: "bg-warning/10 border-warning/30 text-warning",
  info: "bg-info/10 border-info/30 text-info",
};

export function Toast({
  id,
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: ToastProps) {
  const { state, dispatch } = useToastContext();
  const toast = state.find((t) => t.id === id);
  const [dismissed, setDismissed] = useState(false);
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const startTimeRef = useRef(0);
  const remainingRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const pause = useCallback(() => {
    if (timerRef.current) {
      const elapsed = performance.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
      clearTimer();
    }
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (remainingRef.current === Infinity || remainingRef.current <= 0) return;
    startTimeRef.current = performance.now();
    timerRef.current = setTimeout(() => setDismissed(true), remainingRef.current);
  }, []);

  const handleDismiss = useCallback(() => {
    pause();
    setDismissed(true);
    setTimeout(() => dispatch({ type: "DISMISS", id }), EXIT_DURATION);
  }, [pause, id, dispatch]);

  const toastDuration = toast?.duration;

  useEffect(() => {
    if (!toastDuration || toastDuration === Infinity) return;
    remainingRef.current = toastDuration;
    startTimeRef.current = performance.now();
    timerRef.current = setTimeout(() => setDismissed(true), toastDuration);
    return clearTimer;
  }, [toastDuration, clearTimer]);

  useEffect(() => {
    if (dismissed) {
      const timer = setTimeout(() => dispatch({ type: "DISMISS", id }), EXIT_DURATION);
      return () => clearTimeout(timer);
    }
  }, [dismissed, id, dispatch]);

  if (!toast) return null;

  return (
    <div
      role={toast.variant === "destructive" ? "alert" : "status"}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
      className={cn(
        "group pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-xl motion-reduce:transition-none",
        dismissed
          ? "animate-slide-out-right opacity-0 translate-x-full"
          : "animate-slide-in-right opacity-100 translate-x-0",
        "bg-bg border-border text-fg",
        toast.variant !== "default" && variantClasses[toast.variant],
        fonts,
        className,
      )}
      {...props}
    >
      <div className="flex-1 space-y-1">
        {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
        {toast.description && (
          <ToastDescription>{toast.description}</ToastDescription>
        )}
      </div>
      {toast.action && (
        <div className="shrink-0 self-center">{toast.action}</div>
      )}
      <ToastClose onClick={handleDismiss} />
    </div>
  );
}
