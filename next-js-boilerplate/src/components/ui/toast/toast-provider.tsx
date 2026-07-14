"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { ToastProviderProps, ToastData } from "@/types/ui/Toast-types";

type Action =
  | { type: "ADD"; toast: ToastData }
  | { type: "DISMISS"; id: string };

function reducer(state: ToastData[], action: Action): ToastData[] {
  switch (action.type) {
    case "ADD":
      return [...state, action.toast];
    case "DISMISS":
      return state.filter((t) => t.id !== action.id);
  }
}

interface ToastContextValue {
  state: ToastData[];
  dispatch: React.Dispatch<Action>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("Toast components must be used within <ToastProvider>");
  }
  return ctx;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [state, dispatch] = useReducer(reducer, []);

  return (
    <ToastContext.Provider value={{ state, dispatch }}>
      {children}
    </ToastContext.Provider>
  );
}
