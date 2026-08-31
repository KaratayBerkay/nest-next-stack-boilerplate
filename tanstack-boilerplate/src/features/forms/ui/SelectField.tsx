"use client";

import { useFieldContext } from "@/lib/forms/form-context";
import { Dropdown } from "@/components/ui/Dropdown";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import type { SelectFieldProps } from "@/types/forms/SelectField-types";

export function SelectField({
  label,
  required,
  placeholder,
  options,
}: SelectFieldProps) {
  const field = useFieldContext<string>();
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Label htmlFor={field.name} required={required}>
          {label}
        </Label>
      )}
      <Dropdown
        id={field.name}
        options={options}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(value) => field.handleChange(value)}
        placeholder={placeholder}
      />
      <FormFieldInfo field={field} />
    </div>
  );
}
