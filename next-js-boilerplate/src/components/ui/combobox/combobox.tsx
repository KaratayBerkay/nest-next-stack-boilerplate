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
import type { ComboboxProps } from "@/types/ui/Combobox-types";

const defaultStyles = "border-border bg-bg text-fg";

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Search...",
  className,
  fontSize,
  fontWeight,
  fontFamily,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const fontSizeClass = fontSize || "text-sm";
  const fontWeightClass = fontWeight || "font-medium";
  const fontFamilyClass = fontFamily || "font-sans";

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded border px-3 py-1 text-sm shadow-sm",
          defaultStyles,
          className,
        )}
      >
        <span className={cn("truncate", fontSizeClass, fontWeightClass, fontFamilyClass)}>
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
                      <span className={cn(fontSizeClass, fontWeightClass, fontFamilyClass)}>{opt.label}</span>
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
