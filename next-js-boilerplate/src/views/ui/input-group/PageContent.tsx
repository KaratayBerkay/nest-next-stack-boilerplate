"use client";
import { InputGroup } from "@/components/ui/InputGroup";
import { Input } from "@/components/ui/Input";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "URL Prefix",
    description: "Input with a https:// addon prefix.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <InputGroup>
            <Input placeholder="Search..." />
            <button className="bg-brand rounded px-4 py-2 text-sm text-brand-fg">
              Go
            </button>
          </InputGroup>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Search + Submit",
    description: "Input attached to a button in a single row.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Search + Submit</h3>
          <InputGroup>
            <Input placeholder="Search products, docs, and more..." />
            <button className="bg-brand text-brand-fg rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="inline"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span className="ml-1">Search</span>
            </button>
          </InputGroup>
        </section>
      </div>
    ),
  },
];

export default function InputGroupPage({
  initialTab,
}: {
  initialTab?: string;
}) {
  return (
    <ExampleTabs
      title="Input Group"
      intro="A group of related inputs."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
