"use client";

import { useFieldContext } from "@/lib/forms/form-context";
import { TimeInput } from "@/components/ui/TimeInput";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import type { TimeFieldProps } from "@/types/forms/TimeField-types";

export function TimeField({ label, required }: TimeFieldProps) {
  const field = useFieldContext<{ hours: number; minutes: number; seconds?: number }>();
  return (
    <div className="flex flex-col gap-1">
      {label && <Label required={required}>{label}</Label>}
      <TimeInput
        value={field.state.value}
        onChange={(val) => field.handleChange(val)}
      />
      <FormFieldInfo field={field} />
    </div>
  );
}
