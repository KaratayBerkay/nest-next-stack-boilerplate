"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/Carousel";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Product Gallery",
    description: "Carousel with dot indicators and navigation.",
    render: () => (
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold">Default</h3>
          <Carousel className="max-w-sm">
            <CarouselContent>
              {[1, 2, 3, 4, 5].map((i) => (
                <CarouselItem key={i}>
                  <div className="bg-surface flex h-32 items-center justify-center rounded-md">
                    {i}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Thumbnail Strip",
    description: "Horizontal thumbnail strip carousel.",
    render: () => <div className="flex flex-col gap-4" />,
  },
];

export default function CarouselPage() {
  return (
    <ExampleTabs
      title="Carousel"
      intro="A carousel with motion and swipe."
      examples={examples}
    />
  );
}
