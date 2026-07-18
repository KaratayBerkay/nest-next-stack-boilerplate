import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/Command";
import { getLabel } from "./helpers";
import { asyncData } from "./data";
import { useDebounce } from "@/hooks/ui/useDebounce";

function handleSelectModuleLevel(
  itemValue: string,
  setValue: Dispatch<SetStateAction<string>>,
  setOpen: Dispatch<SetStateAction<boolean>>,
  setQuery: Dispatch<SetStateAction<string>>,
) {
  setValue(itemValue);
  setOpen(false);
  setQuery("");
}

export function AsyncTab() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ value: string; label: string }[]>([]);
  const [value, setValue] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const loading = debouncedQuery.length > 0 && results.length === 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(
        debouncedQuery
          ? asyncData.filter((item) =>
              item.label.toLowerCase().includes(debouncedQuery.toLowerCase()),
            )
          : [],
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [debouncedQuery]);

  const selectedLabel = getLabel(value, asyncData);

  const handleSelect = useCallback(
    (itemValue: string) => handleSelectModuleLevel(itemValue, setValue, setOpen, setQuery),
    [setValue, setOpen, setQuery],
  );

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Async Search</h3>
        <div className="relative max-w-sm">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="focus-visible:ring-brand flex h-9 w-full items-center justify-between rounded-md border border-border bg-bg px-3 py-1 text-sm text-fg shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <span className="truncate">
              {selectedLabel || "Search users..."}
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
                  placeholder="Type to search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <CommandList>
                  {loading && (
                    <div className="flex items-center justify-center py-6">
                      <Spinner size="sm" />
                    </div>
                  )}
                  {!loading && results.length > 0 && results.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={() => handleSelect(item.value)}
                    >
                      {item.label}
                    </CommandItem>
                  ))}
                  {!loading && debouncedQuery && results.length === 0 && (
                    <div className="py-6 text-center text-sm text-muted">
                      No results
                    </div>
                  )}
                  {!loading && !debouncedQuery && (
                    <div className="py-6 text-center text-sm text-muted">
                      Start typing to search...
                    </div>
                  )}
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
