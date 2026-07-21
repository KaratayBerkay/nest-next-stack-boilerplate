"use client";

import { useFieldContext } from "@/lib/forms/form-context";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import type { TextareaFieldProps } from "@/types/forms/TextareaField-types";

export function TextareaField({
  label,
  required,
  hint,
  maxLength,
}: TextareaFieldProps) {
  const field = useFieldContext<string>();
  const value = field.state.value ?? "";
  const charCount = value.length;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Label htmlFor={field.name} required={required}>
          {label}
        </Label>
      )}
      <Textarea
        id={field.name}
        value={value}
        onBlur={field.handleBlur}
        onChange={(e) => {
          if (maxLength && e.target.value.length > maxLength) return;
          field.handleChange(e.target.value);
        }}
        required={required}
        aria-required={required}
      />
      <div className="flex items-center justify-between gap-2">
        <FormFieldInfo field={field} hint={hint} />
        {maxLength && (
          <span className="text-muted ml-auto text-xs tabular-nums">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
