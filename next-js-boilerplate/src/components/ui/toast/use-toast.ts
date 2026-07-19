"use client";

import { useCallback } from "react";
import { useToastContext } from "./toast-provider";
import type { ToastOptions } from "@/types/ui/Toast-types";

const DEFAULT_DURATION = 5000;

export function useToast() {
  const { dispatch } = useToastContext();

  const toast = useCallback(
    ({
      title,
      description,
      variant = "default",
      action,
      duration,
    }: ToastOptions) => {
      const id = Math.random().toString(36).slice(2, 11);
      const resolvedDuration =
        duration ?? (variant === "destructive" ? Infinity : DEFAULT_DURATION);
      dispatch({
        type: "ADD",
        toast: {
          id,
          title,
          description,
          variant,
          action,
          duration: resolvedDuration,
          createdAt: Date.now(),
        },
      });
      return id;
    },
    [dispatch],
  );

  const dismiss = useCallback(
    (id: string) => {
      dispatch({ type: "DISMISS", id });
    },
    [dispatch],
  );

  return { toast, dismiss };
}
