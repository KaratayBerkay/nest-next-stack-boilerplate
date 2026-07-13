import { cn } from "@/lib/cn";
import { variants, sizes } from "@/components/ui/button-styles";
import type { ButtonProps } from "@/types/ui/Button-types";

export function Button({
  variant = "default",
  size = "md",
  className,
  disabled,
  fontSize,
  fontWeight,
  fontFamily,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  const fontSizeClass = fontSize || sizes[size].split(" ")[2];
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <button
      className={cn(
        "focus-visible:ring-brand inline-flex items-center justify-center gap-2 rounded shadow-xs transition-all hover:shadow-md focus-visible:ring-2 focus-visible:outline-none active:shadow-xs disabled:pointer-events-none disabled:opacity-40",
        variants[variant],
        className,
        fontSizeClass,
        fontWeightClass,
        fontFamilyClass,
      )}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="flex items-center">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </button>
  );
}
