"use client";
import { Spinner } from "@/components/ui/Spinner";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Button Composition",
    description: "Spinner inside loading buttons, size-matched.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Sizes</h3>
          <div className="flex items-center gap-4">
            <Spinner className="size-4" />
            <Spinner className="size-6" />
            <Spinner className="size-8" />
          </div>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Size Scale",
    description: "Spinner at different sizes: sm, md, lg.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Size Scale</h3>
          <div className="flex items-end gap-6">
            <div className="flex flex-col items-center gap-2">
              <Spinner className="size-4" />
              <span className="text-muted text-xs">sm</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Spinner className="size-6" />
              <span className="text-muted text-xs">md</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Spinner className="size-8" />
              <span className="text-muted text-xs">lg</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Spinner className="size-10" />
              <span className="text-muted text-xs">xl</span>
            </div>
          </div>
        </section>
      </div>
    ),
  },
];

export default function SpinnerPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Spinner"
      intro="A loading spinner."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
