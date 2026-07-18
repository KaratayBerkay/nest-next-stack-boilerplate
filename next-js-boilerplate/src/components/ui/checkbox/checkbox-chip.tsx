"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { CheckboxChipProps } from "@/types/ui/Checkbox-types";

const checkboxChipVariants = {
  ...globalStyleVariants,
  default:
    "bg-surface text-muted border-border hover:bg-surface-hover hover:text-fg",
};

export function CheckboxChip({
  label,
  checked,
  onChange,
  count,
  onRemove,
  variant,
  className,
}: CheckboxChipProps) {
  const effectiveVariant = useComponentVariant(variant);
  const autoId = useId();

  return (
    <label
      htmlFor={autoId}
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
        checked
          ? "bg-brand text-brand-fg border-brand"
          : resolveVariant(checkboxChipVariants, effectiveVariant),
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
      {checked && (
        <svg
          className="-ml-0.5 size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "ml-0.5 tabular-nums",
            checked ? "text-brand-fg/80" : "text-muted",
          )}
        >
          {count}
        </span>
      )}
      {checked && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 inline-flex items-center justify-center rounded-full p-1 hover:bg-brand-fg/20"
          aria-label={`Remove ${label}`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </label>
  );
}
