import { useState, useCallback, useMemo } from "react";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/Command";
import { getLabel } from "./helpers";
import { creatableInitial } from "./data";

export function CreatableTab() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState(creatableInitial);
  const [value, setValue] = useState("");

  const filtered = useMemo(
    () =>
      options.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, options],
  );

  const showCreate =
    query.length > 0 &&
    !options.some(
      (opt) => opt.label.toLowerCase() === query.toLowerCase(),
    );

  const handleCreate = useCallback(() => {
    const newValue = query.toLowerCase().replace(/\s+/g, "-");
    const newOption = { value: newValue, label: query };
    setOptions((prev) => [...prev, newOption]);
    setValue(newValue);
    setOpen(false);
    setQuery("");
  }, [query]);

  const handleSelect = useCallback((itemValue: string) => {
    setValue(itemValue);
    setOpen(false);
    setQuery("");
  }, []);

  const selectedLabel = getLabel(value, options);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Creatable</h3>
        <div className="relative max-w-sm">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="focus-visible:ring-brand flex h-9 w-full items-center justify-between rounded-md border border-border bg-bg px-3 py-1 text-sm text-fg shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <span className="truncate">
              {selectedLabel || "Choose or create a color..."}
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
                  placeholder="Type to search or create..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && showCreate) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCreate();
                    }
                  }}
                />
                <CommandList>
                  {filtered.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={() => handleSelect(item.value)}
                    >
                      {item.label}
                    </CommandItem>
                  ))}
                  {showCreate && (
                    <CommandItem
                      value={`create:${query}`}
                      onSelect={handleCreate}
                    >
                      Add &apos;{query}&apos;&hellip;
                    </CommandItem>
                  )}
                  {!showCreate && filtered.length === 0 && (
                    <div className="py-6 text-center text-sm text-muted">
                      No results
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
