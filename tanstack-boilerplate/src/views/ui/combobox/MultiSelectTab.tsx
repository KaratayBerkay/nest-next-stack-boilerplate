import {
  useState,
  useCallback,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";
import { CheckboxChip } from "@/components/ui/Checkbox";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/Command";
import { toggleItem } from "./helpers";
import { multiData } from "./data";
import { ComboboxTrigger } from "./ComboboxTrigger";

function handleSelectModuleLevel(
  itemValue: string,
  setSelected: Dispatch<SetStateAction<string[]>>,
) {
  setSelected((prev) => toggleItem(prev, itemValue));
}

function handleRemoveModuleLevel(
  val: string,
  setSelected: Dispatch<SetStateAction<string[]>>,
) {
  setSelected((prev) => prev.filter((v) => v !== val));
}

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

  const handleSelect = useCallback(
    (itemValue: string) => handleSelectModuleLevel(itemValue, setSelected),
    [setSelected],
  );

  const handleRemove = useCallback(
    (val: string) => handleRemoveModuleLevel(val, setSelected),
    [setSelected],
  );

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
          <ComboboxTrigger
            selectedLabel={
              selected.length > 0 ? `${selected.length} selected` : ""
            }
            placeholder="Select frameworks..."
            onToggle={() => setOpen((prev) => !prev)}
          />
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
                    <div className="text-muted py-6 text-center text-sm">
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
