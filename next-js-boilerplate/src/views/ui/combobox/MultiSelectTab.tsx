import { useState, useCallback, useMemo } from "react";
import { CheckboxChip } from "@/components/ui/Checkbox";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/Command";
import { toggleItem } from "./helpers";
import { multiData } from "./data";

export function MultiSelectTab() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(
    () =>
      multiData.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  const handleSelect = useCallback((itemValue: string) => {
    setSelected((prev) => toggleItem(prev, itemValue));
  }, []);

  const handleRemove = useCallback((val: string) => {
    setSelected((prev) => prev.filter((v) => v !== val));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Multi Select</h3>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selected.map((val) => {
              const item = multiData.find((i) => i.value === val);
              if (!item) return null;
              return (
                <CheckboxChip
                  key={val}
                  label={item.label}
                  checked
                  onRemove={() => handleRemove(val)}
                />
              );
            })}
          </div>
        )}
        <div className="relative max-w-sm">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="focus-visible:ring-brand flex h-9 w-full items-center justify-between rounded-md border border-border bg-bg px-3 py-1 text-sm text-fg shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <span className="truncate">
              {selected.length > 0
                ? `${selected.length} selected`
                : "Select frameworks..."}
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
            <div className="bg-bg border-border absolute z-50 mt-1 w-full rounded-lg border p-1 shadow-lg">
              <Command>
                <CommandInput
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <CommandList>
                  {filtered.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={() => handleSelect(item.value)}
                    >
                      <span className="mr-2">
                        {selected.includes(item.value) ? "✓" : ""}
                      </span>
                      {item.label}
                    </CommandItem>
                  ))}
                  {filtered.length === 0 && (
                    <div className="py-6 text-center text-sm text-muted">
                      No results
                    </div>
                  )}
                </CommandList>
              </Command>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
