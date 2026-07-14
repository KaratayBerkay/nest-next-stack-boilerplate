"use client";

import { useState } from "react";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { VariantGallery } from "@/views/ui/_shared/VariantGallery";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import type { SelectVariant } from "@/types/ui/Select-types";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/Select";

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina",
  "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile",
  "China", "Colombia", "Denmark", "Egypt", "Finland", "France",
  "Germany", "Greece", "India", "Indonesia", "Italy", "Japan",
  "Mexico", "Netherlands", "New Zealand", "Norway", "Poland", "Portugal",
  "South Korea", "Spain", "Sweden", "Switzerland", "Turkey", "United Kingdom",
  "United States",
];

function CountryPickerTab() {
  const [country, setCountry] = useState("");

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <p className="text-muted text-xs">Select your country from the dropdown.</p>
      <Select value={country} onValueChange={setCountry}>
        <SelectTrigger>{country || "Select a country"}</SelectTrigger>
        <SelectContent>
          {countries.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {country && (
        <p className="text-sm text-fg">Selected: {country}</p>
      )}
    </div>
  );
}

function LongListTab() {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <p className="text-muted text-xs">
        37 options with typeahead. Start typing to filter, use ArrowUp/Down, Home/End.
      </p>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>{value || "Choose a country"}</SelectTrigger>
        <SelectContent>
          {countries.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "country-picker",
    title: "Country Picker",
    description: "Select dropdown with value readout and form participation.",
    render: () => <CountryPickerTab />,
  },
  {
    id: "long-list",
    title: "Long List",
    description: "37-option list with typeahead, Home/End, and ArrowUp/Down navigation.",
    render: () => <LongListTab />,
  },
  {
    id: "variant-gallery",
    title: "Variant Gallery",
    description: "All variants and sizes.",
    render: () => (
      <VariantGallery
        variants={["default", "shiny", "glass", "neon", "gradient"]}
        sizes={[]}
        render={(variant) => (
          <Select onValueChange={() => {}}>
            <SelectTrigger variant={variant as SelectVariant}>Option</SelectTrigger>
            <SelectContent>
              <SelectItem value="option">Option</SelectItem>
            </SelectContent>
          </Select>
        )}
      />
    ),
  },
];

export default function Page() {
  return (
    <ExampleTabs
      title="Select"
      intro="A custom select component with dropdown items and typeahead support."
      examples={examples}
    />
  );
}
