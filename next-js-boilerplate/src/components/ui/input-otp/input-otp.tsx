"use client";
import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";
import type { InputOTPProps } from "@/types/ui/InputOTP-types";

export const InputOTP = forwardRef<HTMLInputElement, InputOTPProps>(
  ({ className, value, onChange, maxLength, ...props }, ref) => {
    const id = useId();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/[^0-9]/g, "").slice(0, maxLength);
      onChange(v);
    };
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={value}
          onChange={handleChange}
          className="sr-only"
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
                  "flex h-10 w-10 items-center justify-center rounded-md border text-sm shadow-sm transition-all",
                  "border-border",
                  isFocused && "ring-brand ring-2",
                  char && "border-brand",
                )}
                onClick={() => document.getElementById(id)?.focus()}
                aria-hidden="true"
              >
                {char || ""}
              </div>
            );
          })}
        </div>
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
