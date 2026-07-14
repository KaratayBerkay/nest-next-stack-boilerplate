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
            <button className="bg-brand rounded px-4 py-2 text-sm text-white">
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
    render: () => <div className="flex flex-col gap-4"></div>,
  },
];

export default function InputGroupPage() {
  return (
    <ExampleTabs
      title="Input Group"
      intro="A group of related inputs."
      examples={examples}
    />
  );
}
