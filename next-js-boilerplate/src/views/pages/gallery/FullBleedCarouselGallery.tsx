"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@/components/ui/carousel";
import { cn } from "@/lib/cn";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import { placeholderImage } from "@/views/pages/_shared/placeholder-image";
import type {
  GalleryBlocksMessages,
  PagesWithGalleryBlocksMessages,
} from "@/types/pages/gallery/GalleryBlocksMessages-types";

const CAROUSEL_OPTS = { loop: true } as const;

interface SlidePhoto {
  id: string;
  seed: string;
  titleKey: string;
  locationKey: string;
}

const SLIDES: SlidePhoto[] = [
  {
    id: "open-studio-day",
    seed: "gallery5-open-studio-day",
    titleKey: "galleryBlocks5Slide1Title",
    locationKey: "galleryBlocks5Slide1Location",
  },
  {
    id: "assembly-line",
    seed: "gallery5-assembly-line",
    titleKey: "galleryBlocks5Slide2Title",
    locationKey: "galleryBlocks5Slide2Location",
  },
  {
    id: "harvest-crew",
    seed: "gallery5-harvest-crew",
    titleKey: "galleryBlocks5Slide3Title",
    locationKey: "galleryBlocks5Slide3Location",
  },
  {
    id: "night-market",
    seed: "gallery5-night-market",
    titleKey: "galleryBlocks5Slide4Title",
    locationKey: "galleryBlocks5Slide4Location",
  },
  {
    id: "dockside-repairs",
    seed: "gallery5-dockside-repairs",
    titleKey: "galleryBlocks5Slide5Title",
    locationKey: "galleryBlocks5Slide5Location",
  },
  {
    id: "rooftop-garden",
    seed: "gallery5-rooftop-garden",
    titleKey: "galleryBlocks5Slide6Title",
    locationKey: "galleryBlocks5Slide6Location",
  },
];

function DotIndicators({ gb }: { gb: GalleryBlocksMessages }) {
  const { selectedIndex, scrollTo } = useCarousel();

  return (
    <div className="mt-5 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {SLIDES.map((slide, index) => {
          const active = index === selectedIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => scrollTo(index)}
              aria-current={active ? "true" : undefined}
              aria-label={gb.galleryBlocks5DotAriaTemplate.replace(
                "{index}",
                String(index + 1),
              )}
              className={cn(
                "h-2 rounded-full transition-all",
                active ? "bg-brand w-6" : "bg-fg/20 hover:bg-fg/40 w-2",
              )}
            />
          );
        })}
      </div>
      <span className="text-muted text-xs tabular-nums">
        {gb.galleryBlocks5CounterTemplate
          .replace("{current}", String(selectedIndex + 1))
          .replace("{total}", String(SLIDES.length))}
      </span>
    </div>
  );
}

export function FullBleedCarouselGallery() {
  const t = useMessages("pages") as unknown as PagesWithGalleryBlocksMessages;
  const gb = t.galleryBlocks;

  return (
    <section className="w-full py-16 lg:py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="text-brand text-xs font-semibold tracking-wide uppercase">
            {gb.galleryBlocks5Eyebrow}
          </span>
          <h2 className="text-fg text-3xl font-semibold tracking-tight lg:text-4xl">
            {gb.galleryBlocks5Heading}
          </h2>
          <p className="text-muted">{gb.galleryBlocks5Intro}</p>
        </div>

        <Carousel opts={CAROUSEL_OPTS} className="mt-10">
          <CarouselContent>
            {SLIDES.map((slide) => (
              <CarouselItem key={slide.id}>
                <div className="border-border bg-surface relative aspect-[2/1] overflow-hidden rounded-3xl border">
                  <Image
                    src={placeholderImage(slide.seed, "2x1")}
                    alt={gb[slide.titleKey]}
                    fill
                    sizes="(min-width: 1024px) 1024px, 100vw"
                    className="object-cover"
                  />
                  <div className="from-fg/80 absolute inset-0 flex flex-col justify-end gap-1 bg-gradient-to-t via-transparent to-transparent p-6 sm:p-8">
                    <span className="text-bg text-lg font-semibold sm:text-xl">
                      {gb[slide.titleKey]}
                    </span>
                    <span className="text-bg/80 text-sm">
                      {gb[slide.locationKey]}
                    </span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious aria-label={gb.galleryBlocks5PrevAria} />
          <CarouselNext aria-label={gb.galleryBlocks5NextAria} />
          <DotIndicators gb={gb} />
        </Carousel>
      </div>
    </section>
  );
}
