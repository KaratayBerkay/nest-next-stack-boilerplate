import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { ToastDescriptionProps } from "@/types/ui/Toast-types";

export function ToastDescription({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: ToastDescriptionProps) {
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  return (
    <div
      className={cn(
        "text-sm opacity-90",
        fonts,
        className,
      )}
      {...props}
    />
  );
}
