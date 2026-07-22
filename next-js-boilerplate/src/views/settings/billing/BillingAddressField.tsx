"use client";

import { cn } from "@/lib/cn";

interface BillingAddressFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  spanCol2?: boolean;
}

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
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}
