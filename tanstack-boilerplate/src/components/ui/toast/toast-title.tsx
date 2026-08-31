import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { ToastTitleProps } from "@/types/ui/Toast-types";

export function ToastTitle({
  className,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: ToastTitleProps) {
  const fonts = fontClasses(
    { fontSize, fontWeight, fontFamily },
    { fontWeight: "font-semibold" },
  );

  return (
    <div className={cn("text-sm font-semibold", fonts, className)} {...props} />
  );
}
