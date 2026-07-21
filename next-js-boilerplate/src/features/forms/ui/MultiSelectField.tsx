"use client";

import { useFieldContext } from "@/lib/forms/form-context";
import { Label } from "@/components/ui/Label";
import { FormFieldInfo } from "@/components/ui/FormFieldInfo";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/cn";
import type { MultiSelectFieldProps } from "@/types/forms/MultiSelectField-types";

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="bg-muted/20 text-muted inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-fg ml-0.5 leading-none"
        aria-label={`Remove ${label}`}
      >
        &times;
      </button>
    </span>
  );
}

export function MultiSelectField({
  label,
  required,
  placeholder = "Select options...",
  options,
}: MultiSelectFieldProps) {
  const field = useFieldContext<string[]>();
  const values = field.state.value ?? [];

  function toggleValue(val: string) {
    if (values.includes(val)) {
      field.handleChange(values.filter((v) => v !== val));
    } else {
      field.handleChange([...values, val]);
    }
  }

  const selectedLabels = values
    .map((v) => options.find((o) => o.value === v)?.label ?? v)
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Label htmlFor={field.name} required={required}>
          {label}
        </Label>
      )}
      <Popover>
        <PopoverTrigger
          asChild
          className={cn(
            "border-border focus-visible:ring-border flex min-h-[2.25rem] w-full flex-wrap items-center gap-1 rounded-md border bg-transparent px-3 py-1.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
            values.length === 0 && "text-muted/70",
          )}
        >
          <button type="button" id={field.name}>
            {selectedLabels.length > 0
              ? selectedLabels.map((l, i) => (
                  <Chip
                    key={`${l}-${i}`}
                    label={l}
                    onRemove={() => toggleValue(values[i])}
                  />
                ))
              : placeholder}
            <span className="ml-auto shrink-0 opacity-50">&#9662;</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="min-w-[12rem] p-2">
          <div className="flex flex-col gap-1">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="hover:bg-muted/10 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm"
              >
                <Checkbox
                  checked={values.includes(opt.value)}
                  onChange={() => toggleValue(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <FormFieldInfo field={field} />
    </div>
  );
}
