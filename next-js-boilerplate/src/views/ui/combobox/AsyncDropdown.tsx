import { Spinner } from "@/components/ui/Spinner";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/Command";

interface AsyncDropdownProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: { value: string; label: string }[];
  loading: boolean;
  debouncedQuery: string;
  onSelect: (value: string) => void;
}

export function AsyncDropdown({
  query,
  onQueryChange,
  results,
  loading,
  debouncedQuery,
  onSelect,
}: AsyncDropdownProps) {
  return (
    <div className="bg-bg border-border absolute z-50 mt-1 w-full rounded-lg border p-1 shadow-lg">
      <Command>
        <CommandInput
          placeholder="Type to search..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <CommandList>
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Spinner size="sm" />
            </div>
          )}
          {!loading &&
            results.length > 0 &&
            results.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={() => onSelect(item.value)}
              >
                {item.label}
              </CommandItem>
            ))}
          {!loading && debouncedQuery && results.length === 0 && (
            <div className="text-muted py-6 text-center text-sm">
              No results
            </div>
          )}
          {!loading && !debouncedQuery && (
            <div className="text-muted py-6 text-center text-sm">
              Start typing to search...
            </div>
          )}
        </CommandList>
      </Command>
    </div>
  );
}
