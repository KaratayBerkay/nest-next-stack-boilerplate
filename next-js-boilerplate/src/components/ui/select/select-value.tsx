"use client";

import { cn } from "@/lib/cn";
import { useSelect } from "./select";
import type { SelectValueProps } from "@/types/ui/Select-types";

export function SelectValue({ placeholder, className }: SelectValueProps) {
  const { value, labelMap, variant } = useSelect();
  const displayText = value ? labelMap.current.get(value) : undefined;

  const variants: Record<string, string> = {
    default: "",
    shiny: "text-white",
    glass: "text-white",
    neon: "text-cyan-400",
    gradient: "text-transparent bg-clip-text",
  };

  return (
    <span
      className={cn(
        "truncate",
        !displayText && "text-muted",
        variants[variant || "default"],
        className,
      )}
    >
      {displayText ?? placeholder ?? ""}
    </span>
  );
}
