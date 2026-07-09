import { cn } from "@/lib/cn";
import { variants, sizes } from "@/components/ui/button-styles";
import type { ButtonProps } from "@/types/ui/Button-types";

export function Button({
  variant = "default",
  size = "md",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-visible:ring-brand inline-flex items-center justify-center gap-2 rounded font-medium shadow-xs transition-all hover:shadow-md focus-visible:ring-2 focus-visible:outline-none active:shadow-xs disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
