"use client";
import { Empty } from "@/components/ui/Empty";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "components",
    title: "No Search Results",
    description: "Empty state with icon and reset action.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <Empty
            title="No results found"
            description="Try adjusting your search or filters."
          />
        </section>
      </div>
    ),
  },
  {
    id: "examples",
    title: "Empty Inbox",
    description: "Empty state with illustration text and CTA.",
    render: () => <div className="flex flex-col gap-4"></div>,
  },
];

export default function EmptyPage() {
  return (
    <ExampleTabs
      title="Empty"
      intro="An empty state placeholder."
      examples={examples}
    />
  );
}
