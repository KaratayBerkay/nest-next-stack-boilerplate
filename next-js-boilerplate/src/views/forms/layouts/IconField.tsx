import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { FieldInfoButton } from "@/components/ui/FieldInfoButton";
import type { IconFieldProps } from "@/types/views/forms/IconField-types";

export function IconField({
  field,
  label,
  info,
  placeholder,
  leftIcon,
  type,
}: IconFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <Label htmlFor={field.name}>{label}</Label>
        <FieldInfoButton description={info} />
      </div>
      <Input
        id={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        leftIcon={leftIcon}
      />
    </div>
  );
}
