import { useState, useMemo } from "react";
import { getLabel } from "./helpers";
import { creatableInitial } from "./data";
import { ComboboxTrigger } from "./ComboboxTrigger";
import { SelectedItem } from "./SelectedItem";
import { CreatableDropdown } from "./CreatableDropdown";

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
    !options.some((opt) => opt.label.toLowerCase() === query.toLowerCase());

  const selectedLabel = getLabel(value, options);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Creatable</h3>
        <div className="relative max-w-sm">
          <ComboboxTrigger
            selectedLabel={selectedLabel}
            placeholder="Choose or create a color..."
            onToggle={() => setOpen((prev) => !prev)}
          />
          {open && (
            <CreatableDropdown
              query={query}
              onQueryChange={setQuery}
              filtered={filtered}
              showCreate={showCreate}
              onSelect={(itemValue) => {
                setValue(itemValue);
                setOpen(false);
                setQuery("");
              }}
              onCreate={() => {
                const newValue = query.toLowerCase().replace(/\s+/g, "-");
                setOptions((prev) => [...prev, { value: newValue, label: query }]);
                setValue(newValue);
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
