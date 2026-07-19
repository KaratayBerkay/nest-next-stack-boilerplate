"use client";

import { useFieldContext } from "@/lib/forms/form-context";
import { Combobox } from "@/components/ui/Combobox";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import type { ComboboxFieldProps } from "@/types/forms/ComboboxField-types";

export function ComboboxField({
  label,
  required,
  placeholder,
  options,
  multiple,
}: ComboboxFieldProps) {
  const field = useFieldContext<string | string[]>();
  return (
    <div className="flex flex-col gap-1">
      {label && <Label required={required}>{label}</Label>}
      <Combobox
        value={field.state.value}
        onValueChange={(val) => field.handleChange(val)}
        placeholder={placeholder}
        options={options.map((o) => ({ value: o.value, label: o.label }))}
        multiple={multiple}
      />
      <FormFieldInfo field={field} />
    </div>
  );
}
