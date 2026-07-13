"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { CounterProps } from "@/types/ui/Counter-types";

export function Counter({ label, className }: CounterProps) {
  const [count, setCount] = useState(0);

  return (
    <button
      type="button"
      data-testid={`counter-${label}`}
      onClick={() => setCount((c) => c + 1)}
      className={cn(
        "underline",
        "text-brand",
        className,
      )}
    >
      {label}: clicked {count} times
    </button>
  );
}
