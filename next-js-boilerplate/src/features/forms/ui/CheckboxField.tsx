"use client";

import { useFieldContext } from "@/lib/forms/form-context";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import type { CheckboxFieldProps } from "@/types/forms/CheckboxField-types";

export function CheckboxField({ label, required, options }: CheckboxFieldProps) {
  const field = useFieldContext<string[]>();
  const values = field.state.value ?? [];
  return (
    <div className="flex flex-col gap-1">
      {label && <Label required={required}>{label}</Label>}
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={values.includes(opt.value)}
              onChange={() => {
                if (values.includes(opt.value)) {
                  field.handleChange(values.filter((v) => v !== opt.value));
                } else {
                  field.handleChange([...values, opt.value]);
                }
              }}
            />
            {opt.label}
          </label>
        ))}
      </div>
      <FormFieldInfo field={field} />
    </div>
  );
}
