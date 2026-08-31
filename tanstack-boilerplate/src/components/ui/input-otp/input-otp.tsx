"use client";
import { forwardRef, useId, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import { useFieldMessages } from "@/components/ui/field-messages";
import type { InputOTPProps } from "@/types/ui/InputOTP-types";

export const InputOTP = forwardRef<HTMLInputElement, InputOTPProps>(
  (
    {
      className,
      value,
      onChange,
      maxLength,
      error,
      description,
      autoFocus,
      ...props
    },
    ref,
  ) => {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const { describedBy, messages } = useFieldMessages(error, description);

    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [autoFocus]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/[^0-9]/g, "").slice(0, maxLength);
      onChange(v);
    };

    const focusInput = useCallback(() => {
      inputRef.current?.focus();
    }, []);

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={value}
          onChange={handleChange}
          className="sr-only"
          aria-label="One-time code"
          aria-describedby={describedBy}
          {...props}
        />
        {/* Purely visual digit boxes — the real (sr-only) input above stays keyboard/screen-reader
          focusable and holds the actual value, so this whole row is decorative; clicking a box
          just refocuses that input for mouse/touch users. */}
        <div className="flex items-center gap-2" aria-hidden="true">
          {Array.from({ length: maxLength }).map((_, i) => {
            const char = value[i] ?? "";
            const isFocused = i === value.length;
            return (
              <div
                key={i}
                className={cn(
                  "flex h-10 w-9 items-center justify-center rounded-md border text-sm shadow-sm transition-all",
                  "border-border bg-surface/50",
                  isFocused && "border-brand ring-brand/40 z-10 ring-2",
                  char && "border-brand",
                )}
                onClick={focusInput}
                aria-hidden="true"
              >
                {isFocused && !char ? (
                  <span className="animate-caret-blink bg-brand h-4 w-0.5 rounded motion-reduce:animate-none" />
                ) : (
                  char || ""
                )}
              </div>
            );
          })}
        </div>
        {messages}
      </div>
    );
  },
);
InputOTP.displayName = "InputOTP";

export function InputOTPGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex items-center", className)} {...props} />;
}
