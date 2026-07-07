"use client";

import { cn } from "@/lib/cn";
import { useCommandContext } from "./command";

export function CommandInput({
  className,
  value: externalValue,
  onChange: externalOnChange,
  ...props
}: React.ComponentPropsWithoutRef<"input">) {
  const { search, setSearch } = useCommandContext();

  const currentValue = externalValue ?? search;
  const handleChange = externalOnChange ?? ((e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value));

  return (
    <div className="border-border flex items-center border-b px-3">
      <svg
        className="text-muted mr-2 size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        className={cn(
          "placeholder:text-muted flex h-11 w-full bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        value={currentValue}
        onChange={handleChange}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        {...props}
      />
    </div>
  );
}
