"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import type { CheckboxProps } from "@/types/ui/Checkbox-types";

export function Checkbox({ className, id, label, ...props }: CheckboxProps) {
  const autoId = useId();
  const generatedId = id ?? autoId;

  return (
    <div className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        id={generatedId}
        className={cn(
          "peer border-border bg-bg checked:border-brand checked:bg-brand focus-visible:ring-brand size-4 shrink-0 cursor-pointer appearance-none rounded border focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      {label && (
        <label
          htmlFor={generatedId}
          className="text-muted cursor-pointer text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
        >
          {label}
        </label>
      )}
    </div>
  );
}
