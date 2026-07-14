"use client";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/Collapsible";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Read More",
    description: "Collapsible section for truncated paragraph content.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <Collapsible className="max-w-sm">
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              Toggle content
            </CollapsibleTrigger>
            <CollapsibleContent className="text-muted mt-2 text-sm">
              Collapsible content area.
            </CollapsibleContent>
          </Collapsible>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Sidebar Groups",
    description: "Navigation section with collapsible group headers.",
    render: () => <div className="flex flex-col gap-4"></div>,
  },
];

export default function CollapsiblePage() {
  return (
    <ExampleTabs
      title="Collapsible"
      intro="An interactive component that expands/collapses."
      examples={examples}
    />
  );
}
