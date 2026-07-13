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
import type { ComboboxProps, ComboboxVariant } from "@/types/ui/Combobox-types";

const variants: Record<ComboboxVariant, string> = {
  default: "border-border bg-bg text-fg",
  shiny: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-lg shadow-blue-500/20",
  glass: "bg-white/20 backdrop-blur-md text-white border-white/20 shadow-md",
  neon: "bg-slate-950 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
  gradient: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text border-transparent",
};

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
          variants.default,
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
