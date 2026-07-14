"use client";
import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/Carousel";
import { cn } from "@/lib/cn";
import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

const slides = [
  { label: "Mountain View", gradient: "from-blue-500 to-cyan-400", caption: "Explore the peaks" },
  { label: "Ocean Sunset", gradient: "from-orange-500 to-pink-500", caption: "Coastal serenity" },
  { label: "Forest Trail", gradient: "from-green-600 to-emerald-400", caption: "Into the woods" },
  { label: "City Nights", gradient: "from-indigo-700 to-purple-600", caption: "Urban lights" },
  { label: "Desert Dunes", gradient: "from-amber-600 to-yellow-400", caption: "Endless horizons" },
];

function Dots({ total, active }: { total: number; active: number }) {
  return (
    <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full transition-all duration-300",
            i === active ? "size-1.5 bg-fg w-4" : "size-1.5 bg-fg/40",
          )}
        />
      ))}
    </div>
  );
}

function CarouselWithDots() {
  const [activeIndex] = useState(0);

  return (
    <Carousel
      className="relative w-full"
      opts={{ startIndex: 0, loop: true }}
    >
      <div className="relative overflow-hidden rounded-xl aspect-video">
        <CarouselContent>
          {slides.map((slide, i) => (
            <CarouselItem key={i}>
              <div
                className={cn(
                  "flex h-full w-full items-end bg-gradient-to-br p-6",
                  slide.gradient,
                )}
                style={{ minHeight: "200px" }}
              >
                <div className="rounded-lg bg-black/30 p-4 backdrop-blur-sm">
                  <p className="text-lg font-semibold text-white">{slide.label}</p>
                  <p className="text-sm text-white/80">{slide.caption}</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <Dots total={slides.length} active={activeIndex} />
      </div>
    </Carousel>
  );
}

function ThumbnailStrip() {
  return (
    <Carousel className="relative w-full" opts={{ startIndex: 0, loop: true }}>
      <div className="relative overflow-hidden rounded-lg">
        <CarouselContent>
          {slides.map((slide, i) => (
            <CarouselItem key={i} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
              <div className={cn("h-16 rounded-md bg-gradient-to-br", slide.gradient)} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="from-bg pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r to-transparent" />
        <div className="from-bg pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l to-transparent" />
      </div>
    </Carousel>
  );
}

const examples: UIExample[] = [
  {
    id: "usage",
    title: "Hero Carousel",
    description: "Full-width carousel with gradient slides, dot indicators, and inset nav.",
    render: () => (
      <div className="flex flex-col gap-4">
        <CarouselWithDots />
      </div>
    ),
  },
  {
    id: "variants",
    title: "Thumbnail Strip",
    description: "Horizontal thumbnail strip with scroll-fade edges.",
    render: () => (
      <div className="flex flex-col gap-4">
        <ThumbnailStrip />
      </div>
    ),
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
