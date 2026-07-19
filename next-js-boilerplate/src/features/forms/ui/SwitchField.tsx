"use client";

import { useFieldContext } from "@/lib/forms/form-context";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import type { SwitchFieldProps } from "@/types/forms/SwitchField-types";

export function SwitchField({ label, required }: SwitchFieldProps) {
  const field = useFieldContext<boolean>();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Switch
          id={field.name}
          checked={field.state.value}
          onChange={() => field.handleChange(!field.state.value)}
        />
        {label && <Label htmlFor={field.name} required={required}>{label}</Label>}
      </div>
      <FormFieldInfo field={field} />
    </div>
  );
}
