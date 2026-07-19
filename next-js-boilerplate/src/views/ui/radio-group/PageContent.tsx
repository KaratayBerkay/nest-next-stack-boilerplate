"use client";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

function ComponentsTab() {
  const [plan, setPlan] = useState("pro");

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Default</h3>
        <RadioGroup value={plan} onValueChange={setPlan}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="a" id="a" />
            <label htmlFor="a">Option A</label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="b" id="b" />
            <label htmlFor="b">Option B</label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="c" id="c" />
            <label htmlFor="c">Option C</label>
          </div>
        </RadioGroup>
        <div className="bg-surface border-border flex items-center justify-between rounded border px-3 py-2">
          <span className="text-sm">
            Selected: <strong>{plan.toUpperCase()}</strong>
          </span>
          <button
            type="button"
            onClick={() => setPlan("a")}
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
      </section>
    </div>
  );
}

function ExamplesTab() {
  const [theme, setTheme] = useState("dark");

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Theme Selection</h3>
        <div className="surface max-w-sm space-y-4 p-4">
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="space-y-3"
          >
            {[
              {
                value: "light",
                label: "Light",
                desc: "Bright, clean interface",
              },
              { value: "dark", label: "Dark", desc: "Easy on the eyes" },
              {
                value: "system",
                label: "System",
                desc: "Follow OS preference",
              },
            ].map((t) => (
              <label
                key={t.value}
                htmlFor={`theme-${t.value}`}
                className="has-[:checked]:border-brand has-[:checked]:bg-brand/5 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
              >
                <RadioGroupItem
                  value={t.value}
                  id={`theme-${t.value}`}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="text-muted text-xs">{t.desc}</div>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>
        <div className="bg-surface border-border flex max-w-sm items-center justify-between rounded border px-3 py-2">
          <span className="text-sm">
            Selected theme: <strong>{theme}</strong>
          </span>
          <button
            type="button"
            onClick={() => setTheme("dark")}
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
      </section>
    </div>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Payment Method",
    description: "Card-style radio options with descriptions for each choice.",
    render: () => <ComponentsTab />,
  },
  {
    id: "variants",
    title: "Plan Tiers",
    description: "Pricing plan selection with radio buttons.",
    render: () => <ExamplesTab />,
  },
];

export default function RadioGroupPage({
  initialTab,
}: {
  initialTab?: string;
}) {
  return (
    <ExampleTabs
      title="Radio Group"
      intro="A set of radio buttons."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
