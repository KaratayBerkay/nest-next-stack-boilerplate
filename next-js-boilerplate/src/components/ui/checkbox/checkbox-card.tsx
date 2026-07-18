"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { CheckboxCardProps } from "@/types/ui/Checkbox-types";

const checkboxCardVariants = {
  ...globalStyleVariants,
  default: "border-border bg-surface hover:bg-surface-hover",
};

export function CheckboxCard({
  icon,
  title,
  description,
  checked,
  onChange,
  variant,
  className,
}: CheckboxCardProps) {
  const effectiveVariant = useComponentVariant(variant);
  const autoId = useId();

  return (
    <label
      htmlFor={autoId}
      className={cn(
        "focus-within:ring-brand relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all focus-within:ring-2 focus-within:ring-inset focus-within:outline-none",
        checked
          ? "border-brand bg-brand/5 ring-1 ring-brand ring-inset shadow-sm"
          : resolveVariant(checkboxCardVariants, effectiveVariant),
        className,
      )}
    >
      <input
        id={autoId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="sr-only"
      />
      {icon && (
        <div className="text-muted shrink-0">{icon}</div>
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="text-sm font-medium text-fg">{title}</div>
        {description && (
          <div className="text-muted text-xs">{description}</div>
        )}
      </div>
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
          checked
            ? "border-brand bg-brand"
            : "border-border bg-bg",
        )}
        aria-hidden="true"
      >
        {checked && (
          <svg
            className="size-3 text-brand-fg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </span>
    </label>
  );
}
