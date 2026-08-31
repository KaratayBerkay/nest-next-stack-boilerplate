"use client";

import { useFieldContext } from "@/lib/forms/form-context";
import { DatePicker } from "@/components/ui/DatePicker";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import type { DateFieldProps } from "@/types/forms/DateField-types";

export function DateField({ label, required, placeholder }: DateFieldProps) {
  const field = useFieldContext<Date | undefined>();
  return (
    <div className="flex flex-col gap-1">
      {label && <Label required={required}>{label}</Label>}
      <DatePicker
        value={field.state.value}
        onChange={(date) => field.handleChange(date)}
        placeholder={placeholder}
      />
      <FormFieldInfo field={field} />
    </div>
  );
}
