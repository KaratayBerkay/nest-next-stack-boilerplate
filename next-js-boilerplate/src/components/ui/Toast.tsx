"use client";

import { cn } from "@/lib/cn";
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";

type ToastVariant = "default" | "destructive" | "success";

interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
}

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

function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("Toast components must be used within <ToastProvider>");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, []);

  return (
    <ToastContext.Provider value={{ state, dispatch }}>
      {children}
    </ToastContext.Provider>
  );
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

export function ToastViewport({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { state } = useToastContext();
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-50 flex w-full flex-col-reverse gap-2 p-4 sm:right-4 sm:bottom-4 sm:left-auto sm:w-auto sm:max-w-sm",
        className,
      )}
      {...props}
    >
      {state.map((item) => (
        <Toast key={item.id} id={item.id} />
      ))}
    </div>,
    document.body,
  );
}

export function ToastTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("text-sm font-semibold", className)} {...props} />;
}

export function ToastDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("text-sm opacity-90", className)} {...props} />;
}

export function ToastClose({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={cn(
        "text-muted hover:text-fg focus:ring-brand absolute top-2 right-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:ring-2 focus:outline-none",
        className,
      )}
      {...props}
    >
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
      <span className="sr-only">Close</span>
    </button>
  );
}

export function Toast({
  id,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { id: string }) {
  const { state, dispatch } = useToastContext();
  const toast = state.find((t) => t.id === id);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => dispatch({ type: "DISMISS", id }), 5000);
    return () => clearTimeout(timer);
  }, [id, dispatch]);

  if (!toast) return null;

  const variantClasses = {
    default: "bg-bg border-border text-fg",
    destructive:
      "bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-900 dark:text-red-100",
    success:
      "bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-900 dark:text-green-100",
  };

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-xl transition-all duration-300 ease-out motion-reduce:transition-none",
        variantClasses[toast.variant],
        visible
          ? "animate-slide-in-right translate-x-0 opacity-100"
          : "translate-x-[calc(100%+2rem)] opacity-0",
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
      <ToastClose onClick={() => dispatch({ type: "DISMISS", id })} />
    </div>
  );
}
