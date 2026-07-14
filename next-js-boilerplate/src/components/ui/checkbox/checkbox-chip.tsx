"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import type { CheckboxChipProps } from "@/types/ui/Checkbox-types";

export function CheckboxChip({
  label,
  checked,
  onChange,
  count,
  onRemove,
  className,
}: CheckboxChipProps) {
  const autoId = useId();

  return (
    <label
      htmlFor={autoId}
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        checked
          ? "bg-brand text-brand-fg"
          : "bg-surface text-muted hover:bg-surface-hover",
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
          className="ml-0.5 inline-flex items-center justify-center rounded-full p-0.5 hover:bg-brand/20"
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
