"use client";

import { useId, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";
import { fontClasses } from "@/lib/font-classes";
import type { IndeterminateCheckboxProps, CheckboxSize } from "@/types/ui/Checkbox-types";

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

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn(className, "text-brand-fg")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

export function IndeterminateCheckbox({
  className,
  id,
  indeterminate = false,
  label,
  checked,
  fontSize,
  fontWeight,
  fontFamily,
  size = "md",
  ...props
}: IndeterminateCheckboxProps) {
  const autoId = useId();
  const generatedId = id ?? autoId;
  const ref = useRef<HTMLInputElement>(null);
  const fonts = fontClasses({ fontSize, fontWeight, fontFamily });

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const showCheck = checked && !indeterminate;
  const showMinus = indeterminate;

  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative inline-flex shrink-0">
        <input
          ref={ref}
          type="checkbox"
          id={generatedId}
          checked={checked}
          className={cn(
            "peer appearance-none cursor-pointer border bg-bg focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            "border-border checked:bg-brand checked:border-brand",
            sizeMap[size],
            className,
          )}
          {...props}
        />
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-120 ease-out motion-reduce:transition-none peer-checked:opacity-100"
          aria-hidden="true"
        >
          {showCheck && <CheckIcon className={iconSizeMap[size]} />}
          {showMinus && <MinusIcon className={iconSizeMap[size]} />}
        </span>
      </span>
      {label && (
        <label
          htmlFor={generatedId}
          className={cn(
            "text-fg cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            fonts,
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}
