"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { AutoResizeTextareaProps } from "@/types/ui/AutoResizeTextarea-types";

export function AutoResizeTextarea({
  className,
  error,
  maxHeight = 200,
  value,
  ...props
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [internalValue, setInternalValue] = useState("");

  const currentValue = value ?? internalValue;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [currentValue, maxHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (value === undefined) {
      setInternalValue(e.target.value);
    }
    props.onChange?.(e);
  };

  return (
    <textarea
      ref={textareaRef}
      className={cn(
        "border-border placeholder:text-muted focus-visible:ring-brand min-h-20 w-full resize-none rounded border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-error focus-visible:ring-error",
        className,
      )}
      aria-invalid={!!error}
      value={currentValue}
      onChange={handleChange}
      {...props}
    />
  );
}
