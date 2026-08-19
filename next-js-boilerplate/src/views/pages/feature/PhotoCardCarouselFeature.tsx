"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction, SyntheticEvent } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { PagesWithFeatureMessages } from "@/types/pages/feature/FeatureMessages-types";

const CAROUSEL_OPTS = { align: "start", loop: true } as const;

const SLIDES = [
  {
    titleKey: "feature224Card1Title",
    captionKey: "feature224Card1Caption",
    altKey: "feature224Card1ImageAlt",
    src: "https://picsum.photos/seed/feature224-solo/800/600",
  },
  {
    titleKey: "feature224Card2Title",
    captionKey: "feature224Card2Caption",
    altKey: "feature224Card2ImageAlt",
    src: "https://picsum.photos/seed/feature224-growth/800/600",
  },
  {
    titleKey: "feature224Card3Title",
    captionKey: "feature224Card3Caption",
    altKey: "feature224Card3ImageAlt",
    src: "https://picsum.photos/seed/feature224-ops/800/600",
  },
  {
    titleKey: "feature224Card4Title",
    captionKey: "feature224Card4Caption",
    altKey: "feature224Card4ImageAlt",
    src: "https://picsum.photos/seed/feature224-research/800/600",
  },
  {
    titleKey: "feature224Card5Title",
    captionKey: "feature224Card5Caption",
    altKey: "feature224Card5ImageAlt",
    src: "https://picsum.photos/seed/feature224-launch/800/600",
  },
  {
    titleKey: "feature224Card6Title",
    captionKey: "feature224Card6Caption",
    altKey: "feature224Card6ImageAlt",
    src: "https://picsum.photos/seed/feature224-remote/800/600",
  },
] as const;

const IMAGE_SIZES = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw";

function handleSelect(
  setSelectedIndex: Dispatch<SetStateAction<number>>,
): (index: number | SyntheticEvent) => void {
  return (index: number | SyntheticEvent) => {
    if (typeof index === "number") {
      setSelectedIndex(index);
    }
  };
}

export function PhotoCardCarouselFeature() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
              {f.feature224Heading}
            </h2>
            <p className="text-muted">{f.feature224Intro}</p>
          </div>
          <span className="text-muted text-sm tabular-nums">
            {String(selectedIndex + 1).padStart(2, "0")}
            <span className="mx-1">/</span>
            {String(SLIDES.length).padStart(2, "0")}
          </span>
        </div>
        <div className="mt-12">
          <Carousel
            opts={CAROUSEL_OPTS}
            onSelect={handleSelect(setSelectedIndex)}
          >
            <CarouselContent>
              {SLIDES.map((slide) => (
                <CarouselItem
                  key={slide.titleKey}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="border-border bg-surface flex h-full flex-col overflow-hidden rounded-xl border shadow-sm">
                    <Image
                      src={slide.src}
                      alt={f[slide.altKey]}
                      width={800}
                      height={600}
                      sizes={IMAGE_SIZES}
                      className="aspect-[4/3] h-auto w-full object-cover"
                    />
                    <div className="flex flex-col gap-1.5 p-5">
                      <h3 className="text-fg text-lg font-semibold">
                        {f[slide.titleKey]}
                      </h3>
                      <p className="text-muted text-sm leading-relaxed">
                        {f[slide.captionKey]}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious aria-label={f.feature224PrevAria} />
            <CarouselNext aria-label={f.feature224NextAria} />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
