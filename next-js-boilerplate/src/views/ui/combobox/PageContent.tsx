"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import { ComponentsTab } from "./ComponentsTab";
import { ExamplesTab } from "./ExamplesTab";
import { GroupedTab } from "./GroupedTab";
import { AsyncTab } from "./AsyncTab";
import { MultiSelectTab } from "./MultiSelectTab";
import { CreatableTab } from "./CreatableTab";
import { LocalizedTab } from "./LocalizedTab";
import { Combobox } from "@/components/ui/Combobox";
import type { ComboboxVariant } from "@/types/ui/Combobox-types";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Assignee Picker",
    description: "Assign an item to a teammate from a searchable people list.",
    render: () => <ComponentsTab />,
  },
  {
    id: "variants",
    title: "Country Search",
    description: "Searchable list of world countries.",
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
          <Combobox
            variant={variant as ComboboxVariant}
            options={[{ value: "opt", label: "Option" }]}
          />
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
