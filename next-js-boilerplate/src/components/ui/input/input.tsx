import { cn } from "@/lib/cn";
import {
  inputBaseClasses,
  inputErrorClasses,
  inputVariants,
  inputSizes,
} from "@/components/ui/input-styles";
import type { InputProps } from "@/types/ui/Input-types";

export function Input({
  className,
  error,
  variant = "default",
  leftIcon,
  rightIcon,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: InputProps) {
  const variantClass = inputVariants[variant];
  const sizeClass = inputSizes.md;
  const fontSizeClass = fontSize || sizeClass.split(" ")[1];
  const fontWeightClass = fontWeight || "font-normal";
  const fontFamilyClass = fontFamily || "font-sans";

  const leftPadding = leftIcon ? "pl-9" : undefined;
  const rightPadding = rightIcon ? "pr-9" : undefined;

  return (
    <div className="relative flex items-center w-full">
      {leftIcon && (
        <div className="absolute left-3 text-muted">{leftIcon}</div>
      )}
      <input
        className={cn(
          inputBaseClasses,
          variantClass,
          error && inputErrorClasses,
          fontSizeClass,
          fontWeightClass,
          fontFamilyClass,
          leftPadding,
          rightPadding,
          className,
        )}
        aria-invalid={!!error}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 text-muted">{rightIcon}</div>
      )}
    </div>
  );
}
