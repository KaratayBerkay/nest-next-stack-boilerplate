"use client";

import { cn } from "@/lib/cn";
import { useSelect } from "./select";

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
  const { value, labelMap } = useSelect();
  const displayText = value ? labelMap.current.get(value) : undefined;

  return (
    <span className={cn("truncate", !displayText && "text-muted", className)}>
      {displayText ?? placeholder ?? ""}
    </span>
  );
}
