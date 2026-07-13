"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import type { CounterProps } from "@/types/ui/Counter-types";

const variants: Record<"default" | "shiny" | "glass" | "neon" | "gradient", string> = {
  default: "text-brand",
  shiny: "text-white",
  glass: "text-white",
  neon: "text-cyan-400",
  gradient: "text-transparent bg-clip-text",
};

export function Counter({ label, variant, className }: CounterProps) {
  const effectiveVariant = useComponentVariant(variant);
  const [count, setCount] = useState(0);
  const variantClass = variants[effectiveVariant as keyof typeof variants];

  return (
    <button
      type="button"
      data-testid={`counter-${label}`}
      onClick={() => setCount((c) => c + 1)}
      className={cn(
        "underline",
        variantClass,
        className,
      )}
    >
      {label}: clicked {count} times
    </button>
  );
}
