"use client";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Combobox } from "@/components/ui/Combobox";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { Spinner } from "@/components/ui/Spinner";
import { CheckboxChip } from "@/components/ui/Checkbox";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/Command";
import type { ComboboxVariant } from "@/types/ui/Combobox-types";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];

const languages = [
  { value: "ts", label: "TypeScript" },
  { value: "js", label: "JavaScript" },
  { value: "py", label: "Python" },
  { value: "go", label: "Go" },
  { value: "rs", label: "Rust" },
];

interface GroupedOption {
  group: string;
  items: { value: string; label: string }[];
}

const groupedData: GroupedOption[] = [
  {
    group: "Fruits",
    items: [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
      { value: "orange", label: "Orange" },
      { value: "grape", label: "Grape" },
      { value: "strawberry", label: "Strawberry" },
      { value: "mango", label: "Mango" },
      { value: "kiwi", label: "Kiwi" },
    ],
  },
  {
    group: "Vegetables",
    items: [
      { value: "carrot", label: "Carrot" },
      { value: "broccoli", label: "Broccoli" },
      { value: "spinach", label: "Spinach" },
      { value: "tomato", label: "Tomato" },
      { value: "potato", label: "Potato" },
      { value: "cucumber", label: "Cucumber" },
    ],
  },
  {
    group: "Grains",
    items: [
      { value: "rice", label: "Rice" },
      { value: "wheat", label: "Wheat" },
      { value: "oats", label: "Oats" },
      { value: "barley", label: "Barley" },
      { value: "quinoa", label: "Quinoa" },
    ],
  },
];

const asyncData = [
  { value: "alice", label: "Alice Johnson" },
  { value: "bob", label: "Bob Smith" },
  { value: "charlie", label: "Charlie Brown" },
  { value: "diana", label: "Diana Prince" },
  { value: "edward", label: "Edward Norton" },
  { value: "fiona", label: "Fiona Apple" },
  { value: "george", label: "George Lucas" },
  { value: "helen", label: "Helen Mirren" },
  { value: "ivan", label: "Ivan Petrov" },
  { value: "julia", label: "Julia Roberts" },
];

const multiData = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "qwik", label: "Qwik" },
  { value: "angular", label: "Angular" },
  { value: "ember", label: "Ember" },
];

const creatableInitial = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "yellow", label: "Yellow" },
  { value: "purple", label: "Purple" },
  { value: "orange", label: "Orange" },
];

function getLabel(
  value: string,
  options: { value: string; label: string }[],
): string {
  return options.find((o) => o.value === value)?.label ?? "";
}

function filterGroups(
  data: GroupedOption[],
  query: string,
): GroupedOption[] {
  if (!query) return data;
  const lower = query.toLowerCase();
  return data
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => i.label.toLowerCase().includes(lower)),
    }))
    .filter((g) => g.items.length > 0);
}

function getAllItems(data: GroupedOption[]): { value: string; label: string }[] {
  return data.flatMap((g) => g.items);
}

function toggleItem(values: string[], item: string): string[] {
  return values.includes(item)
    ? values.filter((v) => v !== item)
    : [...values, item];
}

function ComponentsTab() {
  const [framework, setFramework] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <Combobox
          options={frameworks}
          value={framework}
          onValueChange={setFramework}
          className="max-w-sm"
        />
        {framework && (
          <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
            <span className="text-sm">
              Selected: <strong>{getLabel(framework, frameworks)}</strong>
            </span>
            <button
              type="button"
              onClick={() => setFramework("")}
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

function ExamplesTab() {
  const [language, setLanguage] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Language Selector</h3>
        <Combobox
          options={languages}
          value={language}
          onValueChange={setLanguage}
          className="max-w-sm"
        />
        {language && (
          <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
            <span className="text-sm">
              Selected:{" "}
              <strong>{getLabel(language, languages)}</strong>
            </span>
            <button
              type="button"
              onClick={() => setLanguage("")}
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

function renderGroupedItems(
  data: GroupedOption[],
  query: string,
  onSelect: (value: string) => void,
) {
  const filtered = filterGroups(data, query);
  if (filtered.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted">No results</div>
    );
  }
  return filtered.map((group) => (
    <CommandGroup key={group.group} heading={group.group}>
      {group.items.map((item) => (
        <CommandItem
          key={item.value}
          value={item.value}
          onSelect={() => onSelect(item.value)}
        >
          {item.label}
        </CommandItem>
      ))}
    </CommandGroup>
  ));
}

function GroupedTab() {
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

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function AsyncTab() {
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

  const handleSelect = useCallback((itemValue: string) => {
    setValue(itemValue);
    setOpen(false);
    setQuery("");
  }, []);

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

function MultiSelectTab() {
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

function CreatableTab() {
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

const cities = [
  { value: "istanbul", label: "İstanbul" },
  { value: "ankara", label: "Ankara" },
  { value: "izmir", label: "İzmir" },
  { value: "bursa", label: "Bursa" },
  { value: "antalya", label: "Antalya" },
];

function LocalizedTab() {
  const [city, setCity] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Localized strings</h3>
        <p className="text-muted text-sm">
          Every built-in string is a prop: <code>placeholder</code>,{" "}
          <code>searchPlaceholder</code>, <code>emptyTitle</code>,{" "}
          <code>emptyDescription</code>.
        </p>
        <Combobox
          options={cities}
          value={city}
          onValueChange={setCity}
          placeholder="Şehir seçin..."
          searchPlaceholder="Şehir ara..."
          emptyTitle="Sonuç yok"
          emptyDescription="Aramanızla eşleşen şehir bulunamadı."
          className="max-w-sm"
        />
        {city && (
          <div className="bg-surface rounded border border-border px-3 py-2">
            <span className="text-sm">
              Selected: <strong>{getLabel(city, cities)}</strong>
            </span>
          </div>
        )}
      </section>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Assignee Picker",
    description: "Combobox with people items showing initials avatars.",
    render: () => <ComponentsTab />,
  },
  {
    id: "variants",
    title: "Country Search",
    description: "Large filtered list with search input.",
    render: () => <ExamplesTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "shiny", "glass", "neon", "gradient"]}
        sizes={[]}
        render={(variant, _size) => (
          <Combobox variant={variant as ComboboxVariant} options={[{ value: "opt", label: "Option" }]} />
        )}
      />
    ),
  },
  {
    id: "grouped",
    title: "Grouped Options",
    description: "Combobox with optgroup-style headers for categories.",
    render: () => <GroupedTab />,
  },
  {
    id: "async",
    title: "Async Search",
    description: "Simulated async search with debounce and loading spinner.",
    render: () => <AsyncTab />,
  },
  {
    id: "multi",
    title: "Multi Select",
    description: "Select multiple items with chip display.",
    render: () => <MultiSelectTab />,
  },
  {
    id: "creatable",
    title: "Creatable",
    description: "Type to create new options on the fly.",
    render: () => <CreatableTab />,
  },
  {
    id: "localized",
    title: "Localized",
    description: "Overriding the built-in strings with Turkish copy.",
    render: () => <LocalizedTab />,
  },
];

export default function ComboboxPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Combobox"
      intro="Searchable select with autocomplete."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
