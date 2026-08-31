import { Label } from "@/components/ui/Label";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { cn } from "@/lib/cn";
import type { SettingsSelectProps } from "@/types/views/settings/SettingsSelect-types";

export function SettingsSelect({
  label,
  value,
  onChange,
  options,
  className,
}: SettingsSelectProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label>{label}</Label>
      <NativeSelect value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
