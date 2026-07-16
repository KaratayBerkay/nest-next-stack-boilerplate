"use client";
import { Empty } from "@/components/ui/Empty";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "usage",
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
    id: "variants",
    title: "Empty Inbox",
    description: "Empty state with illustration text and CTA.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">With Icon</h3>
          <Empty
            icon={
              <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z" />
              </svg>
            }
            title="No new messages"
            description="Your inbox is empty. Start a conversation to see messages here."
          />
        </section>
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">With Action</h3>
          <Empty
            title="No items yet"
            description="Get started by creating your first item."
            action={
              <button
                type="button"
                className="bg-brand text-brand-fg hover:bg-brand/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
              >
                Create Item
              </button>
            }
          />
        </section>
      </div>
    ),
  },
];

export default function EmptyPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Empty"
      intro="An empty state placeholder."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
