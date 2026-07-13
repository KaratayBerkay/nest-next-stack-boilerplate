import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";
import { useToastContext } from "./toast-provider";
import { ToastTitle } from "./toast-title";
import { ToastDescription } from "./toast-description";
import { ToastClose } from "./toast-close";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { ToastProps, ToastVariant } from "@/types/ui/Toast-types";

const variants: Record<ToastVariant, string> = {
  default: "bg-bg border-border text-fg",
  shiny: "bg-gradient-to-br from-blue-500 to-purple-500 text-white border-transparent shadow-lg shadow-blue-500/20",
  glass: "bg-white/10 backdrop-blur-md text-white border-white/20 shadow-xl",
  neon: "bg-slate-950/90 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]",
  gradient: "bg-gradient-to-br from-slate-900 to-slate-950 text-transparent bg-clip-text border-transparent shadow-2xl",
};

export function Toast({
  id,
  className,
  variant,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: ToastProps) {
  const effectiveVariant = useComponentVariant(variant);
  const { state, dispatch } = useToastContext();
  const toast = state.find((t) => t.id === id);
  const [visible, setVisible] = useState(false);
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";
  const variantClass = variants[effectiveVariant as keyof typeof variants];

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => dispatch({ type: "DISMISS", id }), 5000);
    return () => clearTimeout(timer);
  }, [id, dispatch]);

  if (!toast) return null;

  const toastVariantClasses = {
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
        variantClass,
        toastVariantClasses[toast.variant],
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
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
