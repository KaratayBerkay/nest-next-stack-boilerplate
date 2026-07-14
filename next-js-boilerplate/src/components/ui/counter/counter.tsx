"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { CounterProps } from "@/types/ui/Counter-types";

const counterVariants = {
  ...globalStyleVariants,
  default: "border-border",
};

export function Counter({
  label,
  min = 0,
  max = 99,
  step = 1,
  value: controlledValue,
  onChange,
  variant,
  className,
}: CounterProps) {
  const effectiveVariant = useComponentVariant(variant);
  const [internalValue, setInternalValue] = useState(0);
  const value = controlledValue ?? internalValue;

  const setValue = (v: number) => {
    const clamped = Math.min(max, Math.max(min, v));
    if (controlledValue !== undefined) {
      onChange?.(clamped);
    } else {
      setInternalValue(clamped);
    }
  };

  return (
    <div className={cn("inline-flex h-9 items-stretch rounded-md border divide-x", resolveVariant(counterVariants, effectiveVariant), className)}>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => setValue(value - step)}
        className="inline-flex items-center justify-center rounded-l-md px-2.5 text-muted transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M5 12h14" />
        </svg>
      </button>
      <span className="inline-flex min-w-10 items-center justify-center bg-surface/50 px-2 text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => setValue(value + step)}
        className="inline-flex items-center justify-center rounded-r-md px-2.5 text-muted transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}
