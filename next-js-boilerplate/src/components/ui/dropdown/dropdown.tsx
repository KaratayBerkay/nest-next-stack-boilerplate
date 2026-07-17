"use client";

import { cn } from "@/lib/cn";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import type { DropdownProps } from "@/types/ui/Dropdown-types";

/**
 * Options-driven value picker: a Select with the compound wiring folded in.
 * The list renders themed (unlike a native `<select>`, whose OS-drawn options
 * ignore the app theme), so trigger and panel always match.
 */
export function Dropdown({
  options,
  value,
  onChange,
  placeholder,
  className,
  variant,
  size,
  disabled,
  name,
  error,
  description,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className={className}>
      <Select value={value} onValueChange={(v) => onChange?.(v)} name={name}>
        <SelectTrigger
          variant={variant}
          size={size}
          disabled={disabled}
          aria-label={ariaLabel}
          error={error}
          description={description}
        >
          <span className={cn("truncate", !selected && "text-muted")}>
            {selected?.label ?? placeholder ?? ""}
          </span>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
