"use client";
import { useState } from "react";
import { Combobox } from "@/components/ui/Combobox";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
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

function getLabel(
  value: string,
  options: { value: string; label: string }[],
): string {
  return options.find((o) => o.value === value)?.label ?? "";
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

const examples: UIExample[] = [
  {
    id: "components",
    title: "Assignee Picker",
    description: "Combobox with people items showing initials avatars.",
    render: () => <ComponentsTab />,
  },
  {
    id: "examples",
    title: "Country Search",
    description: "Large filtered list with search input.",
    render: () => <ExamplesTab />,
  },
];

export default function ComboboxPage() {
  return (
    <ExampleTabs
      title="Combobox"
      intro="Searchable select with autocomplete."
      examples={examples}
    />
  );
}
