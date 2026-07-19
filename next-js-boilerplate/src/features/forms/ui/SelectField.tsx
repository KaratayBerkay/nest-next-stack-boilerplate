"use client";

import { useFieldContext } from "@/lib/forms/form-context";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import type { SelectFieldProps } from "@/types/forms/SelectField-types";

export function SelectField({ label, required, placeholder, options }: SelectFieldProps) {
  const field = useFieldContext<string>();
  return (
    <div className="flex flex-col gap-1">
      {label && <Label htmlFor={field.name} required={required}>{label}</Label>}
      <NativeSelect
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </NativeSelect>
      <FormFieldInfo field={field} />
    </div>
  );
}
