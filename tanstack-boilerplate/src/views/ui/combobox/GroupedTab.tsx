import {
  useState,
  useCallback,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";
import { getLabel, getAllItems, renderGroupedItems } from "./helpers";
import { groupedData } from "./data";
import { Command, CommandInput, CommandList } from "@/components/ui/Command";
import { ComboboxTrigger } from "./ComboboxTrigger";

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

export function GroupedTab() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [value, setValue] = useState("");

  const allItems = useMemo(() => getAllItems(groupedData), []);
  const selectedLabel = value ? getLabel(value, allItems) : "";

  const handleSelect = useCallback(
    (itemValue: string) =>
      handleSelectModuleLevel(itemValue, setValue, setOpen, setQuery),
    [setValue, setOpen, setQuery],
  );

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Grouped Options</h3>
        <div className="relative max-w-sm">
          <ComboboxTrigger
            selectedLabel={selectedLabel}
            placeholder="Choose a food item..."
            onToggle={() => setOpen((prev) => !prev)}
          />
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
          <div className="bg-surface border-border flex items-center justify-between rounded border px-3 py-2">
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
