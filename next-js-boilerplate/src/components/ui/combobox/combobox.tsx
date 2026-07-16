"use client";
import { useCallback, useId, useRef, useState } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/Command";
import { Empty } from "@/components/ui/Empty";
import { cn } from "@/lib/cn";
import { resolveVariant } from "@/lib/resolve-variant";
import { fontClasses } from "@/lib/font-classes";
import { globalStyleVariants } from "@/components/ui/global-style-variants";
import { useComponentVariant } from "@/hooks/useComponentVariant";
import { useFieldMessages } from "@/components/ui/field-messages";
import { useClickOutside } from "@/hooks/useClickOutside";
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
  searchPlaceholder,
  emptyTitle = "No results",
  emptyDescription = "No items match your search.",
  disabled,
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
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }, []);

  useClickOutside(wrapperRef, close);

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", className)}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
        className={cn(
          "focus-visible:ring-brand flex h-9 w-full items-center justify-between rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          resolveVariant(variants, effectiveVariant),
        )}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
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
        <div className="bg-bg border-border absolute z-50 mt-1 w-full rounded-lg border p-1 shadow-lg">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder ?? placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <CommandList id={listId}>
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
                        close();
                      }}
                    >
                      <span className={cn(fontClasses({ fontSize, fontWeight, fontFamily }))}>{opt.label}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
              {options.filter((o) =>
                o.label.toLowerCase().includes(query.toLowerCase()),
              ).length === 0 && (
                <Empty
                  icon={
                    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                  title={emptyTitle}
                  description={emptyDescription}
                />
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
