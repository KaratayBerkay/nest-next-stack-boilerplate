"use client";
import { Spinner } from "@/components/ui/Spinner";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "components",
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
    id: "examples",
    title: "Size Scale",
    description: "Spinner at different sizes: sm, md, lg.",
    render: () => <div className="flex flex-col gap-4"></div>,
  },
];

export default function SpinnerPage() {
  return (
    <ExampleTabs
      title="Spinner"
      intro="A loading spinner."
      examples={examples}
    />
  );
}
