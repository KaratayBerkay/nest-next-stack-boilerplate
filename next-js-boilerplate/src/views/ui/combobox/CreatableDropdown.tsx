import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/Command";

interface CreatableDropdownProps {
  query: string;
  onQueryChange: (value: string) => void;
  filtered: { value: string; label: string }[];
  showCreate: boolean;
  onSelect: (value: string) => void;
  onCreate: () => void;
}

export function CreatableDropdown({
  query,
  onQueryChange,
  filtered,
  showCreate,
  onSelect,
  onCreate,
}: CreatableDropdownProps) {
  return (
    <div className="bg-bg border-border absolute z-50 mt-1 w-full rounded-lg border p-1 shadow-lg">
      <Command>
        <CommandInput
          placeholder="Type to search or create..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && showCreate) {
              e.preventDefault();
              e.stopPropagation();
              onCreate();
            }
          }}
        />
        <CommandList>
          {filtered.map((item) => (
            <CommandItem
              key={item.value}
              value={item.value}
              onSelect={() => onSelect(item.value)}
            >
              {item.label}
            </CommandItem>
          ))}
          {showCreate && (
            <CommandItem
              value={`create:${query}`}
              onSelect={onCreate}
            >
              Add &apos;{query}&apos;&hellip;
            </CommandItem>
          )}
          {!showCreate && filtered.length === 0 && (
            <div className="text-muted py-6 text-center text-sm">
              No results
            </div>
          )}
        </CommandList>
      </Command>
    </div>
  );
}
