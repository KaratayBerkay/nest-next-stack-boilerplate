import { useState, useEffect, useCallback } from "react";
import { getLabel } from "./helpers";
import { asyncData } from "./data";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { ComboboxTrigger } from "./ComboboxTrigger";
import { SelectedItem } from "./SelectedItem";
import { AsyncDropdown } from "./AsyncDropdown";

export function AsyncTab() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ value: string; label: string }[]>(
    [],
  );
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

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Async Search</h3>
        <div className="relative max-w-sm">
          <ComboboxTrigger
            selectedLabel={selectedLabel}
            placeholder="Search users..."
            onToggle={() => setOpen((prev) => !prev)}
          />
          {open && (
            <AsyncDropdown
              query={query}
              onQueryChange={setQuery}
              results={results}
              loading={loading}
              debouncedQuery={debouncedQuery}
              onSelect={(itemValue) => {
                setValue(itemValue);
                setOpen(false);
                setQuery("");
              }}
            />
          )}
        </div>
        {value && (
          <SelectedItem
            selectedLabel={selectedLabel}
            onClear={() => setValue("")}
          />
        )}
      </section>
    </div>
  );
}
