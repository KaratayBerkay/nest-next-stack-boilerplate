"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { inputBaseClasses, inputErrorClasses } from "@/components/ui/input-styles";

interface FileInputProps extends Omit<React.ComponentPropsWithoutRef<"input">, "type" | "value"> {
  error?: string;
  buttonLabel?: string;
}

export function FileInput({
  error,
  buttonLabel = "Choose file",
  className,
  onChange,
  ...props
}: FileInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file?.name ?? null);
    onChange?.(e);
  };

  const handleClear = () => {
    if (ref.current) {
      ref.current.value = "";
    }
    setFileName(null);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={ref}
        type="file"
        className="hidden"
        onChange={handleChange}
        {...props}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={cn(
          inputBaseClasses,
          "inline-flex w-auto cursor-pointer items-center gap-2 px-3",
          error && inputErrorClasses,
          className,
        )}
        aria-invalid={!!error}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {buttonLabel}
      </button>
      {fileName && (
        <span className="text-muted flex items-center gap-1 truncate text-sm">
          <span className="truncate">{fileName}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-muted hover:text-fg shrink-0"
            aria-label="Remove file"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </span>
      )}
    </div>
  );
}
