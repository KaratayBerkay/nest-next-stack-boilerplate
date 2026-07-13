import { Suspense } from "react";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";
import { SelectDemo } from "./SelectDemo";

const examples: UIExample[] = [
  {
    id: "components",
    title: "Country Picker",
    description: "Select dropdown with value readout and form participation.",
    render: () => (
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading...</p>}>
        <SelectDemo />
      </Suspense>
    ),
  },
  {
    id: "examples",
    title: "Long List",
    description: "50-option list with typeahead, Home/End, and ArrowUp/Down navigation.",
    render: () => <p className="text-muted text-sm">Coming soon.</p>,
  },
];

export default function Page() {
  return (
    <ExampleTabs
      title="Select"
      intro="A custom select component with dropdown items."
      examples={examples}
    />
  );
}
