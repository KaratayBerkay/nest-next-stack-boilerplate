"use client";

import { useFieldContext } from "@/lib/forms/form-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import type { RadioGroupFieldProps } from "@/types/forms/RadioGroupField-types";

export function RadioGroupField({
  label,
  required,
  options,
}: RadioGroupFieldProps) {
  const field = useFieldContext<string>();
  return (
    <div className="flex flex-col gap-1">
      {label && <Label required={required}>{label}</Label>}
      <RadioGroup
        value={field.state.value}
        onValueChange={(val) => field.handleChange(val)}
      >
        {options.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            <RadioGroupItem
              value={opt.value}
              id={`${field.name}-${opt.value}`}
            />
            <Label htmlFor={`${field.name}-${opt.value}`}>
              {opt.label}
              {opt.description && (
                <span className="text-muted ml-1 text-xs">
                  — {opt.description}
                </span>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <FormFieldInfo field={field} />
    </div>
  );
}
