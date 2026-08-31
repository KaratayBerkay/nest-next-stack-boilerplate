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
    titleKey: "feature244Slide1Title",
    bodyKey: "feature244Slide1Body",
    altKey: "feature244Slide1ImageAlt",
    src: "/img/placeholders/ph-4x3-6.webp",
  },
  {
    titleKey: "feature244Slide2Title",
    bodyKey: "feature244Slide2Body",
    altKey: "feature244Slide2ImageAlt",
    src: "/img/placeholders/ph-4x3-7.webp",
  },
  {
    titleKey: "feature244Slide3Title",
    bodyKey: "feature244Slide3Body",
    altKey: "feature244Slide3ImageAlt",
    src: "/img/placeholders/ph-4x3-1.webp",
  },
  {
    titleKey: "feature244Slide4Title",
    bodyKey: "feature244Slide4Body",
    altKey: "feature244Slide4ImageAlt",
    src: "/img/placeholders/ph-4x3-3.webp",
  },
] as const;

function handleSelect(
  setSelectedIndex: Dispatch<SetStateAction<number>>,
): (index: number | SyntheticEvent) => void {
  return (index: number | SyntheticEvent) => {
    if (typeof index === "number") {
      setSelectedIndex(index);
    }
  };
}

export function DottedFrameCarouselFeature() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature244Heading}
          </h2>
          <p className="text-muted">{f.feature244Intro}</p>
        </div>
        <div className="border-border mt-12 rounded-xl border-2 border-dotted p-3 sm:p-5">
          <Carousel
            opts={CAROUSEL_OPTS}
            onSelect={handleSelect(setSelectedIndex)}
          >
            <CarouselContent>
              {SLIDES.map((slide) => (
                <CarouselItem key={slide.titleKey}>
                  <div className="border-border bg-surface overflow-hidden rounded-lg border shadow-sm">
                    <div className="relative">
                      <Image
                        src={slide.src}
                        alt={f[slide.altKey]}
                        width={800}
                        height={600}
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 p-6">
                      <h3 className="text-fg text-lg font-semibold">
                        {f[slide.titleKey]}
                      </h3>
                      <p className="text-muted text-sm leading-relaxed">
                        {f[slide.bodyKey]}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious aria-label={f.feature244PrevAria} />
            <CarouselNext aria-label={f.feature244NextAria} />
          </Carousel>
          <div className="mt-5 flex items-center justify-center gap-3">
            {SLIDES.map((slide, index) => (
              <span
                key={slide.titleKey}
                className={`h-1.5 rounded-full transition-all ${
                  index === selectedIndex ? "bg-brand w-6" : "bg-border w-1.5"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
