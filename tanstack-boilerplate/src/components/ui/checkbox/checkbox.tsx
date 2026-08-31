"use client";

import { useId, useRef } from "react";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { fontClasses } from "@/lib/font-classes";
import type {
  CheckboxProps,
  CheckboxVariant,
  CheckboxSize,
} from "@/types/ui/Checkbox-types";
import type { ClassNameProps } from "@/types/ui/ClassName-types";

// Global styles carry no checked: state, so each variant appends one —
// otherwise clicking gives no visual feedback (white check on light bg).
const checkVariants: Record<CheckboxVariant, string> = {
  shiny: cn(
    globalStyleVariants.shiny,
    "checked:from-brand checked:to-brand checked:border-brand",
  ),
  glass: cn(
    globalStyleVariants.glass,
    "checked:bg-brand/80 checked:border-brand",
  ),
  neon: cn(
    globalStyleVariants.neon,
    "checked:bg-info checked:shadow-[0_0_16px_var(--info)]",
  ),
  gradient:
    "border-border bg-bg checked:border-transparent checked:bg-gradient-to-r checked:from-brand checked:to-info",
  default:
    "border-border hover:border-brand/60 checked:bg-brand checked:border-brand",
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

function CheckIcon({ className }: ClassNameProps) {
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
    <div className="inline-flex items-center gap-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
      <span className="relative inline-flex shrink-0">
        <input
          ref={inputRef}
          type="checkbox"
          id={generatedId}
          checked={checked}
          className={cn(
            "peer bg-bg focus-visible:ring-brand cursor-pointer appearance-none border transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed",
            resolveVariant(checkVariants, effectiveVariant),
            sizeMap[size],
            className,
          )}
          {...props}
        />
        <span
          className="pointer-events-none absolute inset-0 flex scale-50 items-center justify-center opacity-0 transition-[opacity,transform] duration-150 ease-out peer-checked:scale-100 peer-checked:opacity-100 motion-reduce:transition-none"
          aria-hidden="true"
        >
          <CheckIcon className={iconSizeMap[size]} />
        </span>
      </span>
      {label && (
        <label
          htmlFor={generatedId}
          className={cn("text-fg cursor-pointer", fonts)}
        >
          {label}
        </label>
      )}
    </div>
  );
}
