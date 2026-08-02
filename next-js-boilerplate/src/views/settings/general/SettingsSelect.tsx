import { Label } from "@/components/ui/Label";
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-border bg-bg rounded-lg border px-3 py-2 text-sm"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
