"use client";
import { useState } from "react";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function ComponentsTab() {
  const [fruit, setFruit] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <NativeSelect
          className="max-w-sm"
          value={fruit}
          onChange={(e) => setFruit(e.target.value)}
        >
          <option value="">Select a fruit...</option>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="cherry">Cherry</option>
        </NativeSelect>
        {fruit && (
          <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
            <span className="text-sm">
              Selected: <strong>{fruit}</strong>
            </span>
            <button
              type="button"
              onClick={() => setFruit("")}
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
  const [country, setCountry] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Country Selector</h3>
        <NativeSelect
          className="max-w-sm"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="">Select a country...</option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="de">Germany</option>
          <option value="tr">Turkey</option>
        </NativeSelect>
        {country && (
          <div className="bg-surface flex items-center justify-between rounded border border-border px-3 py-2">
            <span className="text-sm">
              Selected: <strong>{country.toUpperCase()}</strong>
            </span>
            <button
              type="button"
              onClick={() => setCountry("")}
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
    title: "Country Picker",
    description: "Native select with a long list, chevron indicator, and RTL check.",
    render: () => <ComponentsTab />,
  },
  {
    id: "examples",
    title: "Inline Sort Order",
    description: "Compact native select paired with a label.",
    render: () => <ExamplesTab />,
  },
];

export default function NativeSelectPage() {
  return (
    <ExampleTabs
      title="Native Select"
      intro="A native HTML select element."
      examples={examples}
    />
  );
}
