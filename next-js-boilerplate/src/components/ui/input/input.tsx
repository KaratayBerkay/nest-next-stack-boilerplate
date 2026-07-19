"use client";

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
import { fontClasses } from "@/lib/font-classes";
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
  const fonts = fontClasses(
    { fontSize, fontWeight, fontFamily },
    { fontSize: sizeClass.split(" ")[1], fontWeight: "font-normal" },
  );

  const errorStr = typeof error === "string" ? error : undefined;
  const { describedBy, messages } = useFieldMessages(errorStr, description);

  const leftPadding = leftIcon ? "pl-9" : undefined;
  const rightPadding = rightIcon ? "pr-9" : undefined;

  return (
    <div className="flex flex-col gap-1">
      <div className="relative flex w-full items-center">
        {leftIcon && (
          <div className="text-muted absolute left-3">{leftIcon}</div>
        )}
        <input
          className={cn(
            inputBaseClasses,
            variantClass,
            error && inputErrorClasses,
            fonts,
            leftPadding,
            rightPadding,
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...props}
        />
        {rightIcon && (
          <div className="text-muted absolute right-3">{rightIcon}</div>
        )}
      </div>
      {messages}
    </div>
  );
}
