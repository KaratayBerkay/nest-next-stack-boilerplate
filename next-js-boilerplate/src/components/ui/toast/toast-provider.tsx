"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";

type ToastVariant = "default" | "destructive" | "success";

interface ToastData {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant: ToastVariant;
}

type State = ToastData[];

type Action =
  | { type: "ADD"; toast: ToastData }
  | { type: "DISMISS"; id: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD":
      return [...state, action.toast];
    case "DISMISS":
      return state.filter((t) => t.id !== action.id);
  }
}

interface ToastContextValue {
  state: State;
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

import type { ToastProviderProps } from "@/types/ui/ToastProvider-types";

export function ToastProvider({ children }: ToastProviderProps) {
  const [state, dispatch] = useReducer(reducer, []);

  return (
    <ToastContext.Provider value={{ state, dispatch }}>
      {children}
    </ToastContext.Provider>
  );
}
