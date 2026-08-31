"use client";

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
    id: "reach",
    src: "/img/placeholders/ph-2x1-1.webp",
    titleKey: "feature140Slide1Title",
    bodyKey: "feature140Slide1Body",
    altKey: "feature140Slide1ImageAlt",
  },
  {
    id: "engage",
    src: "/img/placeholders/ph-2x1-4.webp",
    titleKey: "feature140Slide2Title",
    bodyKey: "feature140Slide2Body",
    altKey: "feature140Slide2ImageAlt",
  },
  {
    id: "convert",
    src: "/img/placeholders/ph-2x1-6.webp",
    titleKey: "feature140Slide3Title",
    bodyKey: "feature140Slide3Body",
    altKey: "feature140Slide3ImageAlt",
  },
] as const;

export function FullBleedSlideCarouselFeature() {
  const t = useMessages("pages") as unknown as PagesWithFeatureMessages;
  const f = t.feature;

  return (
    <section className="w-full py-16 lg:py-24">
      <Carousel opts={CAROUSEL_OPTS} className="w-full">
        <div className="mb-8 mx-auto flex max-w-6xl items-center justify-between px-6 lg:px-8">
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {f.feature140Heading}
          </h2>
          <div className="hidden gap-2 sm:flex">
            <CarouselPrevious
              aria-label={f.feature140PrevAria}
              className="static translate-y-0"
            />
            <CarouselNext
              aria-label={f.feature140NextAria}
              className="static translate-y-0"
            />
          </div>
        </div>
        <CarouselContent className="-ml-0 px-6 lg:px-8">
          {SLIDES.map((slide) => (
            <CarouselItem
              key={slide.id}
              className="pl-0 md:basis-4/5 lg:basis-3/5"
            >
              <div className="relative overflow-hidden rounded-2xl">
                <Image
                  src={slide.src}
                  alt={f[slide.altKey]}
                  width={1200}
                  height={600}
                  className="aspect-[2/1] w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-6">
                  <h3 className="text-lg font-semibold text-white">
                    {f[slide.titleKey]}
                  </h3>
                  <p className="max-w-md text-sm text-white/80">
                    {f[slide.bodyKey]}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
