"use client";

import { useFieldContext } from "@/lib/forms/form-context";
import { Combobox } from "@/components/ui/Combobox";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import type { ComboboxFieldProps } from "@/types/forms/ComboboxField-types";

export function ComboboxField({ label, required, placeholder, options }: ComboboxFieldProps) {
  const field = useFieldContext<string>();
  return (
    <div className="flex flex-col gap-1">
      {label && <Label required={required}>{label}</Label>}
      <Combobox
        value={field.state.value}
        onValueChange={(val) => field.handleChange(val)}
        placeholder={placeholder}
        options={options.map((o) => ({ value: o.value, label: o.label }))}
      />
      <FormFieldInfo field={field} />
    </div>
  );
}
