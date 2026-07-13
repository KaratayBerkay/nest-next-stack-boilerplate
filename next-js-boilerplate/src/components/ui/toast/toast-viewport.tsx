import { cn } from "@/lib/cn";
import type { ToastViewportProps } from "@/types/ui/Toast-types";

export function ToastViewport({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: ToastViewportProps) {
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-50 flex w-full flex-col-reverse gap-2 p-4 sm:right-4 sm:bottom-4 sm:left-auto sm:w-auto sm:max-w-sm",
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
        className,
      )}
      {...props}
    />
  );
}
