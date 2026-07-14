"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import type { CheckboxCardProps } from "@/types/ui/Checkbox-types";

export function CheckboxCard({
  icon,
  title,
  description,
  checked,
  onChange,
  className,
}: CheckboxCardProps) {
  const autoId = useId();

  return (
    <label
      htmlFor={autoId}
      className={cn(
        "focus-within:ring-brand relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors focus-within:ring-2 focus-within:outline-none",
        checked
          ? "border-brand bg-brand/5"
          : "border-border bg-surface hover:bg-surface-hover",
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
      <div className="flex-1 space-y-1">
        <div className="text-sm font-medium text-fg">{title}</div>
        {description && (
          <div className="text-muted text-xs">{description}</div>
        )}
      </div>
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors",
          checked
            ? "border-brand bg-brand"
            : "border-border bg-bg",
        )}
        aria-hidden="true"
      >
        {checked && (
          <svg
            className="size-2.5 text-brand-fg"
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
