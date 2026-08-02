import type { AnyFieldApi } from "@tanstack/react-form";
import { Input } from "@/components/ui/Input";
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
      <label htmlFor={field.name} className="block text-sm font-medium">
        {label}
      </label>
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
