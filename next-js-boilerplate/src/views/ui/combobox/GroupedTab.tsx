import { useState, useCallback, useMemo } from "react";
import { getLabel, getAllItems, renderGroupedItems } from "./helpers";
import { groupedData } from "./data";
import { Command, CommandInput, CommandList } from "@/components/ui/Command";

export function GroupedTab() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [value, setValue] = useState("");

  const allItems = useMemo(() => getAllItems(groupedData), []);
  const selectedLabel = value ? getLabel(value, allItems) : "";

  const handleSelect = useCallback((itemValue: string) => {
    setValue(itemValue);
    setOpen(false);
    setQuery("");
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Grouped Options</h3>
        <div className="relative max-w-sm">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="focus-visible:ring-brand flex h-9 w-full items-center justify-between rounded-md border border-border bg-bg px-3 py-1 text-sm text-fg shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <span className="truncate">
              {selectedLabel || "Choose a food item..."}
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
                  placeholder="Search foods..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <CommandList>
                  {renderGroupedItems(groupedData, query, handleSelect)}
                </CommandList>
              </Command>
            </div>
          )}
        </div>
        {value && (
          <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
            <span className="text-sm">
              Selected: <strong>{selectedLabel}</strong>
            </span>
            <button
              type="button"
              onClick={() => setValue("")}
              className="text-muted hover:text-fg p-0.5"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
