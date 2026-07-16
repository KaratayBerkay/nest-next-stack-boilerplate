"use client";

import { AspectRatio } from "@/components/ui/AspectRatio";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Video 16:9",
    description: "Embed placeholder with 16:9 aspect ratio.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">16:9</h3>
          <AspectRatio ratio={16 / 9} className="bg-surface rounded-md">
            <div className="text-muted flex h-full items-center justify-center text-sm">
              16:9 content area
            </div>
          </AspectRatio>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Square Grid",
    description: "1:1 gallery grid of items.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Square Grid</h3>
          <div className="grid grid-cols-3 gap-2">
            {["A", "B", "C", "D", "E", "F"].map((letter) => (
              <AspectRatio key={letter} ratio={1} className="bg-surface rounded-md">
                <div className="text-muted flex h-full items-center justify-center text-sm font-medium">
                  {letter}
                </div>
              </AspectRatio>
            ))}
          </div>
        </section>
      </div>
    ),
  },
];

export default function AspectRatioPage({ initialTab }: { initialTab?: string }) {
  return (
    <ExampleTabs
      title="Aspect Ratio"
      intro="Displays content within a desired ratio."
      examples={examples}
      initialTab={initialTab}
    />
  );
}
