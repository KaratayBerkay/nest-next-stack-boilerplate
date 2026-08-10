import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldInfo } from "./FieldInfo";
import type { FormInputFieldProps } from "@/types/views/ui/CardDemo-types";

export function FormInputField({
  field,
  label,
  type = "text",
  placeholder,
  autoComplete,
  error,
}: FormInputFieldProps) {
  return (
    <div>
      <Label htmlFor={field.name}>{label}</Label>
      <div className="mt-2">
        <Input
          id={field.name}
          name={field.name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          error={error}
        />
      </div>
      <FieldInfo field={field} />
    </div>
  );
}
