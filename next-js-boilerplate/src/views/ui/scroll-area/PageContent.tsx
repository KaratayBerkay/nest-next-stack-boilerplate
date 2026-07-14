"use client";

import { ScrollArea } from "@/components/ui/ScrollArea";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Chat Pane",
    description: "Fixed-height message list with themed scroll thumb.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <ScrollArea className="border-border h-32 max-w-sm rounded-md border p-2">
            <div className="space-y-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <p key={i} className="text-sm">
                  Item {i + 1}
                </p>
              ))}
            </div>
          </ScrollArea>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Horizontal Tags",
    description: "Horizontal scrollable row of tag chips.",
    render: () => (
      <div className="flex flex-col gap-4"></div>
    ),
  },
];

export default function ScrollAreaPage() {
  return (
    <ExampleTabs
      title="Scroll Area"
      intro="A custom scroll area."
      examples={examples}
    />
  );
}
