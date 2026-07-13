import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import {
  inputBaseClasses,
  inputErrorClasses,
  inputVariants,
  inputSizes,
} from "@/components/ui/input-styles";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { useFieldMessages } from "@/components/ui/field-messages";
import type { InputProps } from "@/types/ui/Input-types";

export function Input({
  className,
  error,
  description,
  variant,
  leftIcon,
  rightIcon,
  fontSize,
  fontWeight,
  fontFamily,
  ...props
}: InputProps) {
  const effectiveVariant = useComponentVariant(variant);
  const variantClass = resolveVariant(inputVariants, effectiveVariant);
  const sizeClass = inputSizes.md;
  const fontSizeClass = fontSize || sizeClass.split(" ")[1];
  const fontWeightClass = fontWeight || "font-normal";
  const fontFamilyClass = fontFamily || "font-sans";

  const errorStr = typeof error === "string" ? error : undefined;
  const { describedBy, messages } = useFieldMessages(errorStr, description);

  const leftPadding = leftIcon ? "pl-9" : undefined;
  const rightPadding = rightIcon ? "pr-9" : undefined;

  return (
    <div className="flex flex-col gap-1">
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
          aria-describedby={describedBy}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-muted">{rightIcon}</div>
        )}
      </div>
      {messages}
    </div>
  );
}
