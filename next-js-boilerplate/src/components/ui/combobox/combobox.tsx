"use client";
import { useState } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/Command";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { fontClasses } from "@/lib/font-classes";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { useFieldMessages } from "@/components/ui/field-messages";
import type { ComboboxProps } from "@/types/ui/Combobox-types";

const variants = {
  ...globalStyleVariants,
  default: "border-border bg-bg text-fg",
};

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Search...",
  variant,
  className,
  fontSize,
  fontWeight,
  fontFamily,
  error,
  description,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const effectiveVariant = useComponentVariant(variant);
  const { describedBy, messages } = useFieldMessages(error, description);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded border px-3 py-1 text-sm shadow-sm",
          resolveVariant(variants, effectiveVariant),
        )}
        aria-describedby={describedBy}
      >
        <span className={cn("truncate", fontClasses({ fontSize, fontWeight, fontFamily }))}>
          {value ? options.find((o) => o.value === value)?.label : placeholder}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="ml-2 opacity-50"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {messages}
      {open && (
        <div className="bg-bg border-border absolute z-50 mt-1 w-full rounded-md border p-1 shadow-md">
          <Command>
            <CommandInput
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup>
                {options
                  .filter((o) =>
                    o.label.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={opt.value}
                      onSelect={() => {
                        onValueChange?.(opt.value);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <span className={cn(fontClasses({ fontSize, fontWeight, fontFamily }))}>{opt.label}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
