"use client";

import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/Input";
import type { BillingAddressFieldProps } from "@/types/views/settings/BillingAddressField-types";

export function BillingAddressField({
  id,
  label,
  value,
  onChange,
  placeholder,
  spanCol2,
}: BillingAddressFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", spanCol2 && "sm:col-span-2")}>
      <label htmlFor={id} className="text-muted text-xs font-medium">
        {label}
      </label>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
