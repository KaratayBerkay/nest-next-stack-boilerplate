"use client";

import { useFieldContext } from "@/lib/forms/form-context";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import type { TextFieldProps } from "@/types/forms/TextField-types";

export function TextField({ label, required }: TextFieldProps) {
  const field = useFieldContext<string>();
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Label htmlFor={field.name} required={required}>
          {label}
        </Label>
      )}
      <Input
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FormFieldInfo field={field} />
    </div>
  );
}
