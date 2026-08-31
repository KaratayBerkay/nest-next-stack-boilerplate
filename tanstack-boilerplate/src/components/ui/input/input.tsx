"use client";

import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
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
  ref,
  type,
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

  // Every password field gets a reveal toggle from here rather than each form
  // wiring its own — a caller-supplied rightIcon still wins if one is passed.
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (visible ? "text" : "password") : type;
  const resolvedRightIcon =
    rightIcon ??
    (isPassword ? (
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="text-muted hover:text-fg"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
      </button>
    ) : undefined);

  const leftPadding = leftIcon ? "pl-9" : undefined;
  const rightPadding = resolvedRightIcon ? "pr-9" : undefined;

  return (
    <div className="flex flex-col gap-1">
      <div className="relative flex w-full items-center">
        {leftIcon && (
          <div className="text-muted absolute left-3">{leftIcon}</div>
        )}
        <input
          ref={ref}
          type={resolvedType}
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
        {resolvedRightIcon && (
          <div className="text-muted absolute right-3">{resolvedRightIcon}</div>
        )}
      </div>
      {messages}
    </div>
  );
}
