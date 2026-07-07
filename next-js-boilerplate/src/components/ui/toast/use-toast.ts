"use client";

import { useCallback } from "react";
import { useToastContext } from "./toast-provider";

interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
}

export function useToast() {
  const { dispatch } = useToastContext();

  const toast = useCallback(
    ({ title, description, variant = "default" }: ToastOptions) => {
      const id = Math.random().toString(36).slice(2, 11);
      dispatch({ type: "ADD", toast: { id, title, description, variant } });
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
