"use client";

import { useState } from "react";
import { useFieldContext } from "@/lib/forms/form-context";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import type { TextFieldProps } from "@/types/forms/TextField-types";

export function TextField({
  label,
  required,
  hint,
  type,
  showPasswordToggle,
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password" && showPasswordToggle;
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Label htmlFor={field.name} required={required}>
          {label}
        </Label>
      )}
      <Input
        id={field.name}
        type={inputType}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        required={required}
        aria-required={required}
        rightIcon={
          isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setVisible((v) => !v)}
              className="text-muted hover:text-fg"
              aria-label={visible ? "Hide password" : "Show password"}
            >
              {visible ? (
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
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
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
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          ) : undefined
        }
      />
      <FormFieldInfo field={field} hint={hint} />
    </div>
  );
}
