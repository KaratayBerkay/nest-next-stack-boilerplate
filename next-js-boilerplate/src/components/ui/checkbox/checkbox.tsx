"use client";

import { useId, useRef } from "react";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { fontClasses } from "@/lib/font-classes";
import type { CheckboxProps, CheckboxVariant, CheckboxSize } from "@/types/ui/Checkbox-types";

const checkVariants: Record<CheckboxVariant, string> = {
  ...globalStyleVariants,
  default: "border-border checked:bg-brand checked:border-brand",
};

const sizeMap: Record<CheckboxSize, string> = {
  sm: "size-4 rounded-[4px]",
  md: "size-[18px] rounded-[5px]",
  lg: "size-5 rounded-[5px]",
};

const iconSizeMap: Record<CheckboxSize, string> = {
  sm: "size-2.5",
  md: "size-3",
  lg: "size-3.5",
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn(className, "text-brand-fg")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function Checkbox({
  className,
  id,
  label,
  variant,
  fontSize,
  fontWeight,
  fontFamily,
  size = "md",
  checked,
  ...props
}: CheckboxProps) {
  const effectiveVariant = useComponentVariant(variant);
  const autoId = useId();
  const generatedId = id ?? autoId;
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="inline-flex items-center gap-2 has-[:disabled]:opacity-50 has-[:disabled]:cursor-not-allowed">
      <span className="relative inline-flex shrink-0">
        <input
          ref={inputRef}
          type="checkbox"
          id={generatedId}
          checked={checked}
          className={cn(
            "peer appearance-none cursor-pointer border bg-bg focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            resolveVariant(checkVariants, effectiveVariant),
            sizeMap[size],
            className,
          )}
          {...props}
        />
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-120 ease-out motion-reduce:transition-none peer-checked:opacity-100"
          aria-hidden="true"
        >
          <CheckIcon className={iconSizeMap[size]} />
        </span>
      </span>
      {label && (
        <label
          htmlFor={generatedId}
          className={cn(
            "text-fg cursor-pointer",
            fonts,
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}
